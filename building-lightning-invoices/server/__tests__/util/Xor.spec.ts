import { expect } from "chai";
import { xor } from "../../src/util/Xor";

describe("function: xor", () => {
    it("should xor equal buffers", () => {
        // arrange
        const a = Buffer.from("00000000", "hex");
        const b = Buffer.from("00000000", "hex");

        // act
        const result = xor(a, b);

        // assert
        expect(result.toString("hex")).to.equal("00000000");
    });

    it("should xor different buffers", () => {
        // arrange
        const a = Buffer.from("0000ffff", "hex");
        const b = Buffer.from("ffff0000", "hex");

        // act
        const result = xor(a, b);

        // assert
        expect(result.toString("hex")).to.equal("ffffffff");
    });

    it("should xor short a", () => {
        // arrange
        const a = Buffer.from("00", "hex");
        const b = Buffer.from("ffff", "hex");

        // act
        const result = xor(a, b);

        // assert
        expect(result.toString("hex")).to.equal("ffff");
    });

    it("should xor short b", () => {
        // arrange
        const a = Buffer.from("ffff", "hex");
        const b = Buffer.from("00", "hex");

        // act
        const result = xor(a, b);

        // assert
        expect(result.toString("hex")).to.equal("ffff");
    });
});
