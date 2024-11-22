import React from "react";
import { render, act, cleanup, screen, fireEvent, } from "@testing-library/react";
import ComplianceObligationContainer from "../ComplianceObligationContainer";
import * as ComplianceObligationDetailsPage from "../components/ComplianceObligationDetailsPage";
import * as ReactRouter from "react-router-dom";
import axios from "axios";
import ROUTES_COMPLIANCE from "../../app/routes/Compliance";
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from "../../app/routes/SigningAuthorityAssertions";

const Router = ReactRouter.BrowserRouter;
const salesTestId = "test-input-sales";
const optionATestId = "test-input-option-A";
const optionBTestId = "test-input-option-B";

// please do not directly modify any of the consts declared outside of the outermost 'describe' block
// you can, in your individual tests, copy them (the spread operator) and modify the copy

const baseParams = {
  id: 1,
};

const baseOrganization = {
  name: "Sample Organization",
  isGovernment: false,
};

const baseUser = {
  hasPermission: () => {},
  isGovernment: false,
  organization: baseOrganization,
};

const baseProps = {
  user: baseUser,
};

const complianceRatios = [
  { id: 1, modelYear: "2019", complianceRatio: "0.00", zevClassA: "0.00" },
  { id: 2, modelYear: "2020", complianceRatio: "9.50", zevClassA: "6.00" },
  { id: 3, modelYear: "2021", complianceRatio: "12.00", zevClassA: "8.00" },
  { id: 4, modelYear: "2022", complianceRatio: "14.50", zevClassA: "10.00" },
  { id: 5, modelYear: "2023", complianceRatio: "17.00", zevClassA: "12.00" },
  { id: 6, modelYear: "2024", complianceRatio: "19.50", zevClassA: "14.00" },
  { id: 7, modelYear: "2025", complianceRatio: "22.00", zevClassA: "16.00" },
  { id: 8, modelYear: "2026", complianceRatio: "26.30", zevClassA: "15.20" },
  { id: 9, modelYear: "2027", complianceRatio: "42.60", zevClassA: "28.70" },
  { id: 10, modelYear: "2028", complianceRatio: "58.90", zevClassA: "43.20" },
  { id: 11, modelYear: "2029", complianceRatio: "74.80", zevClassA: "58.00" },
  { id: 12, modelYear: "2030", complianceRatio: "91.00", zevClassA: "73.30" },
  { id: 13, modelYear: "2031", complianceRatio: "93.20", zevClassA: "77.20" },
  { id: 14, modelYear: "2032", complianceRatio: "95.20", zevClassA: "80.60" },
  { id: 15, modelYear: "2033", complianceRatio: "97.20", zevClassA: "83.70" },
  { id: 16, modelYear: "2034", complianceRatio: "99.30", zevClassA: "86.70" },
  { id: 17, modelYear: "2035", complianceRatio: "100.00", zevClassA: "89.50" },
];

const assertionComplianceObligation = {
  description: "I confirm this compliance obligation information is complete and correct.",
  module: "compliance_obligation",
};

jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
  };
});

// explicitly mock axios here instead of using the mock provided by jest-mock-axios,
// as that mock does not have the axios.spread function, which is used by ComplianceObligationContainer
jest.mock("axios", () => {
  const originalModule = jest.requireActual("axios");
  return {
    __esModule: true,
    ...originalModule,
  };
});

const getDataByUrl = (url, id, supplierClass, modelYear, complianceObligation) => {
  switch (url) {
    case ROUTES_COMPLIANCE.REPORT_DETAILS.replace(":id", id):
      return {
        organization: {
          ...baseOrganization,
          supplierClass: supplierClass,
        },
        organizationName: baseOrganization.name,
        supplierClass: supplierClass,
        modelYear: {
          name: modelYear,
          effectiveDate: modelYear + "-01-01",
          expirationDate: modelYear + "-12-31",
        },
        confirmations: [],
        creditReductionSelection: null,
      };

    case ROUTES_COMPLIANCE.RATIOS:
      return complianceRatios;

    case ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(":id", id):
      return {
        complianceObligation: complianceObligation ?? [],
      };

    case ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST:
      return [
        {
          description: "Testing description 1",
          module: "other_1",
        },
        assertionComplianceObligation,
        {
          description: "Testing description 2",
          module: "other_2",
        },
      ];

    default:
      return {};
  }
};

let detailsPageProps;

const deepRound = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(deepRound);
  } else if (typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = deepRound(obj[key]);
    }
    return newObj;
  } else if (typeof obj === "number") {
    return Math.round(obj * 100) / 100;
  } else {
    return obj;
  }
};

const assertProps = (actualProps, expectedProps) => {
  const _actualProps = {};
  for (const key in expectedProps) {
    _actualProps[key] = actualProps[key];
  }
  expect(deepRound(_actualProps)).toEqual(deepRound(expectedProps));
};

const toTransactionArray = (data, categoryName) => {
  const array = [];
  for (const year in data) {
    array.push(categoryName ? {
      category: categoryName,
      modelYear: { name: year },
      creditAValue: data[year].A,
      creditBValue: data[year].B
    } : {
      modelYear: year,
      A: data[year].A,
      B: data[year].B
    });
  }
  return array;
};

const getNetCredits = (year, ItemsAdded, ItemsSubtracted) => {
  let valueA = 0;
  let valueB = 0;
  ItemsAdded.forEach((item) => {
    valueA += item[year]?.A ?? 0;
    valueB += item[year]?.B ?? 0;
  });
  ItemsSubtracted.forEach((item) => {
    valueA -= item[year]?.A ?? 0;
    valueB -= item[year]?.B ?? 0;
  });
  return { A: valueA, B: valueB };
};

beforeEach(() => {
  jest.spyOn(ReactRouter, "useParams").mockReturnValue(baseParams);
  jest.spyOn(ComplianceObligationDetailsPage, "default").mockImplementation((props) => {
    detailsPageProps = props;
    return (
      <div>
        <input data-testid={salesTestId} onChange={props.handleChangeSales} />
        <button
          data-testid={optionATestId}
          onClick={() => props.handleUnspecifiedCreditReduction("A")}
        />
        <button
          data-testid={optionBTestId}
          onClick={() => props.handleUnspecifiedCreditReduction("B")}
        />
      </div>
    );
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe("Compliance Obligation Container", () => {
  test("renders without crashing", async () => {
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(url, baseParams.id, "L", 2020),
      });
    });

    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });
  });


  for (const supplierClass of ["L", "M", "S"]) {
    test(`gets credit reduction with zero, empty, or non-numeric sales input for supplier-class ${supplierClass}`, async () => {
      const modelYear = 2021;

      jest.spyOn(axios, "get").mockImplementation((url) => {
        return Promise.resolve({
          data: getDataByUrl(url, baseParams.id, supplierClass, modelYear),
        });
      });

      await act(async () => {
        render(
          <Router>
            <ComplianceObligationContainer {...baseProps} />
          </Router>,
        );
      });

      const expectedProps = {
        assertions: [assertionComplianceObligation],
        classAReductions: [{ modelYear: modelYear, value: 0 }],
        reportYear: modelYear,
        supplierClass,
        totalReduction: 0,
      };

      assertProps(detailsPageProps, expectedProps); // assert for initial empty input

      expectedProps.sales = 0;
      const salesInput = screen.getByTestId(salesTestId);

      fireEvent.change(salesInput, { target: { value: 0 } });
      assertProps(detailsPageProps, expectedProps);

      fireEvent.change(salesInput, { target: { value: "abc" } });
      assertProps(detailsPageProps, expectedProps);

      fireEvent.change(salesInput, { target: { value: "" } });
      assertProps(detailsPageProps, expectedProps);
    });
  }


  test("gets credit reduction with multiple compliance-ratios for large supplier", async () => {
    const supplierClass = "L";

    for (const complianceInfo of complianceRatios) {
      const modelYear = Number(complianceInfo.modelYear);
      const complianceRatio = complianceInfo.complianceRatio;
      const zevClassA = complianceInfo.zevClassA;

      jest.spyOn(axios, "get").mockImplementation((url) => {
        return Promise.resolve({
          data: getDataByUrl(url, baseParams.id, supplierClass, modelYear),
        });
      });

      await act(async () => {
        render(
          <Router>
            <ComplianceObligationContainer {...baseProps} />
          </Router>,
        );
      });

      const testSales = 6000;
      const expectedTotalReduction = (testSales / 100) * complianceRatio;
      const expectedClassAReduction = (testSales / 100) * zevClassA;
      const expectedUnspecifiedReduction =
        expectedTotalReduction - expectedClassAReduction;
      const expectedProps = {
        assertions: [assertionComplianceObligation],
        ratios: complianceInfo,
        classAReductions: [
          { modelYear: modelYear, value: expectedClassAReduction },
        ],
        unspecifiedReductions: [
          { modelYear: modelYear, value: expectedUnspecifiedReduction },
        ],
        reportYear: modelYear,
        sales: testSales,
        supplierClass,
        totalReduction: expectedTotalReduction,
      };

      const salesInput = screen.getByTestId(salesTestId);
      fireEvent.change(salesInput, { target: { value: testSales } });
      assertProps(detailsPageProps, expectedProps);
      document.body.innerHTML = "";
    }
  });


  test("gets credit reduction with multiple compliance-ratios for medium supplier", async () => {
    const supplierClass = "M";

    for (const complianceInfo of complianceRatios) {
      const modelYear = Number(complianceInfo.modelYear);
      const complianceRatio = complianceInfo.complianceRatio;

      jest.spyOn(axios, "get").mockImplementation((url) => {
        return Promise.resolve({
          data: getDataByUrl(url, baseParams.id, supplierClass, modelYear),
        });
      });

      await act(async () => {
        render(
          <Router>
            <ComplianceObligationContainer {...baseProps} />
          </Router>,
        );
      });

      const testSales = 4000;
      const expectedTotalReduction = (testSales / 100) * complianceRatio;
      const expectedClassAReduction = 0;
      const expectedUnspecifiedReduction =
        expectedTotalReduction - expectedClassAReduction;
      const expectedProps = {
        assertions: [assertionComplianceObligation],
        ratios: complianceInfo,
        classAReductions: [
          { modelYear: modelYear, value: expectedClassAReduction },
        ],
        unspecifiedReductions: [
          { modelYear: modelYear, value: expectedUnspecifiedReduction },
        ],
        reportYear: modelYear,
        sales: testSales,
        supplierClass,
        totalReduction: expectedTotalReduction,
      };

      const salesInput = screen.getByTestId(salesTestId);
      fireEvent.change(salesInput, { target: { value: testSales } });
      assertProps(detailsPageProps, expectedProps);
      document.body.innerHTML = "";
    }
  });


  test.skip("gets credit reduction with multiple compliance-ratios for small supplier", async () => {
    const supplierClass = "S";

    for (const complianceInfo of complianceRatios) {
      const modelYear = Number(complianceInfo.modelYear);

      jest.spyOn(axios, "get").mockImplementation((url) => {
        return Promise.resolve({
          data: getDataByUrl(url, baseParams.id, supplierClass, modelYear),
        });
      });

      await act(async () => {
        render(
          <Router>
            <ComplianceObligationContainer {...baseProps} />
          </Router>,
        );
      });

      const testSales = 500;
      const expectedTotalReduction = 0;
      const expectedClassAReduction = 0;
      const expectedUnspecifiedReduction =
        expectedTotalReduction - expectedClassAReduction;
      const expectedProps = {
        assertions: [assertionComplianceObligation],
        ratios: complianceInfo,
        classAReductions: [
          { modelYear: modelYear, value: expectedClassAReduction },
        ],
        unspecifiedReductions: [
          { modelYear: modelYear, value: expectedUnspecifiedReduction },
        ],
        reportYear: modelYear,
        sales: testSales,
        supplierClass,
        totalReduction: expectedTotalReduction,
      };

      const salesInput = screen.getByTestId(salesTestId);
      fireEvent.change(salesInput, { target: { value: testSales } });
      assertProps(detailsPageProps, expectedProps);
      document.body.innerHTML = "";
    }
  });


  test("gets credit balance for large supplier, positive start balances, no transactions", async () => {
    // Set up test data
    const supplierClass = "L";
    const modelYear = 2025;
    const complianceRatio = 22.0;
    const zevClassA = 16.0;
    const creditBalanceStart = {
      2020: { A: 200, B: 100 },
      2021: { A: 0, B: 50 },
      2022: { A: 0, B: 0 },
      2023: { A: 652.4, B: 418.9 },
      2024: { A: 702.5, B: 0 },
    };

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(
      ...toTransactionArray(creditBalanceStart, "creditBalanceStart"),
    );

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 6000;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          { modelYear: 2020, creditA: 0, creditB: 0 },
          { modelYear: 2021, creditA: 0, creditB: 0 },
          { modelYear: 2022, creditA: 0, creditB: 0 },
          {
            modelYear: 2023,
            creditA: 0,
            creditB: 100 + 50 + 418.9 - expectedUnspecifiedReduction,
          },
          {
            modelYear: 2024,
            creditA: 200 + 652.4 + 702.5 - expectedClassAReduction,
            creditB: 0,
          },
        ],
        deficits: [],
      },
    };

    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: creditBalanceStart,
      deficitCollection: {},
      carryOverDeficits: {},
      pendingBalance: [],
      provisionalBalance: creditBalanceStart,
      transactions: {
        creditsIssuedSales: [],
        transfersIn: [],
        transfersOut: [],
        initiativeAgreement: [],
        purchaseAgreement: [],
        administrativeAllocation: [],
        administrativeReduction: [],
        automaticAdministrativePenalty: [],
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    const optionBInput = screen.getByTestId(optionBTestId);
    fireEvent.change(salesInput, { target: { value: testSales } });
    fireEvent.click(optionBInput, { target: { id: "B" } });
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });


  test("gets credit balance for large supplier, deficit start balances, no transactions", async () => {
    // Set up test data
    const supplierClass = "L";
    const modelYear = 2025;
    const complianceRatio = 22.0;
    const zevClassA = 16.0;
    const deficit = {
      2020: { A: 200, B: 100 },
      2021: { A: 10, B: 50 },
      2022: { A: 32, B: 60.4 },
      2023: { A: 652.4, B: 418.9 },
      2024: { A: 702.5, B: 82 },
    };
    const creditBalanceStart = {};
    const deficitCollection = {};
    for (const year in deficit) {
      creditBalanceStart[year] = { A: -deficit[year].A, B: -deficit[year].B };
      deficitCollection[year] = {
        A: deficit[year].A,
        unspecified: deficit[year].B,
      };
    }

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(...toTransactionArray(deficit, "deficit"));

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 6000;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          { modelYear: 2020, creditA: 0, creditB: 0 },
          { modelYear: 2021, creditA: 0, creditB: 0 },
          { modelYear: 2022, creditA: 0, creditB: 0 },
          { modelYear: 2023, creditA: 0, creditB: 0 },
          { modelYear: 2024, creditA: 0, creditB: 0 },
        ],
        deficits: [
          {
            modelYear: modelYear,
            creditA: expectedClassAReduction,
            creditB: expectedUnspecifiedReduction,
          },
          ...toTransactionArray(deficit).map((x) => ({
            modelYear: x.modelYear,
            creditA: x.A,
            creditB: x.B,
          })),
        ],
      },
    };

    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: creditBalanceStart,
      deficitCollection: deficitCollection,
      carryOverDeficits: deficitCollection,
      pendingBalance: [],
      provisionalBalance: {
        2020: { A: 0, B: 0 },
        2021: { A: 0, B: 0 },
        2022: { A: 0, B: 0 },
        2023: { A: 0, B: 0 },
        2024: { A: 0, B: 0 },
      },
      transactions: {
        creditsIssuedSales: [],
        transfersIn: [],
        transfersOut: [],
        initiativeAgreement: [],
        purchaseAgreement: [],
        administrativeAllocation: [],
        administrativeReduction: [],
        automaticAdministrativePenalty: [],
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    const optionBInput = screen.getByTestId(optionBTestId);
    fireEvent.change(salesInput, { target: { value: testSales } });
    fireEvent.click(optionBInput, { target: { id: "B" } });
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });


  test("gets credit balance for large supplier, sale transactions, option B", async () => {
    // Set up test data
    const supplierClass = "L";
    const modelYear = 2021;
    const complianceRatio = 12.0;
    const zevClassA = 8.0;
    const creditBalanceStart = {
      2019: { A: 120, B: 30 },
      2020: { A: 25, B: 175 },
    };
    const creditsIssuedSales = {
      2020: { A: 50, B: 33 },
      2021: { A: 300, B: 55 },
    };

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(
      ...toTransactionArray(creditBalanceStart, "creditBalanceStart"),
    );
    complianceObligation.push(
      ...toTransactionArray(creditsIssuedSales, "creditsIssuedSales"),
    );

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 6000;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const addingTransactions = [creditBalanceStart, creditsIssuedSales];

    const expectedCreditBalanceEnd = {
      2019: getNetCredits("2019", addingTransactions, []),
      2020: getNetCredits("2020", addingTransactions, []),
      2021: getNetCredits("2021", addingTransactions, []),
    };
    const expectedProvisionalBalance = expectedCreditBalanceEnd;

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          {
            modelYear: 2019,
            creditA: 0,
            creditB: 0,
          },
          {
            modelYear: 2020,
            creditA: 0,
            creditB: 0,
          },
          {
            modelYear: 2021,
            creditA:
              expectedProvisionalBalance["2019"].A +
              expectedProvisionalBalance["2020"].A +
              expectedProvisionalBalance["2021"].A -
              expectedClassAReduction,
            creditB:
              expectedProvisionalBalance["2019"].B +
              expectedProvisionalBalance["2020"].B +
              expectedProvisionalBalance["2021"].B -
              expectedUnspecifiedReduction,
          },
        ],
        deficits: [],
      },
    };
    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: expectedCreditBalanceEnd,
      pendingBalance: [],
      provisionalBalance: expectedProvisionalBalance,
      transactions: {
        creditsIssuedSales: toTransactionArray(creditsIssuedSales),
        transfersIn: [],
        transfersOut: [],
        initiativeAgreement: [],
        purchaseAgreement: [],
        administrativeAllocation: [],
        administrativeReduction: [],
        automaticAdministrativePenalty: [],
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    const creditOptionInput = screen.getByTestId(optionBTestId);
    fireEvent.change(salesInput, { target: { value: testSales } });
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });


  test("gets credit balance for large supplier, sale transactions, option A", async () => {
    // Set up test data
    const supplierClass = "L";
    const modelYear = 2021;
    const complianceRatio = 12.0;
    const zevClassA = 8.0;
    const creditBalanceStart = {
      2019: { A: 120, B: 30 },
      2020: { A: 25, B: 175 },
    };
    const creditsIssuedSales = {
      2020: { A: 50, B: 33 },
      2021: { A: 300, B: 55 },
    };

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(
      ...toTransactionArray(creditBalanceStart, "creditBalanceStart"),
    );
    complianceObligation.push(
      ...toTransactionArray(creditsIssuedSales, "creditsIssuedSales"),
    );

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 6000;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const addingTransactions = [creditBalanceStart, creditsIssuedSales];

    const expectedCreditBalanceEnd = {
      2019: getNetCredits("2019", addingTransactions, []),
      2020: getNetCredits("2020", addingTransactions, []),
      2021: getNetCredits("2021", addingTransactions, []),
    };
    const expectedProvisionalBalance = expectedCreditBalanceEnd;

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          {
            modelYear: 2019,
            creditA: 0,
            creditB: 0,
          },
          {
            modelYear: 2020,
            creditA: 0,
            creditB:
              expectedProvisionalBalance["2019"].A +
              expectedProvisionalBalance["2020"].A +
              expectedProvisionalBalance["2021"].A +
              expectedProvisionalBalance["2019"].B +
              expectedProvisionalBalance["2020"].B -
              expectedTotalReduction,
          },
          {
            modelYear: 2021,
            creditA: 0,
            creditB: expectedProvisionalBalance["2021"].B,
          },
        ],
        deficits: [],
      },
    };
    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: expectedCreditBalanceEnd,
      pendingBalance: [],
      provisionalBalance: expectedProvisionalBalance,
      transactions: {
        creditsIssuedSales: toTransactionArray(creditsIssuedSales),
        transfersIn: [],
        transfersOut: [],
        initiativeAgreement: [],
        purchaseAgreement: [],
        administrativeAllocation: [],
        administrativeReduction: [],
        automaticAdministrativePenalty: [],
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    const creditOptionInput = screen.getByTestId(optionATestId);
    fireEvent.change(salesInput, { target: { value: testSales } });
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });


  test("gets credit balance for large supplier, multiple transactions, pending balance, option B, positive start & end balances", async () => {
    // Set up test data
    const supplierClass = "L";
    const modelYear = 2021;
    const complianceRatio = 12.0;
    const zevClassA = 8.0;
    const creditBalanceStart = {
      2020: { A: 250, B: 75 },
    };
    const pendingBalance = {
      2021: { A: 141, B: 145 },
    };
    const creditsIssuedSales = {
      2019: { A: 145.6, B: 73.5 },
      2020: { A: 119.8, B: 33.6 },
      2021: { A: 165.7, B: 55.6 },
    };
    const transfersIn = {
      2020: { A: 55, B: 60 },
      2021: { A: 50, B: 12 },
    };
    const transfersOut = {
      2020: { A: 30, B: 10.5 },
      2021: { A: 40, B: 21 },
    };
    const initiativeAgreement = {
      2021: { A: 30, B: 32 },
    };
    const purchaseAgreement = {
      2021: { A: 97, B: 89 },
    };
    const administrativeAllocation = {
      2021: { A: 110, B: 115 },
    };
    const administrativeReduction = {
      2019: { A: 34.5, B: 25.5 },
      2021: { A: 121, B: 125 },
    };
    const automaticAdministrativePenalty = {
      2019: { A: 131.2, B: 105.4 },
      2020: { A: 141.2, B: 115.4 },
    };

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(
      ...toTransactionArray(creditBalanceStart, "creditBalanceStart"),
    );
    complianceObligation.push(
      ...toTransactionArray(pendingBalance, "pendingBalance"),
    );
    complianceObligation.push(
      ...toTransactionArray(creditsIssuedSales, "creditsIssuedSales"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersIn, "transfersIn"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersOut, "transfersOut"),
    );
    complianceObligation.push(
      ...toTransactionArray(initiativeAgreement, "initiativeAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(purchaseAgreement, "purchaseAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeAllocation, "administrativeAllocation"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeReduction, "administrativeReduction"),
    );
    complianceObligation.push(
      ...toTransactionArray(automaticAdministrativePenalty, "automaticAdministrativePenalty"),
    );

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 6000;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const addingTransactions = [
      creditBalanceStart,
      creditsIssuedSales,
      transfersIn,
      initiativeAgreement,
      purchaseAgreement,
      administrativeAllocation,
      automaticAdministrativePenalty,
    ];
    const subtractingTransactions = [transfersOut, administrativeReduction];
    const expectedCreditBalanceEnd = {
      2019: getNetCredits("2019", addingTransactions, subtractingTransactions),
      2020: getNetCredits("2020", addingTransactions, subtractingTransactions),
      2021: getNetCredits("2021", addingTransactions, subtractingTransactions),
    };
    const expectedProvisionalBalance = {
      2019: getNetCredits(
        "2019",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2020: getNetCredits(
        "2020",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2021: getNetCredits(
        "2021",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
    };

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          {
            modelYear: 2019,
            creditA: 0,
            creditB: 0,
          },
          {
            modelYear: 2020,
            creditA:
              expectedProvisionalBalance["2019"].A +
              expectedProvisionalBalance["2020"].A -
              expectedClassAReduction,
            creditB:
              expectedProvisionalBalance["2019"].B +
              expectedProvisionalBalance["2020"].B -
              expectedUnspecifiedReduction,
          },
          {
            modelYear: 2021,
            creditA: expectedProvisionalBalance["2021"].A,
            creditB: expectedProvisionalBalance["2021"].B,
          },
        ],
        deficits: [],
      },
    };
    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: expectedCreditBalanceEnd,
      pendingBalance: toTransactionArray(pendingBalance),
      provisionalBalance: expectedProvisionalBalance,
      transactions: {
        creditsIssuedSales: toTransactionArray(creditsIssuedSales),
        transfersIn: toTransactionArray(transfersIn),
        transfersOut: toTransactionArray(transfersOut),
        initiativeAgreement: toTransactionArray(initiativeAgreement),
        purchaseAgreement: toTransactionArray(purchaseAgreement),
        administrativeAllocation: toTransactionArray(administrativeAllocation),
        administrativeReduction: toTransactionArray(administrativeReduction),
        automaticAdministrativePenalty: toTransactionArray(
          automaticAdministrativePenalty,
        ),
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    const creditOptionInput = screen.getByTestId(optionBTestId);
    fireEvent.change(salesInput, { target: { value: testSales } });
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });


  test("gets credit balance for large supplier, multiple transactions, pending balance, option A, positive start & end balances", async () => {
    // Set up test data
    const supplierClass = "L";
    const modelYear = 2021;
    const complianceRatio = 12.0;
    const zevClassA = 8.0;
    const creditBalanceStart = {
      2020: { A: 250, B: 75 },
    };
    const pendingBalance = {
      2021: { A: 141, B: 145 },
    };
    const creditsIssuedSales = {
      2019: { A: 145.6, B: 73.5 },
      2020: { A: 119.8, B: 33.6 },
      2021: { A: 165.7, B: 55.6 },
    };
    const transfersIn = {
      2020: { A: 55, B: 60 },
      2021: { A: 50, B: 12 },
    };
    const transfersOut = {
      2020: { A: 30, B: 10.5 },
      2021: { A: 40, B: 21 },
    };
    const initiativeAgreement = {
      2021: { A: 30, B: 32 },
    };
    const purchaseAgreement = {
      2021: { A: 97, B: 89 },
    };
    const administrativeAllocation = {
      2021: { A: 110, B: 115 },
    };
    const administrativeReduction = {
      2019: { A: 34.5, B: 25.5 },
      2021: { A: 121, B: 125 },
    };
    const automaticAdministrativePenalty = {
      2019: { A: 131.2, B: 105.4 },
      2020: { A: 141.2, B: 115.4 },
    };

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(
      ...toTransactionArray(creditBalanceStart, "creditBalanceStart"),
    );
    complianceObligation.push(
      ...toTransactionArray(pendingBalance, "pendingBalance"),
    );
    complianceObligation.push(
      ...toTransactionArray(creditsIssuedSales, "creditsIssuedSales"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersIn, "transfersIn"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersOut, "transfersOut"),
    );
    complianceObligation.push(
      ...toTransactionArray(initiativeAgreement, "initiativeAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(purchaseAgreement, "purchaseAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeAllocation, "administrativeAllocation"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeReduction, "administrativeReduction"),
    );
    complianceObligation.push(
      ...toTransactionArray(automaticAdministrativePenalty, "automaticAdministrativePenalty"),
    );

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 6000;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const addingTransactions = [
      creditBalanceStart,
      creditsIssuedSales,
      transfersIn,
      initiativeAgreement,
      purchaseAgreement,
      administrativeAllocation,
      automaticAdministrativePenalty,
    ];
    const subtractingTransactions = [transfersOut, administrativeReduction];
    const expectedCreditBalanceEnd = {
      2019: getNetCredits("2019", addingTransactions, subtractingTransactions),
      2020: getNetCredits("2020", addingTransactions, subtractingTransactions),
      2021: getNetCredits("2021", addingTransactions, subtractingTransactions),
    };
    const expectedProvisionalBalance = {
      2019: getNetCredits(
        "2019",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2020: getNetCredits(
        "2020",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2021: getNetCredits(
        "2021",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
    };

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          {
            modelYear: 2019,
            creditA: 0,
            creditB: expectedProvisionalBalance["2019"].B,
          },
          {
            modelYear: 2020,
            creditA:
              expectedProvisionalBalance["2019"].A +
              expectedProvisionalBalance["2020"].A -
              expectedTotalReduction,
            creditB: expectedProvisionalBalance["2020"].B,
          },
          {
            modelYear: 2021,
            creditA: expectedProvisionalBalance["2021"].A,
            creditB: expectedProvisionalBalance["2021"].B,
          },
        ],
        deficits: [],
      },
    };
    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: expectedCreditBalanceEnd,
      pendingBalance: toTransactionArray(pendingBalance),
      provisionalBalance: expectedProvisionalBalance,
      transactions: {
        creditsIssuedSales: toTransactionArray(creditsIssuedSales),
        transfersIn: toTransactionArray(transfersIn),
        transfersOut: toTransactionArray(transfersOut),
        initiativeAgreement: toTransactionArray(initiativeAgreement),
        purchaseAgreement: toTransactionArray(purchaseAgreement),
        administrativeAllocation: toTransactionArray(administrativeAllocation),
        administrativeReduction: toTransactionArray(administrativeReduction),
        automaticAdministrativePenalty: toTransactionArray(
          automaticAdministrativePenalty,
        ),
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    const creditOptionInput = screen.getByTestId(optionATestId);
    fireEvent.change(salesInput, { target: { value: testSales } });
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });


  test("gets credit balance for medium supplier, multiple transactions, pending balance, option B, positive start & end balances", async () => {
    // Set up test data
    const supplierClass = "M";
    const modelYear = 2021;
    const complianceRatio = 12.0;
    const zevClassA = 0;
    const creditBalanceStart = {
      2020: { A: 250, B: 75 },
    };
    const pendingBalance = {
      2021: { A: 141, B: 145 },
    };
    const creditsIssuedSales = {
      2019: { A: 145.6, B: 73.5 },
      2020: { A: 119.8, B: 33.6 },
      2021: { A: 165.7, B: 55.6 },
    };
    const transfersIn = {
      2020: { A: 55, B: 60 },
      2021: { A: 50, B: 12 },
    };
    const transfersOut = {
      2020: { A: 30, B: 10.5 },
      2021: { A: 40, B: 21 },
    };
    const initiativeAgreement = {
      2021: { A: 30, B: 32 },
    };
    const purchaseAgreement = {
      2021: { A: 97, B: 89 },
    };
    const administrativeAllocation = {
      2021: { A: 110, B: 115 },
    };
    const administrativeReduction = {
      2019: { A: 34.5, B: 25.5 },
      2021: { A: 121, B: 125 },
    };
    const automaticAdministrativePenalty = {
      2019: { A: 131.2, B: 105.4 },
      2020: { A: 141.2, B: 115.4 },
    };

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(
      ...toTransactionArray(creditBalanceStart, "creditBalanceStart"),
    );
    complianceObligation.push(
      ...toTransactionArray(pendingBalance, "pendingBalance"),
    );
    complianceObligation.push(
      ...toTransactionArray(creditsIssuedSales, "creditsIssuedSales"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersIn, "transfersIn"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersOut, "transfersOut"),
    );
    complianceObligation.push(
      ...toTransactionArray(initiativeAgreement, "initiativeAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(purchaseAgreement, "purchaseAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeAllocation, "administrativeAllocation"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeReduction, "administrativeReduction"),
    );
    complianceObligation.push(
      ...toTransactionArray(automaticAdministrativePenalty, "automaticAdministrativePenalty"),
    );

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 4800;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const addingTransactions = [
      creditBalanceStart,
      creditsIssuedSales,
      transfersIn,
      initiativeAgreement,
      purchaseAgreement,
      administrativeAllocation,
      automaticAdministrativePenalty,
    ];
    const subtractingTransactions = [transfersOut, administrativeReduction];
    const expectedCreditBalanceEnd = {
      2019: getNetCredits("2019", addingTransactions, subtractingTransactions),
      2020: getNetCredits("2020", addingTransactions, subtractingTransactions),
      2021: getNetCredits("2021", addingTransactions, subtractingTransactions),
    };
    const expectedProvisionalBalance = {
      2019: getNetCredits(
        "2019",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2020: getNetCredits(
        "2020",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2021: getNetCredits(
        "2021",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
    };

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          {
            modelYear: 2019,
            creditA: expectedProvisionalBalance["2019"].A,
            creditB: 0,
          },
          {
            modelYear: 2020,
            creditA: expectedProvisionalBalance["2020"].A,
            creditB: 0,
          },
          {
            modelYear: 2021,
            creditA: expectedProvisionalBalance["2021"].A,
            creditB:
              expectedProvisionalBalance["2019"].B +
              expectedProvisionalBalance["2020"].B +
              expectedProvisionalBalance["2021"].B -
              expectedTotalReduction,
          },
        ],
        deficits: [],
      },
    };
    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: expectedCreditBalanceEnd,
      pendingBalance: toTransactionArray(pendingBalance),
      provisionalBalance: expectedProvisionalBalance,
      transactions: {
        creditsIssuedSales: toTransactionArray(creditsIssuedSales),
        transfersIn: toTransactionArray(transfersIn),
        transfersOut: toTransactionArray(transfersOut),
        initiativeAgreement: toTransactionArray(initiativeAgreement),
        purchaseAgreement: toTransactionArray(purchaseAgreement),
        administrativeAllocation: toTransactionArray(administrativeAllocation),
        administrativeReduction: toTransactionArray(administrativeReduction),
        automaticAdministrativePenalty: toTransactionArray(
          automaticAdministrativePenalty,
        ),
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    const creditOptionInput = screen.getByTestId(optionBTestId);
    fireEvent.change(salesInput, { target: { value: testSales } });
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });


  test("gets credit balance for medium supplier, multiple transactions, pending balance, option A, positive start & end balances", async () => {
    // Set up test data
    const supplierClass = "M";
    const modelYear = 2021;
    const complianceRatio = 12.0;
    const zevClassA = 0;
    const creditBalanceStart = {
      2020: { A: 250, B: 75 },
    };
    const pendingBalance = {
      2021: { A: 141, B: 145 },
    };
    const creditsIssuedSales = {
      2019: { A: 145.6, B: 73.5 },
      2020: { A: 119.8, B: 33.6 },
      2021: { A: 165.7, B: 55.6 },
    };
    const transfersIn = {
      2020: { A: 55, B: 60 },
      2021: { A: 50, B: 12 },
    };
    const transfersOut = {
      2020: { A: 30, B: 10.5 },
      2021: { A: 40, B: 21 },
    };
    const initiativeAgreement = {
      2021: { A: 30, B: 32 },
    };
    const purchaseAgreement = {
      2021: { A: 97, B: 89 },
    };
    const administrativeAllocation = {
      2021: { A: 110, B: 115 },
    };
    const administrativeReduction = {
      2019: { A: 34.5, B: 25.5 },
      2021: { A: 121, B: 125 },
    };
    const automaticAdministrativePenalty = {
      2019: { A: 131.2, B: 105.4 },
      2020: { A: 141.2, B: 115.4 },
    };

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(
      ...toTransactionArray(creditBalanceStart, "creditBalanceStart"),
    );
    complianceObligation.push(
      ...toTransactionArray(pendingBalance, "pendingBalance"),
    );
    complianceObligation.push(
      ...toTransactionArray(creditsIssuedSales, "creditsIssuedSales"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersIn, "transfersIn"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersOut, "transfersOut"),
    );
    complianceObligation.push(
      ...toTransactionArray(initiativeAgreement, "initiativeAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(purchaseAgreement, "purchaseAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeAllocation, "administrativeAllocation"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeReduction, "administrativeReduction"),
    );
    complianceObligation.push(
      ...toTransactionArray(automaticAdministrativePenalty, "automaticAdministrativePenalty"),
    );

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 4800;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const addingTransactions = [
      creditBalanceStart,
      creditsIssuedSales,
      transfersIn,
      initiativeAgreement,
      purchaseAgreement,
      administrativeAllocation,
      automaticAdministrativePenalty,
    ];
    const subtractingTransactions = [transfersOut, administrativeReduction];
    const expectedCreditBalanceEnd = {
      2019: getNetCredits("2019", addingTransactions, subtractingTransactions),
      2020: getNetCredits("2020", addingTransactions, subtractingTransactions),
      2021: getNetCredits("2021", addingTransactions, subtractingTransactions),
    };
    const expectedProvisionalBalance = {
      2019: getNetCredits(
        "2019",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2020: getNetCredits(
        "2020",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2021: getNetCredits(
        "2021",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
    };

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          {
            modelYear: 2019,
            creditA: 0,
            creditB: expectedProvisionalBalance["2019"].B,
          },
          {
            modelYear: 2020,
            creditA:
              expectedProvisionalBalance["2019"].A +
              expectedProvisionalBalance["2020"].A -
              expectedTotalReduction,
            creditB: expectedProvisionalBalance["2020"].B,
          },
          {
            modelYear: 2021,
            creditA: expectedProvisionalBalance["2021"].A,
            creditB: expectedProvisionalBalance["2021"].B,
          },
        ],
        deficits: [],
      },
    };
    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: expectedCreditBalanceEnd,
      pendingBalance: toTransactionArray(pendingBalance),
      provisionalBalance: expectedProvisionalBalance,
      transactions: {
        creditsIssuedSales: toTransactionArray(creditsIssuedSales),
        transfersIn: toTransactionArray(transfersIn),
        transfersOut: toTransactionArray(transfersOut),
        initiativeAgreement: toTransactionArray(initiativeAgreement),
        purchaseAgreement: toTransactionArray(purchaseAgreement),
        administrativeAllocation: toTransactionArray(administrativeAllocation),
        administrativeReduction: toTransactionArray(administrativeReduction),
        automaticAdministrativePenalty: toTransactionArray(
          automaticAdministrativePenalty,
        ),
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    const creditOptionInput = screen.getByTestId(optionATestId);
    fireEvent.change(salesInput, { target: { value: testSales } });
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });


  test("gets credit balance for large supplier, multiple transactions, pending balance, options A & B, positive start & negative end balances", async () => {
    // Set up test data
    const supplierClass = "L";
    const modelYear = 2021;
    const complianceRatio = 12.0;
    const zevClassA = 8.0;
    const creditBalanceStart = {
      2020: { A: 70, B: 15 },
    };
    const pendingBalance = {
      2021: { A: 34, B: 12 },
    };
    const creditsIssuedSales = {
      2020: { A: 79.8, B: 33.6 },
      2021: { A: 65.7, B: 45.6 },
    };
    const transfersIn = {
      2020: { A: 55, B: 60 },
      2021: { A: 50, B: 0 },
    };
    const transfersOut = {
      2020: { A: 100, B: 80.5 },
      2021: { A: 40, B: 21 },
    };
    const initiativeAgreement = {
      2021: { A: 30, B: 32 },
    };
    const purchaseAgreement = {
      2020: { A: 20, B: 20 },
      2021: { A: 37, B: 24 },
    };
    const administrativeAllocation = {
      2019: { A: 35.4, B: 62.8 },
      2021: { A: 10, B: 15 },
    };
    const administrativeReduction = {
      2019: { A: 34.5, B: 25.5 },
      2021: { A: 121, B: 125 },
    };
    const automaticAdministrativePenalty = {
      2021: { A: 15, B: 20 },
    };

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(
      ...toTransactionArray(creditBalanceStart, "creditBalanceStart"),
    );
    complianceObligation.push(
      ...toTransactionArray(pendingBalance, "pendingBalance"),
    );
    complianceObligation.push(
      ...toTransactionArray(creditsIssuedSales, "creditsIssuedSales"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersIn, "transfersIn"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersOut, "transfersOut"),
    );
    complianceObligation.push(
      ...toTransactionArray(initiativeAgreement, "initiativeAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(purchaseAgreement, "purchaseAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeAllocation, "administrativeAllocation"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeReduction, "administrativeReduction"),
    );
    complianceObligation.push(
      ...toTransactionArray(automaticAdministrativePenalty, "automaticAdministrativePenalty"),
    );

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 6000;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const addingTransactions = [
      creditBalanceStart,
      creditsIssuedSales,
      transfersIn,
      initiativeAgreement,
      purchaseAgreement,
      administrativeAllocation,
      automaticAdministrativePenalty,
    ];
    const subtractingTransactions = [transfersOut, administrativeReduction];
    const expectedCreditBalanceEnd = {
      2019: getNetCredits("2019", addingTransactions, subtractingTransactions),
      2020: getNetCredits("2020", addingTransactions, subtractingTransactions),
      2021: getNetCredits("2021", addingTransactions, subtractingTransactions),
    };
    const expectedProvisionalBalance = {
      2019: getNetCredits(
        "2019",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2020: getNetCredits(
        "2020",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2021: getNetCredits(
        "2021",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
    };

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          { modelYear: 2019, creditA: 0, creditB: 0 },
          { modelYear: 2020, creditA: 0, creditB: 0 },
          { modelYear: 2021, creditA: 0, creditB: 0 },
        ],
        deficits: [
          {
            modelYear: 2021,
            creditA:
              expectedClassAReduction -
              (expectedProvisionalBalance["2019"].A +
                expectedProvisionalBalance["2020"].A +
                expectedProvisionalBalance["2021"].A),
            creditB:
              expectedUnspecifiedReduction -
              (expectedProvisionalBalance["2019"].B +
                expectedProvisionalBalance["2020"].B +
                expectedProvisionalBalance["2021"].B),
          },
        ],
      },
    };
    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: expectedCreditBalanceEnd,
      pendingBalance: toTransactionArray(pendingBalance),
      provisionalBalance: expectedProvisionalBalance,
      transactions: {
        creditsIssuedSales: toTransactionArray(creditsIssuedSales),
        transfersIn: toTransactionArray(transfersIn),
        transfersOut: toTransactionArray(transfersOut),
        initiativeAgreement: toTransactionArray(initiativeAgreement),
        purchaseAgreement: toTransactionArray(purchaseAgreement),
        administrativeAllocation: toTransactionArray(administrativeAllocation),
        administrativeReduction: toTransactionArray(administrativeReduction),
        automaticAdministrativePenalty: toTransactionArray(
          automaticAdministrativePenalty,
        ),
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    fireEvent.change(salesInput, { target: { value: testSales } });

    let creditOptionInput = screen.getByTestId(optionBTestId);
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);

    creditOptionInput = screen.getByTestId(optionATestId);
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });


  test("gets credit balance for medium supplier, multiple transactions, pending balance, option A & B, positive start & negative end balances", async () => {
    // Set up test data
    const supplierClass = "M";
    const modelYear = 2021;
    const complianceRatio = 12.0;
    const zevClassA = 0;
    const creditBalanceStart = {
      2020: { A: 70, B: 15 },
    };
    const pendingBalance = {
      2021: { A: 34, B: 12 },
    };
    const creditsIssuedSales = {
      2020: { A: 79.8, B: 33.6 },
      2021: { A: 65.7, B: 45.6 },
    };
    const transfersIn = {
      2020: { A: 55, B: 60 },
      2021: { A: 50, B: 0 },
    };
    const transfersOut = {
      2020: { A: 100, B: 80.5 },
      2021: { A: 40, B: 21 },
    };
    const initiativeAgreement = {
      2021: { A: 30, B: 32 },
    };
    const purchaseAgreement = {
      2020: { A: 20, B: 20 },
      2021: { A: 37, B: 24 },
    };
    const administrativeAllocation = {
      2019: { A: 35.4, B: 62.8 },
      2021: { A: 10, B: 15 },
    };
    const administrativeReduction = {
      2019: { A: 34.5, B: 25.5 },
      2021: { A: 121, B: 125 },
    };
    const automaticAdministrativePenalty = {
      2021: { A: 15, B: 20 },
    };

    // Create report items
    const complianceObligation = [];
    complianceObligation.push(
      ...toTransactionArray(creditBalanceStart, "creditBalanceStart"),
    );
    complianceObligation.push(
      ...toTransactionArray(pendingBalance, "pendingBalance"),
    );
    complianceObligation.push(
      ...toTransactionArray(creditsIssuedSales, "creditsIssuedSales"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersIn, "transfersIn"),
    );
    complianceObligation.push(
      ...toTransactionArray(transfersOut, "transfersOut"),
    );
    complianceObligation.push(
      ...toTransactionArray(initiativeAgreement, "initiativeAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(purchaseAgreement, "purchaseAgreement"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeAllocation, "administrativeAllocation"),
    );
    complianceObligation.push(
      ...toTransactionArray(administrativeReduction, "administrativeReduction"),
    );
    complianceObligation.push(
      ...toTransactionArray(automaticAdministrativePenalty, "automaticAdministrativePenalty"),
    );

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          supplierClass,
          modelYear,
          complianceObligation,
        ),
      });
    });

    // Render component
    await act(async () => {
      render(
        <Router>
          <ComplianceObligationContainer {...baseProps} />
        </Router>,
      );
    });

    // Set up expected values and assert
    const testSales = 4800;
    const expectedTotalReduction = (testSales / 100) * complianceRatio;
    const expectedClassAReduction = (testSales / 100) * zevClassA;
    const expectedUnspecifiedReduction =
      expectedTotalReduction - expectedClassAReduction;

    const addingTransactions = [
      creditBalanceStart,
      creditsIssuedSales,
      transfersIn,
      initiativeAgreement,
      purchaseAgreement,
      administrativeAllocation,
      automaticAdministrativePenalty,
    ];
    const subtractingTransactions = [transfersOut, administrativeReduction];
    const expectedCreditBalanceEnd = {
      2019: getNetCredits("2019", addingTransactions, subtractingTransactions),
      2020: getNetCredits("2020", addingTransactions, subtractingTransactions),
      2021: getNetCredits("2021", addingTransactions, subtractingTransactions),
    };
    const expectedProvisionalBalance = {
      2019: getNetCredits(
        "2019",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2020: getNetCredits(
        "2020",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
      2021: getNetCredits(
        "2021",
        [...addingTransactions, pendingBalance],
        subtractingTransactions,
      ),
    };

    const expectedProps = {
      assertions: [assertionComplianceObligation],
      classAReductions: [
        { modelYear: modelYear, value: expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: modelYear, value: expectedUnspecifiedReduction },
      ],
      reportYear: modelYear,
      sales: testSales,
      supplierClass,
      totalReduction: expectedTotalReduction,
      updatedBalances: {
        balances: [
          { modelYear: 2019, creditA: 0, creditB: 0 },
          { modelYear: 2020, creditA: 0, creditB: 0 },
          { modelYear: 2021, creditA: 0, creditB: 0 },
        ],
        deficits: [
          {
            modelYear: 2021,
            creditB:
              expectedTotalReduction -
              (expectedProvisionalBalance["2019"].A +
                expectedProvisionalBalance["2020"].A +
                expectedProvisionalBalance["2021"].A +
                expectedProvisionalBalance["2019"].B +
                expectedProvisionalBalance["2020"].B +
                expectedProvisionalBalance["2021"].B),
          },
        ],
      },
    };
    const expectedReportDetails = {
      creditBalanceStart: creditBalanceStart,
      creditBalanceEnd: expectedCreditBalanceEnd,
      pendingBalance: toTransactionArray(pendingBalance),
      provisionalBalance: expectedProvisionalBalance,
      transactions: {
        creditsIssuedSales: toTransactionArray(creditsIssuedSales),
        transfersIn: toTransactionArray(transfersIn),
        transfersOut: toTransactionArray(transfersOut),
        initiativeAgreement: toTransactionArray(initiativeAgreement),
        purchaseAgreement: toTransactionArray(purchaseAgreement),
        administrativeAllocation: toTransactionArray(administrativeAllocation),
        administrativeReduction: toTransactionArray(administrativeReduction),
        automaticAdministrativePenalty: toTransactionArray(
          automaticAdministrativePenalty,
        ),
      },
    };

    const salesInput = screen.getByTestId(salesTestId);
    fireEvent.change(salesInput, { target: { value: testSales } });

    let creditOptionInput = screen.getByTestId(optionBTestId);
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);

    creditOptionInput = screen.getByTestId(optionATestId);
    fireEvent.click(creditOptionInput);
    assertProps(detailsPageProps, expectedProps);
    assertProps(detailsPageProps.reportDetails, expectedReportDetails);
  });
});
