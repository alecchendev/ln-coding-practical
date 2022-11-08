import { expect } from "chai";
import { LndInvoiceDataMapper } from "../../../src/data/lnd/LndInvoiceDataMapper";
import { Lnd } from "../../../src/data/lnd/v0.12.1-beta/Types";

describe("LndInvoiceDataMapper", () => {
    describe(".convertInvoice()", () => {
        it("converts settled invoice", () => {
            // arrange
            const invoice: Lnd.Invoice = {
                route_hints: [],
                htlcs: [],
                features: [],
                memo: "buy_67553f5ac05ef188df9b8ebd791ec7cefab8378b4d235bd373be63efeb5da699_039604db5d2e27c061b445ef34d723d9c36a5416dacc4f2e8506f7fe0e76a14f72",
                r_preimage: Buffer.from(
                    "26f924606ceb63d407589bfd89c902f458208f081c5c7e4f9a0260d738ecb012",
                    "hex",
                ),
                r_hash: Buffer.from(
                    "0e770a8aeaa590e9a4b8d44139bafefb44cf74c0473c5cb1c5a4077ab4c02b14",
                    "hex",
                ),
                value: "1002",
                settled: true,
                creation_date: "1654874440",
                settle_date: "1654874453",
                payment_request:
                    "lnbcrt10020n1p32xc2gpp5pems4zh25kgwnf9c63qnnwh7ldzv7axqgu79evw95srh4dxq9v2qdxcvf6hjhekxu6n2vmxx4skxvp4v4nrzwpcv3nrjc3cv43xgdeex9jkxdmrv4nxzc3cxvmnsc35vserxdtzvsenwvmzv5mrxetxv43r2erpxcunjhesxvunvvp5v33r2epjv5erwcesxcckydp5x4jkvve5vsmnyvmy893nxdnpx56rzdnyv93kxdrxxfjnsdfsxenrwen9xpjnwdnpxy6xvdejcqzpgsp5z8f3uecr8742aamgs46pzkk4jwfsy3zq3yxku08nn9l9pyp0qauq9qyyssq38q6skgshj9r6uzh5a5r2f60sa6fa9mfrp2ye6v5t7frlurecwq3p65n6s7xclxeqfytfxdaj46p3xdpcf65g6gx8xcqqdm7zrnda6gqdef9gm",
                description_hash: Buffer.alloc(0),
                expiry: "3600",
                fallback_addr: "",
                cltv_expiry: "40",
                private: false,
                add_index: "29",
                settle_index: "22",
                amt_paid: "1002000",
                amt_paid_sat: "1002",
                amt_paid_msat: "1002000",
                state: Lnd.InvoiceState.Settled,
                value_msat: "1002000",
                is_keysend: false,
                payment_addr: Buffer.from(
                    "11d31e67033faaaef7688574115ad59393024440890d6e3cf3997e50902f0778",
                    "hex",
                ),
            };
            const sut = new LndInvoiceDataMapper(undefined);

            // act
            const result = sut.convertInvoice(invoice);

            // assert
            expect(result.memo).to.equal(
                "buy_67553f5ac05ef188df9b8ebd791ec7cefab8378b4d235bd373be63efeb5da699_039604db5d2e27c061b445ef34d723d9c36a5416dacc4f2e8506f7fe0e76a14f72",
            );
            expect(result.preimage).to.equal(
                "26f924606ceb63d407589bfd89c902f458208f081c5c7e4f9a0260d738ecb012",
                "preimage should be hex encoded",
            );
            expect(result.hash).to.equal(
                "0e770a8aeaa590e9a4b8d44139bafefb44cf74c0473c5cb1c5a4077ab4c02b14",
                "hash should be hex encoded",
            );
            expect(result.valueSat).to.equal("1002", "valueSats should be a string");
            expect(result.settled).to.equal(true);
            expect(result.settleDate).to.equal(1654874453, "settleDate should be a number");
        });

        it("converts unsettled invoice", () => {
            // arrange
            // act
            // assert
        });
    });
});
