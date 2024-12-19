import formatAddress from "../formatAddress";

describe("formatAddress", () => {
  it("should return an empty string when no address is provided", () => {
    expect(formatAddress(null)).toBe("");
    expect(formatAddress(undefined)).toBe("");
  });

  it("should return the representative name when only representativeName is provided", () => {
    const address = { representativeName: "John Doe" };
    expect(formatAddress(address)).toBe("John Doe");
  });

  it("should only return address line when it is the only thing provided", () => {
    const address = { addressLine1: "123 Main St" };
    expect(formatAddress(address)).toBe("123 Main St");
  });

  it("should only return address line 2 when it is the only thing provided", () => {
    const address = { addressLine2: "1233 Fake St" };
    expect(formatAddress(address)).toBe("1233 Fake St");
  });

  it("should only return city when it is the only thing provided", () => {
    const address = { city: "Vancouver" };
    expect(formatAddress(address)).toBe("Vancouver");
  });

  it("should return a formatted address with multiple elements", () => {
    const address = {
      representativeName: "John Doe",
      addressLine1: "123 Main St",
      addressLine2: "Apt 4B",
      city: "Victoria",
      state: "BC",
      country: "Canada",
      postalCode: "V8V 3V3",
    };
    const expected =
      "John Doe, 123 Main St, Apt 4B, Victoria, BC, Canada, V8V 3V3";
    expect(formatAddress(address)).toBe(expected);
  });

  it("can handle missing elements", () => {
    const address = {
      representativeName: "John Doe",
      addressLine1: "123 Main St",
      city: "Victoria",
      country: "Canada",
      postalCode: "V8V 3V3",
    };
    const expected = "John Doe, 123 Main St, Victoria, Canada, V8V 3V3";
    expect(formatAddress(address)).toBe(expected);
  });
});
