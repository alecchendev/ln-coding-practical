import { VerifySignatureResult } from "./VerifySignatureResult";

export interface IMessageSigner {
    sign(msg: string): Promise<string>;
    verify(msg: string, signature: string): Promise<VerifySignatureResult>;
}
