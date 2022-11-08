import { CreateInvoiceRequest } from "./CreateInvoiceRequest";

export function isCreateInvoiceRequest(val: unknown): val is CreateInvoiceRequest {
    return (
        typeof val === "object" &&
        typeof val["signature"] === "string" &&
        typeof val["sats"] === "number"
    );
}
