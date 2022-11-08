import sinon from "sinon";
import { expect } from "chai";
import { LndMessageSigner } from "../../src/data/lnd/LndMessageSigner";
import { LinkFactory } from "../../src/domain/LinkFactory";
import { Link } from "../../src/domain/Link";
import { Invoice } from "../../src/domain/Invoice";

describe("LinkFactory", () => {
    describe(".createFromSeed()", () => {
        it("should create a signature from the seed", async () => {
            // arrange
            const seed = "0000000000000000000000000000000000000000000000000000000000000001";
            const minSats = 1000;
            const signer = sinon.createStubInstance(LndMessageSigner);
            const sut = new LinkFactory(signer);

            // act
            await sut.createFromSeed(seed, minSats);

            // assert
            expect(signer.sign.args[0][0]).to.equal(seed, "Must call `signer.sign` with the seed");
        });

        it("should construct the link correctly", async () => {
            // arrange
            const seed = "0000000000000000000000000000000000000000000000000000000000000001";
            const localSignature =
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1";
            const minSats = 1000;
            const signer = sinon.createStubInstance(LndMessageSigner);
            signer.sign.resolves(localSignature);
            const sut = new LinkFactory(signer);

            // act
            const result = await sut.createFromSeed(seed, minSats);

            // assert
            expect(result.linkId).to.equal(seed, "Expect identifier to equal seed");
            expect(result.localSignature).to.equal(
                localSignature,
                "expect localSignature to be result from `signer.sign`",
            );
            expect(result.minSats).to.equal(
                minSats,
                "Expect minSats to be the same as minSats argument",
            );
            expect(result.isSettled).to.be.false;
            expect(result.invoice).to.be.undefined;
            expect(result.nextLinkId).to.be.undefined;
        });
    });

    describe(".createFromSettled()", () => {
        it("should create a signature from the prior invoice preimage", async () => {
            // arrange
            const settled = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );
            settled.settle(
                new Invoice(
                    "buy_0000000000000000000000000000000000000000000000000000000000000001_03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "9b6332cdaa42d0c26671707f0b2da6422a198ca59866bbfd9517fd58215f1319",
                    "1000",
                    true,
                    1654691544,
                ),
            );
            const signer = sinon.createStubInstance(LndMessageSigner);
            const sut = new LinkFactory(signer);

            // act
            await sut.createFromSettled(settled);

            // assert
            expect(signer.sign.args[0][0]).to.equal(
                "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                "Should call signer with preimage of settled link",
            );
        });

        it("should return new unsettled link", async () => {
            // arrange
            const settled = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );
            settled.settle(
                new Invoice(
                    "buy_0000000000000000000000000000000000000000000000000000000000000001_03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "9b6332cdaa42d0c26671707f0b2da6422a198ca59866bbfd9517fd58215f1319",
                    "1001",
                    true,
                    1654691544,
                ),
            );
            const signer = sinon.createStubInstance(LndMessageSigner);
            signer.sign.resolves(
                "d6jchbf6m8349k1fdaj41pwaywnmcufd18nzzjmg3z9rwy59a4gd15bu9dmqzzayrt8gckwz6whtam66e7rn5pugysdg9u4xdkimtsgh",
            );
            const sut = new LinkFactory(signer);

            // act
            const result = await sut.createFromSettled(settled);

            // assert
            expect(result.linkId).to.equal(
                "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                "Expect identifier to be prior preimage",
            );
            expect(result.localSignature).to.equal(
                "d6jchbf6m8349k1fdaj41pwaywnmcufd18nzzjmg3z9rwy59a4gd15bu9dmqzzayrt8gckwz6whtam66e7rn5pugysdg9u4xdkimtsgh",
                "expect localSignature to be result from `signer.sign`",
            );
            expect(result.minSats).to.equal(
                Number(settled.invoice.valueSat) + 1,
                "Expect minSats to 1 satoshi more than settled invoice",
            );
            expect(result.isSettled).to.be.false;
            expect(result.invoice).to.be.undefined;
            expect(result.nextLinkId).to.be.undefined;
        });
    });
});
