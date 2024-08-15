import { printToLetter } from "../utils"
describe("printToLetter", () => {
  it("should convert a number to letters using the default alphabet", () => {
    expect(printToLetter(1)).toEqual("A");
    expect(printToLetter(26)).toEqual("Z");
    expect(printToLetter(27)).toEqual("AA");
    expect(printToLetter(52)).toEqual("AZ");
    expect(printToLetter(53)).toEqual("BA");
  });

  it("should convert a number to letters using a custom alphabet", () => {
    expect(printToLetter(1, ["a", "b", "c"])).toEqual("a");
    expect(printToLetter(2, ["a", "b", "c"])).toEqual("b");
    expect(printToLetter(3, ["a", "b", "c"])).toEqual("c");
    expect(printToLetter(4, ["a", "b", "c"])).toEqual("aa");
    expect(printToLetter(6, ["a", "b", "c"])).toEqual("ac");
  });
});
