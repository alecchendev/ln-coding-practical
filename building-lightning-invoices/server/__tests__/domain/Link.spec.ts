import { expect } from "chai";
import { Invoice } from "../../src/domain/Invoice";
import { Link } from "../../src/domain/Link";

describe("Link", () => {
    describe(".isSettled", () => {
        it("should return true when invoice exists and is settled", () => {
            // arrange
            const sut = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );
            sut.settle(
                new Invoice(
                    "buy_0000000000000000000000000000000000000000000000000000000000000001_03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "9b6332cdaa42d0c26671707f0b2da6422a198ca59866bbfd9517fd58215f1319",
                    "1001",
                    true,
                    1654691544,
                ),
            );

            // act & assert
            expect(sut.isSettled).to.equal(true);
        });

        it("should return false when invoice exists but is not settled", () => {
            // arrange
            const sut = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );
            sut.settle(
                new Invoice(
                    "buy_0000000000000000000000000000000000000000000000000000000000000001_03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "9b6332cdaa42d0c26671707f0b2da6422a198ca59866bbfd9517fd58215f1319",
                    "1001",
                ),
            );

            // act & assert
            expect(sut.isSettled).to.equal(false);
        });

        it("should return false when invoice does not exist", () => {
            // arrange
            const sut = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );

            // act & assert
            expect(sut.isSettled).to.equal(false);
        });
    });

    describe(".nextLinkId", () => {
        it("should return undefined when unsettled", () => {
            // arrange
            const sut = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );

            // act & assert
            expect(sut.nextLinkId).to.equal(undefined);
        });

        it("should return invoice's preimage when settled", () => {
            // arrange
            const sut = new Link(
                "0000000000000000000000000000000000000000000000000000000000000001",
                "rypj5rexme7cqdqxzok1ygqw89h3m4qsu3dkje1xt894kmwwjr181sz5tnyz6o588bmx384sdx73ojnz3ebrnifxy67ykjfsfctjfns1",
                1000,
            );
            sut.settle(
                new Invoice(
                    "buy_0000000000000000000000000000000000000000000000000000000000000001_03e9c399722533594be3172968900b78edee2bffecee32c995d19d47c323d05131",
                    "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
                    "9b6332cdaa42d0c26671707f0b2da6422a198ca59866bbfd9517fd58215f1319",
                    "1001",
                    true,
                    1654691544,
                ),
            );

            // act && assert
            expect(sut.nextLinkId).to.equal(
                "821c43d357903adbf257bb883e0441d8c095c0cbc595c6fcccca49f94378c860",
            );
        });
    });
});
