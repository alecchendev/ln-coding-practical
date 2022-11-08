import { sha256 } from "../util/Sha256";
import { Link } from "./Link";

/**
 * Domain specific class for handling invoices that the application is interested in.
 */
export class Invoice {
    /**
     * Creates a memo in the form `buy_{linkId}_{buyer}` where preimage and buyer are both
     * hex encoded.
     * @param linkId 32-byte preimage, hex encoded
     * @param buyer 33-byte public key of the buyer, hex encoded
     * @returns
     */
    public static createMemo(linkId: string, buyer: string) {
        return `buy_${linkId}_${buyer}`;
    }

    /**
     *
     * @param local
     * @param remote
     * @param sats
     * @returns
     */
    public static createPreimage(local: string, remote: string, sats: number): Buffer {
        const x = Buffer.concat([Buffer.from(local + remote, "utf-8"), Buffer.from(sats.toString(), "utf-8")]);
        return sha256(x);
    }

    constructor(
        public memo: string,
        public preimage: string,
        public hash: string,
        public valueSat: string,
        public settled: boolean = false,
        public settleDate?: number,
    ) {}

    /**
     * Returns true when the invoice's memo matches the buy_{linkId}_{buyer} pattern
     * @returns
     */
    public isAppInvoice(): boolean {
        return /^buy_[0-9a-f]{64}_[0-9a-f]{66}$/.test(this.memo);
    }

    /**
     * Extracts the prior preimage value from the memo
     */
    public get linkId(): string {
        return this.memo.split("_")[1];
    }

    /**
     * Extracts the buyer nodeId from the memo
     */
    public get buyerNodeId(): string {
        return this.memo.split("_")[2];
    }

    public settles(link: Link) {
        return this.settled && this.isAppInvoice() && this.linkId === link.linkId;
    }

    public toJSON() {
        return {
            memo: this.memo,
            preimage: this.preimage,
            hash: this.hash,
            valueSat: this.valueSat,
            settled: this.settled,
            settleDate: this.settleDate,
            linkId: this.linkId,
            buyerNodeId: this.buyerNodeId,
        };
    }
}
