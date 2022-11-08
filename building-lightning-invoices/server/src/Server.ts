import path from "path";
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import serveStatic from "serve-static";

import { Options } from "./Options";
import { SocketServer } from "./SocketServer";
import { LndInvoiceDataMapper } from "./data/lnd/LndInvoiceDataMapper";
import { LndRpcClient } from "./data/lnd/v0.12.1-beta/LndRpcClient";
import { AppController } from "./domain/AppController";
import { LndMessageSigner } from "./data/lnd/LndMessageSigner";
import { Link } from "./domain/Link";
import { LinkFactory } from "./domain/LinkFactory";
import { invoiceApi } from "./api/InvoiceApi";
import { linkApi } from "./api/LinkApi";

/**
 * Entry point for our application. This is responsible for setting up
 * the dependency graph and constructing the application. As this code
 * gets more complicated it can be broken into various pieces so we
 * no longer violate the single responsibility principle.
 */
async function run() {
    // construct the options
    const options = await Options.fromEnv();

    // construction the server
    const app: express.Express = express();

    // mount json and compression middleware
    app.use(bodyParser.json());
    app.use(compression());

    // mount public endpoints for our app
    app.use("/public", serveStatic(path.join(__dirname, "../public")));
    app.use("/public/app", serveStatic(path.join(__dirname, "../../client/dist/app")));
    app.use("/public/css", serveStatic(path.join(__dirname, "../../style/dist/css")));

    // mount the root to render our default webpage which will load the react app
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/index.html"));
    });

    const lndRpcClient = new LndRpcClient(
        options.lndRpcHost,
        options.lndAdminMacaroon,
        options.lndCert,
    );

    const lndInvoiceDataMapper = new LndInvoiceDataMapper(lndRpcClient);
    const lndMessageSigner = new LndMessageSigner(lndRpcClient);
    const linkFactory = new LinkFactory(lndMessageSigner);
    const appController = new AppController(lndInvoiceDataMapper, lndMessageSigner, linkFactory);

    // start the application logic
    await appController.start(
        "0000000000000000000000000000000000000000000000000000000000000001",
        1000,
    );

    // mount our API routers
    app.use(linkApi(appController));
    app.use(invoiceApi(appController));

    // start the server on the port
    const server = app.listen(Number(options.port), () => {
        console.log(`server listening on ${options.port}`);
    });

    // construct the socket server
    const socketServer = new SocketServer();

    // start listening for http connections using the http server
    socketServer.listen(server);

    // broadcast updates to the client
    appController.listener = (links: Link[]) => socketServer.broadcast("links", links);
}

run().catch(ex => {
    console.error(ex);
    process.exit(1);
});
