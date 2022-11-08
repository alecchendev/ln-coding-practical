import { CreateInvoiceResult } from "./CreateInvoiceResult";
import { Invoice } from "./Invoice";
import { Link } from "./Link";
import { LinkFactory } from "./LinkFactory";
import { IInvoiceDataMapper } from "./IInvoiceDataMapper";
import { IMessageSigner } from "./IMessageSigner";

export class AppController {
    public chain: Link[];
    public listener: (info: Link[]) => void;

    public get chainTip(): Link {
        return this.chain[this.chain.length - 1];
    }

    constructor(
        readonly invoiceDataMapper: IInvoiceDataMapper,
        readonly signer: IMessageSigner,
        readonly linkFactory: LinkFactory,
    ) {
        this.chain = [];
    }

    /**
     * Starts the application by creating the initial link and
     * synchronizing against the invoice repository
     * @param seed
     * @param startSats
     */
    public async start(seed: string, startSats: number) {
        const firstLink = await this.linkFactory.createFromSeed(seed, startSats);
        await this.invoiceDataMapper.sync(invoice => this.handleInvoice(invoice))
    }

    /**
     * Processes an invoice that the application is notified about by checking if it settles the
     * current chain tip. If it does then move the chain forward.
     * @param invoice
     */
    public async handleInvoice(invoice: Invoice) {
        if (invoice.settles(this.chainTip)) {
            this.chainTip.settle(invoice);

            const settled = this.chainTip;
            const nextLink = await this.linkFactory.createFromSettled(settled);
            this.chain.push(nextLink);

            // send to
            if (this.listener) {
                this.listener([settled, nextLink]);
            }
        }
    }

    /**
     * Creates an invoice
     * @param remoteSignature
     * @returns
     */
    public async createInvoice(
        remoteSignature: string,
        sats: number,
    ): Promise<CreateInvoiceResult> {
        // verify the invoice provided by the user
        const verification = await this.signer.verify(this.chainTip.linkId, remoteSignature);

        // return failure if signature fails
        if (!verification.valid) {
            return { success: false, error: "Invalid signature" };
        }

        // create information about the invoice
        const preimage = Invoice.createPreimage(this.chainTip.localSignature, remoteSignature, sats);
        const memo = Invoice.createMemo(this.chainTip.linkId, verification.pubkey);

        // try to create the invoice
        try {
            const paymentRequest = await this.invoiceDataMapper.add(sats, memo, preimage);
            return {
                success: true,
                paymentRequest,
            };
        } catch (ex) {
            return {
                success: false,
                error: ex.message,
            };
        }
    }
}
