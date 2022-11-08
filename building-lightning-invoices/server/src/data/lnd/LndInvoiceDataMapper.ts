import { Invoice } from "../../domain/Invoice";
import { ILndClient } from "./ILndClient";
import { Lnd } from "./v0.12.1-beta/Types";
import { IInvoiceDataMapper, InvoiceHandler } from "../../domain/IInvoiceDataMapper";

export class LndInvoiceDataMapper implements IInvoiceDataMapper {
    constructor(readonly client: ILndClient) {}

    /**
     * Adds an invoice and returns the payment_request
     * @returns
     */
    public async add(value: number, memo: string, preimage: Buffer): Promise<string> {
        const invoice = await this.client.addInvoice({
            amt: value,
            memo,
            preimage,
        });
        return invoice.payment_request;
    }

    /**
     * This method looks up invoices from the LND invoice database filtering
     * to only those that match our application. The handler is called for
     * each invoice that is in the LND invoice database.
     * @returns
     */
    public async sync(handler: InvoiceHandler): Promise<void> {
        // fetch all invoices
        const num_max_invoices = Number.MAX_SAFE_INTEGER.toString();
        const index_offset = "0";
        const results: Lnd.ListInvoiceResponse = await this.client.listInvoices({
            index_offset,
            num_max_invoices,
        });

        // process all retrieved invoices
        for (const invoice of results.invoices) {
            await handler(this.convertInvoice(invoice));
        }

        // subscribe to all new invoices/settlements
        void this.client.subscribeInvoices(invoice => {
            void handler(this.convertInvoice(invoice));
        }, {});
    }

    /**
     * Maps an LND Invoice into a domain Invoice
     * @param invoice
     * @returns
     */
    public convertInvoice(invoice: Lnd.Invoice): Invoice {
        throw new Error("Not Implemented");
    }
}
