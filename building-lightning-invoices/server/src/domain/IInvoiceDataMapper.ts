import { Invoice } from "./Invoice";

export type InvoiceHandler = (invoice: Invoice) => Promise<void>;

export interface IInvoiceDataMapper {
    add(value: number, memo: string, preimage: Buffer): Promise<string>;
    sync(handler: InvoiceHandler): Promise<void>;
}
