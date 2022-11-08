import { expect } from "chai";
import { sha256 } from "../../src/util/Sha256";

describe("function: sha256", () => {
    it("returns correct hash", () => {
        // arrange
        const input = Buffer.from("abc");

        // act
        const actual = sha256(input);

        // assert
        expect(actual.toString("hex")).to.equal(
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        );
    });
});
