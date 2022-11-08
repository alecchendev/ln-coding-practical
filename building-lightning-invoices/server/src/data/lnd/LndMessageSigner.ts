import { IMessageSigner } from "../../domain/IMessageSigner";
import { VerifySignatureResult } from "../../domain/VerifySignatureResult";
import { ILndClient } from "./ILndClient";

export class LndMessageSigner implements IMessageSigner {
    constructor(readonly client: ILndClient) {}

    public async sign(msg: string): Promise<string> {
        const result = await this.client.signMessage(Buffer.from(msg));
        return result.signature;
    }

    public async verify(msg: string, signature: string): Promise<VerifySignatureResult> {
        const result = await this.client.verifyMessage(Buffer.from(msg), signature);
        return result;
    }
}
