import { expect } from "chai";
import sinon from "sinon";
import { LndInvoiceDataMapper } from "../../src/data/lnd/LndInvoiceDataMapper";
import { LndMessageSigner } from "../../src/data/lnd/LndMessageSigner";
import { AppController } from "../../src/domain/AppController";
import { Invoice } from "../../src/domain/Invoice";
import { Link } from "../../src/domain/Link";
import { LinkFactory } from "../../src/domain/LinkFactory";

describe("AppController", () => {
    describe(".start()", () => {
        it("adds the first link to the chain", async () => {
            // arrange
            const minSats = 1000;
            const seed = "0000000000000000000000000000000000000000000000000000000000000001";
            const invoiceDataMapper = sinon.createStubInstance(LndInvoiceDataMapper);
            const messageSigner = sinon.createStubInstance(LndMessageSigner);
            const linkFactory = sinon.createStubInstance(LinkFactory);
            const fakeLink = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );
            linkFactory.createFromSeed.resolves(fakeLink);
            const sut = new AppController(invoiceDataMapper, messageSigner, linkFactory);

            // act
            await sut.start(seed, minSats);

            // assert
            expect(linkFactory.createFromSeed.called).to.equal(
                true,
                "expect createFromSeed to be used",
            );
            expect(linkFactory.createFromSeed.args[0][0]).to.equal(
                seed,
                "expect createFromSeed to be called with the seed",
            );
            expect(linkFactory.createFromSeed.args[0][1]).to.equal(
                minSats,
                "expect minSats to be called with the provided argument",
            );
        });

        it("syncs the invoice database", async () => {
            // arrange
            const minSats = 1000;
            const seed = "0000000000000000000000000000000000000000000000000000000000000001";
            const invoiceDataMapper = sinon.createStubInstance(LndInvoiceDataMapper);
            const messageSigner = sinon.createStubInstance(LndMessageSigner);
            const linkFactory = sinon.createStubInstance(LinkFactory);
            const fakeLink = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );
            linkFactory.createFromSeed.resolves(fakeLink);
            const sut = new AppController(invoiceDataMapper, messageSigner, linkFactory);

            // act
            await sut.start(seed, minSats);

            // assert
            expect(invoiceDataMapper.sync.called).to.equal(true, "expect sync to be called");
        });
    });

    describe(".handleInvoice()", () => {
        let sut: AppController;
        let invoiceDataMapper: sinon.SinonStubbedInstance<LndInvoiceDataMapper>;
        let messageSigner: sinon.SinonStubbedInstance<LndMessageSigner>;
        let linkFactory: sinon.SinonStubbedInstance<LinkFactory>;
        let receiver: sinon.SinonStub;

        beforeEach(() => {
            invoiceDataMapper = sinon.createStubInstance(LndInvoiceDataMapper);
            messageSigner = sinon.createStubInstance(LndMessageSigner);
            linkFactory = sinon.createStubInstance(LinkFactory);
            sut = new AppController(invoiceDataMapper, messageSigner, linkFactory);

            // assign first link
            const firstLink = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );
            sut.chain.push(firstLink);

            // construct link
            linkFactory.createFromSettled.resolves(
                new Link(
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "d6jchbf6m8349k1fdaj41pwaywnmcufd18nzzjmg3z9rwy59a4gd15bu9dmqzzayrt8gckwz6whtam66e7rn5pugysdg9u4xdkimtsgh",
                    1001,
                ),
            );

            // assign receiver
            receiver = sinon.stub();
            sut.listener = receiver;
        });

        it("ignores non-app invoice", async () => {
            // arrange
            const invoice = new Invoice(
                "some other invoice",
                "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                "9b6332cdaa42d0c26671707f0b2da6422a198ca59866bbfd9517fd58215f1319",
                "1001",
                true,
                1654691544,
            );

            // act
            await sut.handleInvoice(invoice);

            // assert
            expect(receiver.called).to.equal(false, "should ignore non-app invoices");
        });

        it("ignores invoice not resolving the chaintip", async () => {
            // arrange
            const invoice = new Invoice(
                "buy_821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860_039604db5d2e27c061b445ef34d723d9c36a5416dacc4f2e8506f7fe0e76a14f72",
                "67553f5ac05ef188df9b8ebd791ec7cefab8378b4d235bd373be63efeb5da699",
                "96c50b5281d9422dd8345e5dbe879b20fa5eeba530b283095be856ee208991cf",
                "1001",
                true,
                1654691544,
            );

            // act
            await sut.handleInvoice(invoice);

            // assert
            expect(receiver.called).to.equal(
                false,
                "should ignore invoice that doesn't settle chaintip",
            );
        });

        describe("when valid invoice", () => {
            it("marks chaintip as settled using hte invoice", async () => {
                // arrange
                const invoice = new Invoice(
                    "buy_0000000000000000000000000000000000000000000000000000000000000001_03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "9b6332cdaa42d0c26671707f0b2da6422a198ca59866bbfd9517fd58215f1319",
                    "1001",
                    true,
                    1654691544,
                );

                // act
                await sut.handleInvoice(invoice);

                // assert
                expect(sut.chain[0].isSettled).to.equal(
                    true,
                    "should market the chaintip as settled",
                );
                expect(sut.chain[0].invoice).to.deep.equal(
                    invoice,
                    "should settle the chaintip with the invoice",
                );
            });

            it("should construct a new chaintip", async () => {
                // arrange
                const invoice = new Invoice(
                    "buy_0000000000000000000000000000000000000000000000000000000000000001_03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "9b6332cdaa42d0c26671707f0b2da6422a198ca59866bbfd9517fd58215f1319",
                    "1001",
                    true,
                    1654691544,
                );

                // act
                await sut.handleInvoice(invoice);

                // assert
                expect(sut.chainTip.linkId).to.equal(
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "Expect identifier to be prior preimage, try using linkFactory.createFromSettled",
                );
                expect(sut.chainTip.localSignature).to.equal(
                    "d6jchbf6m8349k1fdaj41pwaywnmcufd18nzzjmg3z9rwy59a4gd15bu9dmqzzayrt8gckwz6whtam66e7rn5pugysdg9u4xdkimtsgh",
                    "expect localSignature to be result from `signer.sign`, try using linkFactory.createFromSettled",
                );
                expect(sut.chainTip.minSats).to.equal(
                    1001,
                    "Expect minSats to 1 satoshi more than settled invoice, try using linkFactory.createFromSettled",
                );
                expect(sut.chainTip.isSettled).to.be.false;
                expect(sut.chainTip.invoice).to.be.undefined;
                expect(sut.chainTip.nextLinkId).to.be.undefined;
            });

            it("should emit the settled link and the new chaintip", async () => {
                // arrange
                const invoice = new Invoice(
                    "buy_0000000000000000000000000000000000000000000000000000000000000001_03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "9b6332cdaa42d0c26671707f0b2da6422a198ca59866bbfd9517fd58215f1319",
                    "1001",
                    true,
                    1654691544,
                );

                // act
                await sut.handleInvoice(invoice);

                // assert
                expect(receiver.called).to.equal(true, "should call the receiver");
                expect(receiver.args[0][0][0].linkId).to.equal(
                    "0000000000000000000000000000000000000000000000000000000000000001",
                );
                expect(receiver.args[0][0][1].linkId).to.equal(
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                );
            });
        });
    });

    describe(".createInvoice()", () => {
        let sut: AppController;
        let invoiceDataMapper: sinon.SinonStubbedInstance<LndInvoiceDataMapper>;
        let messageSigner: sinon.SinonStubbedInstance<LndMessageSigner>;
        let linkFactory: sinon.SinonStubbedInstance<LinkFactory>;

        beforeEach(() => {
            invoiceDataMapper = sinon.createStubInstance(LndInvoiceDataMapper);
            messageSigner = sinon.createStubInstance(LndMessageSigner);
            linkFactory = sinon.createStubInstance(LinkFactory);
            sut = new AppController(invoiceDataMapper, messageSigner, linkFactory);

            // assign first link
            const firstLink = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );
            sut.chain.push(firstLink);
        });

        it("verifies signature using linkId and signature", async () => {
            // arrange
            const signature =
                "rna7paf9c4ha5cjxwu849px7riqpdn6hd5gts8q9r4kb9sje64w4assrbithnjjipfuq3quceyp8b6rm9ifc9ddqan4ntej7yoj74snd";
            const sats = 1000;
            messageSigner.verify.resolves({
                valid: true,
                pubkey: "03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
            });

            // act
            await sut.createInvoice(signature, sats);

            // assert
            expect(messageSigner.verify.args[0][0]).to.deep.equal(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "verify should be called with the linkId of the chaintip",
            );
            expect(messageSigner.verify.args[0][1]).to.deep.equal(
                signature,
                "verify should be called with the signature as the second argument",
            );
        });

        it("invalid signature, returns false", async () => {
            // arrange
            const signature = "";
            const sats = 1000;
            messageSigner.verify.resolves({ valid: false, pubkey: undefined });

            // act
            const result = await sut.createInvoice(signature, sats);

            // assert
            expect(result.success).to.equal(
                false,
                "should return failure result for invalid signature",
            );
        });

        it("creates the proper preimage", async () => {
            // arrange
            const signature =
                "rna7paf9c4ha5cjxwu849px7riqpdn6hd5gts8q9r4kb9sje64w4assrbithnjjipfuq3quceyp8b6rm9ifc9ddqan4ntej7yoj74snd";
            const sats = 1000;
            messageSigner.verify.resolves({
                valid: true,
                pubkey: "03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
            });

            // act
            await sut.createInvoice(signature, sats);

            // assert
            expect(invoiceDataMapper.add.args[0][2].toString("hex")).to.equal(
                "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
            );
        });

        it("creates the proper memo", async () => {
            // arrange
            const signature =
                "rna7paf9c4ha5cjxwu849px7riqpdn6hd5gts8q9r4kb9sje64w4assrbithnjjipfuq3quceyp8b6rm9ifc9ddqan4ntej7yoj74snd";
            const sats = 1000;
            messageSigner.verify.resolves({
                valid: true,
                pubkey: "03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
            });

            // act
            await sut.createInvoice(signature, sats);

            // assert
            expect(invoiceDataMapper.add.args[0][1]).to.equal(
                "buy_0000000000000000000000000000000000000000000000000000000000000001_03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
            );
        });

        it("returns true when invoice is successful", async () => {
            // arrange
            const signature =
                "rna7paf9c4ha5cjxwu849px7riqpdn6hd5gts8q9r4kb9sje64w4assrbithnjjipfuq3quceyp8b6rm9ifc9ddqan4ntej7yoj74snd";
            const sats = 1000;
            messageSigner.verify.resolves({
                valid: true,
                pubkey: "03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
            });
            invoiceDataMapper.add.resolves(
                "lnbcrt10u1p32p9k5pp5nd3n9nd2gtgvyen3wplsktdxgg4pnr99npnthlv4zl74sg2lzvvsdxcvf6hjhesxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrzhesxdjnjcen8yunwv3jx5enxdfex33x2ve3xuerjd3c8ycrqc3h8pjkget9xf3xven9vdjk2vejvvunjdtyxyukgdphvvenyvmyxq6nzve3cqzpgsp59qxmgxpq6v8q8c4epjutkl5gyklpwqjkussy0e8m2ls33xjlfd3q9qyyssqcsdqqh7z3zftlyuspkecm37x4uy3wxcv893vmmsmeeax9rufh57h2cztk2hvwd5ml9v6fvfgnegld9t00t2e3wccmdrv5h8t7l73ufgp7gacp2",
            );

            // act
            const result = await sut.createInvoice(signature, sats);

            // assert
            expect(result.success).to.equal(true);
            expect(result.paymentRequest).to.equal(
                "lnbcrt10u1p32p9k5pp5nd3n9nd2gtgvyen3wplsktdxgg4pnr99npnthlv4zl74sg2lzvvsdxcvf6hjhesxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrqvpsxqcrzhesxdjnjcen8yunwv3jx5enxdfex33x2ve3xuerjd3c8ycrqc3h8pjkget9xf3xven9vdjk2vejvvunjdtyxyukgdphvvenyvmyxq6nzve3cqzpgsp59qxmgxpq6v8q8c4epjutkl5gyklpwqjkussy0e8m2ls33xjlfd3q9qyyssqcsdqqh7z3zftlyuspkecm37x4uy3wxcv893vmmsmeeax9rufh57h2cztk2hvwd5ml9v6fvfgnegld9t00t2e3wccmdrv5h8t7l73ufgp7gacp2",
            );
        });

        it("returns false when invoice fails", async () => {
            // arrange
            const signature =
                "rna7paf9c4ha5cjxwu849px7riqpdn6hd5gts8q9r4kb9sje64w4assrbithnjjipfuq3quceyp8b6rm9ifc9ddqan4ntej7yoj74snd";
            const sats = 1000;
            messageSigner.verify.resolves({
                valid: true,
                pubkey: "03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
            });
            invoiceDataMapper.add.throws(new Error("Already exists"));

            // act
            const result = await sut.createInvoice(signature, sats);

            // assert
            expect(result.success).to.equal(false);
        });
    });
});
