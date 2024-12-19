import constructReassessmentReductions from "../constructReassessmentReductions";
import Big from "big.js";

describe("constructReassessmentReductions", () => {
  it("should return empty reductions when both inputs are empty", () => {
    const result = constructReassessmentReductions([], []);
    expect(result).toEqual({ reductionsToUpdate: [], reductionsToAdd: [] });
  });

  it("should add new reductions when no previous reductions exist", () => {
    const reductions = [
      {
        type: "Type1",
        modelYear: 2023,
        creditA: new Big(10),
        creditB: new Big(20),
      },
    ];

    const result = constructReassessmentReductions(reductions, []);

    expect(result).toEqual({
      reductionsToUpdate: [],
      reductionsToAdd: [
        { creditClass: "A", modelYear: 2023, value: 10 },
        { creditClass: "B", modelYear: 2023, value: 20 },
      ],
    });
  });

  it("should be able to make changes in existing reductions", () => {
    const reductions = [
      {
        type: "Type1",
        modelYear: 2023,
        creditA: new Big(15),
        creditB: new Big(20),
      },
    ];
    const prevReductions = [
      {
        type: "Type1",
        modelYear: 2023,
        creditA: new Big(10),
        creditB: new Big(20),
      },
    ];

    const result = constructReassessmentReductions(reductions, prevReductions);

    expect(result).toEqual({
      reductionsToUpdate: [
        {
          creditClass: "A",
          modelYear: 2023,
          oldValue: 10,
          newValue: 15,
        },
      ],
      reductionsToAdd: [],
    });
  });

  it("should add reductions for new types or years not in previous reductions", () => {
    const reductions = [
      {
        type: "Type1",
        modelYear: 2023,
        creditA: new Big(10),
        creditB: new Big(20),
      },
      {
        type: "Type2",
        modelYear: 2024,
        creditA: new Big(5),
        creditB: new Big(0),
      },
    ];
    const prevReductions = [
      {
        type: "Type1",
        modelYear: 2023,
        creditA: new Big(10),
        creditB: new Big(20),
      },
    ];

    const result = constructReassessmentReductions(reductions, prevReductions);

    expect(result).toEqual({
      reductionsToUpdate: [],
      reductionsToAdd: [{ creditClass: "A", modelYear: 2024, value: 5 }],
    });
  });

  it("should return empty updates and additions when reductions match previous reductions", () => {
    const reductions = [
      {
        type: "Type1",
        modelYear: 2023,
        creditA: new Big(10),
        creditB: new Big(20),
      },
    ];
    const prevReductions = [
      {
        type: "Type1",
        modelYear: 2023,
        creditA: new Big(10),
        creditB: new Big(20),
      },
    ];

    const result = constructReassessmentReductions(reductions, prevReductions);

    expect(result).toEqual({ reductionsToUpdate: [], reductionsToAdd: [] });
  });

  it("should handle reductions with no corresponding previous reductions", () => {
    const reductions = [
      {
        type: "Type1",
        modelYear: 2023,
        creditA: new Big(0),
        creditB: new Big(30),
      },
    ];

    const prevReductions = [];

    const result = constructReassessmentReductions(reductions, prevReductions);

    expect(result).toEqual({
      reductionsToUpdate: [],
      reductionsToAdd: [{ creditClass: "B", modelYear: 2023, value: 30 }],
    });
  });
});
