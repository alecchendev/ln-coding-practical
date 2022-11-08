import { Invoice } from "./Invoice";

export class Link {
    public invoice: Invoice;

    constructor(public linkId: string, public localSignature: string, public minSats: number) {}

    public get isSettled(): boolean {
        throw new Error("Exercise");
    }

    public get nextLinkId(): string {
        throw new Error("Exercise");
    }

    public settle(invoice: Invoice) {
        this.invoice = invoice;
    }

    public toJSON() {
        if (this.isSettled) {
            return {
                linkId: this.linkId,
                localSignature: this.localSignature,
                minSats: this.minSats,
                invoice: this.invoice.toJSON(),
                isSettled: this.isSettled,
                nextLinkId: this.nextLinkId,
            };
        } else {
            return {
                linkId: this.linkId,
                isSettled: this.isSettled,
                minSats: this.minSats,
            };
        }
    }
}
