import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import ComplianceObligationAmountsTable from "../ComplianceObligationAmountsTable";
import * as ReactRouter from "react-router-dom";

const Router = ReactRouter.BrowserRouter;

const baseProps = {
  "classAReductions": [
      { "modelYear": 2019, "value": 0 },
      { "modelYear": 2023, "value": 123.44 },
      { "modelYear": 2024, "value": 920 },
      { "modelYear": 2025, "value": 33.2 },
  ],
  "page": "obligation",
  "ratios": {
      "complianceRatio": "0.00",
      "zevClassA": "0.00"
  },
  "reportYear": 2019,
  "sales": "6000",
  "statuses": {
      "complianceObligation": { "status": "UNSAVED" },
      "assessment": { "status": "UNSAVED" }
  },
  "supplierClass": "L",
  "totalReduction": 0,
  "unspecifiedReductions": [
    { "modelYear": 2019, "value": 0 },
    { "modelYear": 2023, "value": 3.21 },
    { "modelYear": 2024, "value": 11.22 },
    { "modelYear": 2025, "value": 98.88 },
  ],
};

const renderComplianceObligationAmountsTable = (props) => {
  return render(
    <Router>
      <ComplianceObligationAmountsTable {...props} />
    </Router>
  );
};

const assertTextsExist = (texts) => {
  texts.forEach((text) => {
    expect(screen.queryAllByText(text)).toHaveLength(1);
  });
}

afterEach(() => {
  jest.restoreAllMocks()
  cleanup()
})


describe("Compliance Obligation Amounts Table", () => {
  test("renders without crashing", () => {
    renderComplianceObligationAmountsTable(baseProps);
  });


  test("renders with zero reduction", () => {
    const { queryAllByText } = renderComplianceObligationAmountsTable(baseProps);

    expect(queryAllByText("0.00 %")).toHaveLength(2);
    // one for compliance ratio,
    // one for zev class A,

    expect(queryAllByText("0.00")).toHaveLength(3);
    // one for total reduction,
    // one for class A reduction,
    // one for unspecified reduction
  });


  test("renders with reduction values (case 1)", () => {
    renderComplianceObligationAmountsTable({
      ...baseProps,
      reportYear: 2023,
      ratios: {
        "complianceRatio": "12.00",
        "zevClassA": "9.12"
      },
      totalReduction: 126.65,
    });

    assertTextsExist([
      "2023 Model Year LDV Sales:",
      "12.00 %",  // Compliance Ratio
      "9.12 %",  // ZEV Class A
      "126.65",  // Total Reduction
      "123.44",  // Class A Reduction
      "3.21",  // Unspecified Reduction
    ]);
  });


  test("renders with reduction values (case 2)", () => {
    renderComplianceObligationAmountsTable({
      ...baseProps,
      reportYear: 2024,
      ratios: {
        "complianceRatio": "15.30",
        "zevClassA": "13.00"
      },
      totalReduction: 220,
    });

    assertTextsExist([
      "15.30 %",  // Compliance Ratio
      "13.00 %",  // ZEV Class A
      "220.00",  // Total Reduction
      "920.00",  // Class A Reduction
      "11.22",  // Unspecified Reduction
    ]);
  });


  test("renders with reduction values (case 3)", () => {
    renderComplianceObligationAmountsTable({
      ...baseProps,
      reportYear: 2025,
      ratios: {
        "complianceRatio": "16.42",
        "zevClassA": "14.28"
      },
      totalReduction: 331.75,
    });

    assertTextsExist([
      "16.42 %",  // Compliance Ratio
      "14.28 %",  // ZEV Class A
      "331.75",  // Total Reduction
      "33.20",  // Class A Reduction
      "98.88",  // Unspecified Reduction
    ]);
  });
})