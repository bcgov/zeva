import React from "react";
import { render, act, cleanup, screen, fireEvent, } from "@testing-library/react";
import ComplianceObligationContainer from "../ComplianceObligationContainer";
import * as ComplianceObligationDetailsPage from "../components/ComplianceObligationDetailsPage";
import * as ReactRouter from "react-router-dom";
import axios from "axios";
import ROUTES_COMPLIANCE from "../../app/routes/Compliance";
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from "../../app/routes/SigningAuthorityAssertions";
import { complianceRatios, getComplianceInfo } from "../components/__testHelpers/CommonTestDataFunctions";

const Router = ReactRouter.BrowserRouter;
const salesTestId = "test-input-sales";
const optionATestId = "test-input-option-A";
const optionBTestId = "test-input-option-B";
const saveButtonTestId = "test-button-save";

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

const testCreditTransactions = {
  startBalanceAndSalesOnly: {
    creditBalanceStart: {
      2019: { A: 120, B: 30 },
      2020: { A: 25, B: 175 },
    },
    creditsIssuedSales: {
      2020: { A: 50, B: 33 },
      2021: { A: 300, B: 55 },
    },
  },

  balances_pending_positiveStart_positiveEnd: {
    creditBalanceStart: {
      2020: { A: 250, B: 75 },
    },
    pendingBalance: {
      2021: { A: 141, B: 145 },
    },
    creditsIssuedSales: {
      2019: { A: 145.6, B: 73.5 },
      2020: { A: 119.8, B: 33.6 },
      2021: { A: 165.7, B: 55.6 },
    },
    transfersIn: {
      2020: { A: 55, B: 60 },
      2021: { A: 50, B: 12 },
    },
    transfersOut: {
      2020: { A: 30, B: 10.5 },
      2021: { A: 40, B: 21 },
    },
    initiativeAgreement: {
      2021: { A: 30, B: 32 },
    },
    purchaseAgreement: {
      2021: { A: 97, B: 89 },
    },
    administrativeAllocation: {
      2021: { A: 110, B: 115 },
    },
    administrativeReduction: {
      2019: { A: 34.5, B: 25.5 },
      2021: { A: 121, B: 125 },
    },
    automaticAdministrativePenalty: {
      2019: { A: 131.2, B: 105.4 },
      2020: { A: 141.2, B: 115.4 },
    },
  },

  balances_pending_positiveStart_negativeEnd: {
    creditBalanceStart: {
      2020: { A: 70, B: 15 },
    },
    pendingBalance: {
      2021: { A: 34, B: 12 },
    },
    creditsIssuedSales: {
      2020: { A: 79.8, B: 33.6 },
      2021: { A: 65.7, B: 45.6 },
    },
    transfersIn: {
      2020: { A: 55, B: 60 },
      2021: { A: 50, B: 0 },
    },
    transfersOut: {
      2020: { A: 100, B: 80.5 },
      2021: { A: 40, B: 21 },
    },
    initiativeAgreement: {
      2021: { A: 30, B: 32 },
    },
    purchaseAgreement: {
      2020: { A: 20, B: 20 },
      2021: { A: 37, B: 24 },
    },
    administrativeAllocation: {
      2019: { A: 35.4, B: 62.8 },
      2021: { A: 10, B: 15 },
    },
    administrativeReduction: {
      2019: { A: 34.5, B: 25.5 },
      2021: { A: 121, B: 125 },
    },
    automaticAdministrativePenalty: {
      2021: { A: 15, B: 20 },
    },
  }
}

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
  return { __esModule: true, ...originalModule };
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
      };

    case ROUTES_COMPLIANCE.RATIOS:
      return complianceRatios;

    case ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(":id", id):
      return { complianceObligation };

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

const zeroBalances = (years) => years.map((year) => ({ modelYear: year, creditA: 0, creditB: 0 }));

const renderContainer = async () => {
  await act(async () => {
    render(
      <Router>
        <ComplianceObligationContainer {...baseProps} />
      </Router>,
    );
  });
};

class TestData {
  constructor(supplierClass, modelYear, creditTransactions) {
    this.supplierClass = supplierClass;
    this.modelYear = modelYear;
    this.creditTransactions = creditTransactions ?? {};
    this.complianceInfo = getComplianceInfo(modelYear);
    this.complianceRatio = this.complianceInfo.complianceRatio;
    this.zevClassA = this.complianceInfo.zevClassA;

    // Setup compliance obligation
    this.complianceObligation = [];
    for (const category in this.creditTransactions) {
      const data = this.creditTransactions[category];
      for (const year in data) {
        this.complianceObligation.push({
          category: category,
          modelYear: { name: year },
          creditAValue: data[year].A,
          creditBValue: data[year].B
        });
      }
    }

    // Mock Axios
    jest.spyOn(axios, "get").mockImplementation((url) => {
      return Promise.resolve({
        data: getDataByUrl(
          url,
          baseParams.id,
          this.supplierClass,
          this.modelYear,
          this.complianceObligation,
        ),
      });
    });

    this.axiosPostObligation = jest.fn();
    jest.spyOn(axios, "post").mockImplementation((url, data) => {
      if (url === ROUTES_COMPLIANCE.OBLIGATION) {
        data.creditActivity = "mocked credit activity";
        this.axiosPostObligation(data);
      }
      return Promise.resolve({});
    });

    // Mock ComplianceObligationDetailsPage
    jest.spyOn(ComplianceObligationDetailsPage, "default").mockImplementation((props) => {
      this.detailsPageProps = props;
      return (
        <div>
          <input data-testid={salesTestId} onChange={props.handleChangeSales} />
          <input
            data-testid={optionATestId}
            onClick={() => props.handleUnspecifiedCreditReduction("A")}
          />
          <input
            data-testid={optionBTestId}
            onClick={() => props.handleUnspecifiedCreditReduction("B")}
          />
          <button data-testid={saveButtonTestId} onClick={props.handleSave} />
        </div>
      );
    });

    // Setup transactions
    this.transactions = {
      creditsIssuedSales: this.toTransactionArray(this.creditTransactions.creditsIssuedSales),
      transfersIn: this.toTransactionArray(this.creditTransactions.transfersIn),
      transfersOut: this.toTransactionArray(this.creditTransactions.transfersOut),
      initiativeAgreement: this.toTransactionArray(this.creditTransactions.initiativeAgreement),
      purchaseAgreement: this.toTransactionArray(this.creditTransactions.purchaseAgreement),
      administrativeAllocation: this.toTransactionArray(
        this.creditTransactions.administrativeAllocation
      ),
      administrativeReduction: this.toTransactionArray(
        this.creditTransactions.administrativeReduction
      ),
      automaticAdministrativePenalty: this.toTransactionArray(
        this.creditTransactions.automaticAdministrativePenalty
      ),
    }

    // Calculate Expected Credit Start Balances
    this.expectedCreditBalanceStart = {};
    this.addCredits(this.expectedCreditBalanceStart, this.creditTransactions.creditBalanceStart);
    this.addCredits(this.expectedCreditBalanceStart, this.creditTransactions.deficit, -1);

    // Calculate Expected Credit End Balances
    this.expectedCreditBalanceEnd = {};
    this.addCredits(this.expectedCreditBalanceEnd, this.expectedCreditBalanceStart);
    this.addCredits(this.expectedCreditBalanceEnd, this.creditTransactions.creditsIssuedSales);
    this.addCredits(this.expectedCreditBalanceEnd, this.creditTransactions.transfersIn);
    this.addCredits(this.expectedCreditBalanceEnd, this.creditTransactions.initiativeAgreement);
    this.addCredits(this.expectedCreditBalanceEnd, this.creditTransactions.purchaseAgreement);
    this.addCredits(this.expectedCreditBalanceEnd, this.creditTransactions.administrativeAllocation);
    this.addCredits(this.expectedCreditBalanceEnd, this.creditTransactions.automaticAdministrativePenalty);
    this.addCredits(this.expectedCreditBalanceEnd, this.creditTransactions.transfersOut, -1);
    this.addCredits(this.expectedCreditBalanceEnd, this.creditTransactions.administrativeReduction, -1);

    // Calculate Expected Provisional Balance
    this.expectedProvisionalBalance = {};
    this.addCredits(this.expectedProvisionalBalance, this.expectedCreditBalanceEnd);
    this.addCredits(this.expectedProvisionalBalance, this.creditTransactions.pendingBalance ?? {});

    // Get Expected Pending Balance
    this.expectedPendingBalance = this.toTransactionArray(this.creditTransactions.pendingBalance);

    // Get Expected Report Details
    this.expectedReportDetails = {
      creditBalanceStart: this.expectedCreditBalanceStart,
      creditBalanceEnd: this.expectedCreditBalanceEnd,
      deficitCollection: {},
      carryOverDeficits: {},
      pendingBalance: this.expectedPendingBalance,
      provisionalBalance: this.expectedProvisionalBalance,
      transactions: this.transactions,
    };
  }

  toTransactionArray(data) {
    if (!data) {
      return [];
    }
    const array = [];
    for (const year in data) {
      array.push({
        modelYear: year,
        A: data[year].A,
        B: data[year].B
      });
    }
    return array;
  };

  addCredits(sum, itemToBeAdded, sign) {
    if (!itemToBeAdded) {
      return;
    }
    for (const year in itemToBeAdded) {
      if (!sum[year]) {
        sum[year] = { A: 0, B: 0 };
      }
      sum[year].A += itemToBeAdded[year].A * (sign ?? 1);
      sum[year].B += itemToBeAdded[year].B * (sign ?? 1);
    }
  }

  sumProvisionalBalance(endYear, creditType) {
    let sum = 0;
    for (const year in this.expectedProvisionalBalance) {
      if (year <= endYear) {
        sum += this.expectedProvisionalBalance[year][creditType];
      }
    }
    return sum;
  }

  inputSales(sales) {
    const salesInput = screen.getByTestId(salesTestId);
    fireEvent.change(salesInput, { target: { value: sales } });
    this.expectedTotalReduction =
      this.supplierClass !== "S" ? Math.round(sales * this.complianceRatio) / 100 : 0;
    this.expectedClassAReduction =
      this.supplierClass == "L" ? Math.round(sales * this.zevClassA) / 100 : 0;
    this.expectedUnspecifiedReduction =
      this.expectedTotalReduction - this.expectedClassAReduction;

    // Return base expected props
    return {
      assertions: [assertionComplianceObligation],
      ratios: this.complianceInfo,
      classAReductions: [
        { modelYear: this.modelYear, value: this.expectedClassAReduction },
      ],
      unspecifiedReductions: [
        { modelYear: this.modelYear, value: this.expectedUnspecifiedReduction },
      ],
      reportYear: this.modelYear,
      sales: sales,
      supplierClass: this.supplierClass,
      totalReduction: this.expectedTotalReduction,
      pendingBalanceExist: this.expectedPendingBalance.length > 0,
    }
  }

  selectCreditOption(optionTestId) {
    fireEvent.click(screen.getByTestId(optionTestId));
  }

  assertPropsWithCreditOption(optionTestId, expectedProps, expectedReportDetails) {
    this.selectCreditOption(optionTestId);
    assertProps(this.detailsPageProps, expectedProps);
    assertProps(this.detailsPageProps.reportDetails, expectedReportDetails);
  }
}

beforeEach(() => {
  jest.spyOn(ReactRouter, "useParams").mockReturnValue(baseParams);
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe("Compliance Obligation Container", () => {
  test("renders without crashing", async () => {
    const testData = new TestData("L", 2020);
    await renderContainer();
  });


  for (const supplierClass of ["L", "M", "S"]) {
    test(`gets credit reduction with zero or non-numeric sales input for supplier-class ${supplierClass}`, async () => {
      const modelYear = 2021;
      const testData = new TestData(supplierClass, modelYear);
      await renderContainer();

      const expectedProps = {
        assertions: [assertionComplianceObligation],
        classAReductions: [{ modelYear: modelYear, value: 0 }],
        reportYear: modelYear,
        supplierClass,
        totalReduction: 0,
      };

      assertProps(testData.detailsPageProps, expectedProps); // assert for initial empty input

      expectedProps.sales = 0;
      const salesInput = screen.getByTestId(salesTestId);

      fireEvent.change(salesInput, { target: { value: 0 } });
      assertProps(testData.detailsPageProps, expectedProps);

      fireEvent.change(salesInput, { target: { value: "abc" } });
      assertProps(testData.detailsPageProps, expectedProps);
    });
  }


  for (const testCase of [
    { supplierClass: "L", testSales: 6000 },
    { supplierClass: "M", testSales: 4000 }
  ]) {
    test(`gets credit reduction with multiple compliance-ratios for supplier-class ${testCase.supplierClass}`, async () => {
      const { supplierClass, testSales } = testCase;
      for (const complianceInfo of complianceRatios) {
        const modelYear = Number(complianceInfo.modelYear);
        const testData = new TestData(supplierClass, modelYear);
        await renderContainer();

        const expectedProps = testData.inputSales(testSales); // input a test sales value in the text field
        assertProps(testData.detailsPageProps, expectedProps);
        document.body.innerHTML = "";
      }
    });
  }


  test("gets credit balance for large supplier, positive start balances, no transactions", async () => {
    // Set up test data
    const creditTransactions = {
      creditBalanceStart: {
        2020: { A: 200, B: 100 },
        2021: { A: 0, B: 50 },
        2022: { A: 0, B: 0 },
        2023: { A: 652.4, B: 418.9 },
        2024: { A: 702.5, B: 0 },
      }
    };
    const testData = new TestData("L", 2025, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(6000); // input a test sales value in the text field
    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: [
          ...zeroBalances([2020, 2021, 2022]),
          {
            modelYear: 2023,
            creditA: 0,
            creditB: 100 + 50 + 418.9 - testData.expectedUnspecifiedReduction,
          },
          {
            modelYear: 2024,
            creditA: 200 + 652.4 + 702.5 - testData.expectedClassAReduction,
            creditB: 0,
          },
        ],
        deficits: [],
      },
    };

    testData.assertPropsWithCreditOption(optionBTestId, expectedProps, testData.expectedReportDetails);
  });


  test("gets credit balance for large supplier, deficit start balances, no transactions", async () => {
    // Set up test data
    const creditTransactions = {
      deficit: {
        2021: { A: 18, B: 50.75 },
        2022: { A: 82, B: 2 },
        2023: { A: 253.2, B: 420.12 },
        2024: { A: 102.5, B: 40 },
        2025: { A: 310, B: 104 },
      }
    };
    const modelYear = 2026;
    const testData = new TestData("L", modelYear, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(6000); // input a test sales value in the text field
    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: zeroBalances([2021, 2022, 2023, 2024, 2025]),
        deficits: [
          {
            modelYear: modelYear,
            creditA: testData.expectedClassAReduction,
            creditB: testData.expectedUnspecifiedReduction,
          },
          ...testData.toTransactionArray(creditTransactions.deficit).map((x) => ({
            modelYear: x.modelYear,
            creditA: x.A,
            creditB: x.B,
          })),
        ],
      },
    };

    const expectedDeficitCollection = {};
    for (const year in creditTransactions.deficit) {
      expectedDeficitCollection[year] = {
        A: creditTransactions.deficit[year].A,
        unspecified: creditTransactions.deficit[year].B,
      };
    }

    const expectedReportDetails = {
      ...testData.expectedReportDetails,
      deficitCollection: expectedDeficitCollection,
      carryOverDeficits: expectedDeficitCollection,
      pendingBalance: [],
      provisionalBalance: {
        2021: { A: 0, B: 0 },
        2022: { A: 0, B: 0 },
        2023: { A: 0, B: 0 },
        2024: { A: 0, B: 0 },
        2025: { A: 0, B: 0 },
      },
    }

    testData.assertPropsWithCreditOption(optionBTestId, expectedProps, expectedReportDetails);
  });


  test("gets credit balance for large supplier, sale transactions, option B", async () => {
    // Set up test data
    const creditTransactions = testCreditTransactions.startBalanceAndSalesOnly;
    const testData = new TestData("L", 2021, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(6000); // input a test sales value in the text field
    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: [
          ...zeroBalances([2019, 2020]),
          {
            modelYear: 2021,
            creditA:
              testData.sumProvisionalBalance(2021, "A") -
              testData.expectedClassAReduction,
            creditB:
              testData.sumProvisionalBalance(2021, "B") -
              testData.expectedUnspecifiedReduction,
          },
        ],
        deficits: [],
      },
    };

    testData.assertPropsWithCreditOption(optionBTestId, expectedProps, testData.expectedReportDetails);
  });


  test("gets credit balance for large supplier, sale transactions, option A", async () => {
    // Set up test data
    const creditTransactions = testCreditTransactions.startBalanceAndSalesOnly;
    const testData = new TestData("L", 2021, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(6000); // input a test sales value in the text field

    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: [
          ...zeroBalances([2019]),
          {
            modelYear: 2020,
            creditA: 0,
            creditB:
              testData.sumProvisionalBalance(2021, "A") +
              testData.sumProvisionalBalance(2020, "B") -
              testData.expectedTotalReduction,
          },
          {
            modelYear: 2021,
            creditA: 0,
            creditB: testData.expectedProvisionalBalance["2021"].B,
          },
        ],
        deficits: [],
      },
    };

    testData.assertPropsWithCreditOption(optionATestId, expectedProps, testData.expectedReportDetails);
  });


  test("gets credit balance for large supplier, multiple transactions, pending balance, option B, positive start & end balances", async () => {
    // Set up test data
    const creditTransactions = testCreditTransactions.balances_pending_positiveStart_positiveEnd;
    const testData = new TestData("L", 2021, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(6000); // input a test sales value in the text field
    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: [
          ...zeroBalances([2019]),
          {
            modelYear: 2020,
            creditA:
              testData.sumProvisionalBalance(2020, "A") -
              testData.expectedClassAReduction,
            creditB:
              testData.sumProvisionalBalance(2020, "B") -
              testData.expectedUnspecifiedReduction,
          },
          {
            modelYear: 2021,
            creditA: testData.expectedProvisionalBalance["2021"].A,
            creditB: testData.expectedProvisionalBalance["2021"].B,
          },
        ],
        deficits: [],
      },
    };

    testData.assertPropsWithCreditOption(optionBTestId, expectedProps, testData.expectedReportDetails);
  });


  test("gets credit balance for large supplier, multiple transactions, pending balance, option A, positive start & end balances", async () => {
    // Set up test data
    const creditTransactions = testCreditTransactions.balances_pending_positiveStart_positiveEnd;
    const testData = new TestData("L", 2021, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(6000); // input a test sales value in the text field
    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: [
          {
            modelYear: 2019,
            creditA: 0,
            creditB: testData.expectedProvisionalBalance["2019"].B,
          },
          {
            modelYear: 2020,
            creditA:
              testData.sumProvisionalBalance(2020, "A") -
              testData.expectedTotalReduction,
            creditB: testData.expectedProvisionalBalance["2020"].B,
          },
          {
            modelYear: 2021,
            creditA: testData.expectedProvisionalBalance["2021"].A,
            creditB: testData.expectedProvisionalBalance["2021"].B,
          },
        ],
        deficits: [],
      },
    };
    testData.assertPropsWithCreditOption(optionATestId, expectedProps, testData.expectedReportDetails);
  });


  test("gets credit balance for medium supplier, multiple transactions, pending balance, option B, positive start & end balances", async () => {
    // Set up test data
    const creditTransactions = testCreditTransactions.balances_pending_positiveStart_positiveEnd;
    const testData = new TestData("M", 2021, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(4800); // input a test sales value in the text field
    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: [
          {
            modelYear: 2019,
            creditA: testData.expectedProvisionalBalance["2019"].A,
            creditB: 0,
          },
          {
            modelYear: 2020,
            creditA: testData.expectedProvisionalBalance["2020"].A,
            creditB: 0,
          },
          {
            modelYear: 2021,
            creditA: testData.expectedProvisionalBalance["2021"].A,
            creditB:
              testData.sumProvisionalBalance(2021, "B") -
              testData.expectedTotalReduction,
          },
        ],
        deficits: [],
      },
    };

    testData.assertPropsWithCreditOption(optionBTestId, expectedProps, testData.expectedReportDetails);
  });


  test("gets credit balance for medium supplier, multiple transactions, pending balance, option A, positive start & end balances", async () => {
    // Set up test data
    const creditTransactions = testCreditTransactions.balances_pending_positiveStart_positiveEnd;
    const testData = new TestData("M", 2021, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(4800); // input a test sales value in the text field
    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: [
          {
            modelYear: 2019,
            creditA: 0,
            creditB: testData.expectedProvisionalBalance["2019"].B,
          },
          {
            modelYear: 2020,
            creditA:
              testData.sumProvisionalBalance(2020, "A") -
              testData.expectedTotalReduction,
            creditB: testData.expectedProvisionalBalance["2020"].B,
          },
          {
            modelYear: 2021,
            creditA: testData.expectedProvisionalBalance["2021"].A,
            creditB: testData.expectedProvisionalBalance["2021"].B,
          },
        ],
        deficits: [],
      },
    };

    testData.assertPropsWithCreditOption(optionATestId, expectedProps, testData.expectedReportDetails);
  });


  test("gets credit balance for large supplier, multiple transactions, pending balance, options A & B, positive start & negative end balances", async () => {
    // Set up test data
    const creditTransactions = testCreditTransactions.balances_pending_positiveStart_negativeEnd;
    const testData = new TestData("L", 2021, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(6000); // input a test sales value in the text field
    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: zeroBalances([2019, 2020, 2021]),
        deficits: [
          {
            modelYear: 2021,
            creditA:
              testData.expectedClassAReduction -
              testData.sumProvisionalBalance(2021, "A"),
            creditB:
              testData.expectedUnspecifiedReduction -
              testData.sumProvisionalBalance(2021, "B"),
          },
        ],
      },
    };

    testData.assertPropsWithCreditOption(optionBTestId, expectedProps, testData.expectedReportDetails);
    testData.assertPropsWithCreditOption(optionATestId, expectedProps, testData.expectedReportDetails);
  });


  test("gets credit balance for medium supplier, multiple transactions, pending balance, option A & B, positive start & negative end balances", async () => {
    // Set up test data
    const creditTransactions = testCreditTransactions.balances_pending_positiveStart_negativeEnd;
    const testData = new TestData("M", 2021, creditTransactions);
    await renderContainer();

    // Set up expected values and assert
    const baseExpectedProps = testData.inputSales(4800); // input a test sales value in the text field
    const expectedProps = {
      ...baseExpectedProps,
      updatedBalances: {
        balances: zeroBalances([2019, 2020, 2021]),
        deficits: [
          {
            modelYear: 2021,
            creditB:
              testData.expectedTotalReduction -
              testData.sumProvisionalBalance(2021, "A")-
              testData.sumProvisionalBalance(2021, "B"),
          },
        ],
      },
    };

    testData.assertPropsWithCreditOption(optionBTestId, expectedProps, testData.expectedReportDetails);
    testData.assertPropsWithCreditOption(optionATestId, expectedProps, testData.expectedReportDetails);
  });

  test("handles Save button click", async () => {
    // Set up test data
    const creditTransactions = testCreditTransactions.balances_pending_positiveStart_positiveEnd;
    const testData = new TestData("L", 2021, creditTransactions);
    await renderContainer();
    const testSales = 7200;
    testData.inputSales(testSales); // input a test sales value in the text field
    testData.selectCreditOption(optionBTestId);

    // Set up expected values and assert
    const expectedData = {
      reportId: baseParams.id,
      sales: testSales,
      creditActivity: "mocked credit activity", // mocked for now, can be tested in future
      confirmations: [],
      creditReductionSelection: "B",
    };

    fireEvent.click(screen.getByTestId(saveButtonTestId));
    expect(testData.axiosPostObligation).toHaveBeenCalledWith(expectedData);
  });
});
