import express from "express";
import { AppController } from "../domain/AppController";

/**
 * Constructs an Express router for handling application API calls
 * We use a function so we can easily supply dependencies to the
 * handler, making testing easier.
 * @returns
 */
export function linkApi(app: AppController): express.Router {
    // Construct a router object
    const router = express();

    // Adds a handler for returning the graph. By default express does not
    // understand async code, but we can easily adapt Express by calling
    // a promise based handler and if it fails catching the error and
    // supplying it with `next` to allow Express to handle the error.
    router.get("/api/links", (req, res, next) => getLinks(req, res).catch(next));

    /**
     * Handler that creates an invoice
     * @param req
     * @param res
     */
    async function getLinks(req: express.Request, res: express.Response) {
        res.json(app.chain);
    }

    return router;
}
