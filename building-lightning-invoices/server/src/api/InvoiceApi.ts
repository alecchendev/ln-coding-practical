import express from "express";
import { AppController } from "../domain/AppController";
import { isCreateInvoiceRequest } from "../domain/IsCreateInvoiceRequest";

/**
 * Constructs an Express router for handling application API calls
 * We use a function so we can easily supply dependencies to the
 * handler, making testing easier.
 * @returns
 */
export function invoiceApi(app: AppController): express.Router {
    // Construct a router object
    const router = express();

    // Adds a handler for returning the graph. By default express does not
    // understand async code, but we can easily adapt Express by calling
    // a promise based handler and if it fails catching the error and
    // supplying it with `next` to allow Express to handle the error.
    router.post("/api/invoices", (req, res, next) => createInvoice(req, res).catch(next));

    /**
     * Handler that creates an invoice
     * @param req
     * @param res
     */
    async function createInvoice(req: express.Request, res: express.Response) {
        const body = req.body;

        if (!isCreateInvoiceRequest(body)) {
            return res.status(400).json({ error: "Invalid request" });
        }

        const result = await app.createInvoice(body.signature, body.sats);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    }

    return router;
}
