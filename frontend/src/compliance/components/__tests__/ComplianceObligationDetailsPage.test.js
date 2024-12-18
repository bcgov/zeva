import React from "react";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import ComplianceObligationDetailsPage from "../ComplianceObligationDetailsPage";
import * as ComplianceReportAlert from "../ComplianceReportAlert";
import * as ComplianceObligationAmountsTable from "../ComplianceObligationAmountsTable";
import * as ComplianceObligationReductionOffsetTable from "../ComplianceObligationReductionOffsetTable";
import * as ComplianceObligationTableCreditsIssued from "../ComplianceObligationTableCreditsIssued";
import * as ComplianceReportSignoff from "../ComplianceReportSignOff";
import * as ComplianceReportDeleteModal from "../ComplianceReportDeleteModal";
import * as Loading from "../../../app/components/Loading";
import * as Modal from "../../../app/components/Modal";
import * as ReactRouter from "react-router-dom";

const Router = ReactRouter.BrowserRouter;

const baseProps = {
  id: 1,
  assertions: [{ data: "Testing Assertion" }],
  checkboxes: ["Testing Checkbox"],
  classAReductions: [{ data: "Testing Class A Reduction" }],
  creditReductionSelection: "Testing Credit Reduction Selection",
  deductions: [{ data: "Testing Deduction" }],
  details: {
    "complianceObligation": {
      "history": [{ data: "Testing History" }],
      "validationStatus": "DRAFT"
    }
  },
  loading: false,
  pendingBalanceExist: false,
  ratios: { data: "Testing Ratios" },
  reportDetails: { data: "Testing Report Details" },
  reportYear: 2025,
  sales: 7000,
  statuses: {
    "complianceObligation": {
      "status": "UNSAVED",
      "confirmedBy": "Testing Confirmed By",
    },
  },
  supplierClass: "L",
  totalReduction: 1000,
  unspecifiedReductions: [{ data: "Testing Unspecified Reduction" }],
  updatedBalances: { data: "Testing Updated Balances" },
  user: {
    firstName: "Tester",
    lastName: "Testerson",
    isGovernment: false,
  },
  handleCancelConfirmation: () => console.log("handleCancelConfirmation"),
  handleChangeSales: () => {},
  handleCheckboxClick: () => {},
  handleDelete: () => {},
  handleSave: () => {},
  handleUnspecifiedCreditReduction: () => {},
};

class MockedComponent {
  constructor(component, labelText) {
    this.labelText = labelText;
    this.props = undefined;
    jest.spyOn(component, "default").mockImplementation((props) => {
      this.props = props;
      return <div>{labelText}</div>;
    });
  }

  assertProps(expectedProps, items) {
    expect(screen.queryAllByText(this.labelText)).toHaveLength(1);
    for (const item of items) {
      expect(this.props[item]).toEqual(expectedProps[item]);
    }
  }
}

const renderComplianceObligationDetailsPage = (props) => {
  return render(
    <Router>
      <ComplianceObligationDetailsPage {...props} />
    </Router>
  );
};

beforeEach(() => {
  jest.spyOn(Loading, "default").mockImplementation(() =>
    <div>LoadingMock</div>
  );
  jest.spyOn(ComplianceReportAlert, "default").mockImplementation(() =>
    <div>ComplianceReportAlertMock</div>
  );
  jest.spyOn(ComplianceObligationAmountsTable, "default").mockImplementation(() =>
    <div>ComplianceObligationAmountsTableMock</div>
  );
  jest.spyOn(ComplianceObligationReductionOffsetTable, "default").mockImplementation(() =>
    <div>ComplianceObligationReductionOffsetTableMock</div>
  );
  jest.spyOn(ComplianceObligationTableCreditsIssued, "default").mockImplementation(() =>
    <div>ComplianceObligationTableCreditsIssuedMock</div>
  );
  jest.spyOn(ComplianceReportSignoff, "default").mockImplementation(() =>
    <div>ComplianceReportSignoffMock</div>
  );
  jest.spyOn(ComplianceReportDeleteModal, "default").mockImplementation(() =>
    <div>ComplianceReportDeleteModalMock</div>
  );
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});


describe("Compliance Obligation Details Page", () => {
  test("renders without crashing", () => {
    renderComplianceObligationDetailsPage(baseProps);
  });


  test("renders loading message when data is loading", () => {
    renderComplianceObligationDetailsPage({ ...baseProps, loading: true });

    const loading = screen.queryAllByText("LoadingMock");
    expect(loading.length).toBeGreaterThan(0);
  });


  test("renders without loading message when data is loaded", () => {
    renderComplianceObligationDetailsPage(baseProps);

    const loading = screen.queryAllByText("LoadingMock");
    expect(loading).toHaveLength(0);
  });


  test("renders compliance report alert", () => {
    const complianceReportAlert = new MockedComponent(
      ComplianceReportAlert,
      "ComplianceReportAlertMock"
    );
    renderComplianceObligationDetailsPage(baseProps);

    const alert = screen.queryAllByText("ComplianceReportAlertMock");
    expect(alert).toHaveLength(1);

    const expectedProps = {
      next: "Summary",
      report: baseProps.details.complianceObligation,
      status: baseProps.statuses.complianceObligation,
      type: "Compliance Obligation",
    };
    expect(complianceReportAlert.props).toEqual(expectedProps);
  });


  test("renders ComplianceObligationAmountsTable with properties passed on", async () => {
    const complianceObligationAmountsTable = new MockedComponent(
      ComplianceObligationAmountsTable,
      "ComplianceObligationAmountsTableMock"
    );

    renderComplianceObligationDetailsPage(baseProps);

    complianceObligationAmountsTable.assertProps(baseProps, [
      "classAReductions",
      "handleChangeSales",
      "ratios",
      "reportYear",
      "sales",
      "statuses",
      "supplierClass",
      "totalReduction",
      "unspecifiedReductions",
    ]);
    expect(complianceObligationAmountsTable.props.page).toBe("obligation");
  });


  test("renders ComplianceObligationReductionOffsetTable with properties passed on", () => {
    const complianceObligationReductionOffsetTable = new MockedComponent(
      ComplianceObligationReductionOffsetTable,
      "ComplianceObligationReductionOffsetTableMock"
    );
    renderComplianceObligationDetailsPage(baseProps);

    complianceObligationReductionOffsetTable.assertProps(baseProps, [
      "creditReductionSelection",
      "deductions",
      "handleUnspecifiedCreditReduction",
      "pendingBalanceExist",
      "statuses",
      "supplierClass",
      "updatedBalances",
      "user",
    ]);
  });


  test("renders ComplianceObligationTableCreditsIssued with properties passed on", () => {
    const complianceObligationTableCreditsIssued = new MockedComponent(
      ComplianceObligationTableCreditsIssued,
      "ComplianceObligationTableCreditsIssuedMock"
    );
    renderComplianceObligationDetailsPage(baseProps);

    complianceObligationTableCreditsIssued.assertProps(baseProps, [
      "reportDetails",
      "reportYear",
      "pendingBalanceExist",
    ]);
  });


  test("renders ComplianceReportSignoff with properties passed on", () => {
    const complianceReportSignoff = new MockedComponent(
      ComplianceReportSignoff,
      "ComplianceReportSignoffMock"
    );
    renderComplianceObligationDetailsPage(baseProps);

    complianceReportSignoff.assertProps(baseProps, [
      "assertions",
      "checkboxes",
      "handleCheckboxClick",
      "user",
    ]);
  });


  test("renders ComplianceReportDeleteModal", () => {
    renderComplianceObligationDetailsPage(baseProps);

    const component = screen.queryAllByText("ComplianceReportDeleteModalMock");
    expect(component).toHaveLength(1);
  });


  test("clicks Edit and then Cancel", () => {
    const modalCancelTestId = "test-modal-cancel";
    let modalProps
    jest.spyOn(Modal, "default").mockImplementation((props) => {
      modalProps = props;
      return <button
        data-testid={modalCancelTestId}
        onClick={() => props.handleCancel()}
      />;
    });
    
    renderComplianceObligationDetailsPage({
      ...baseProps,
      statuses: { "complianceObligation": { "status": "CONFIRMED" } },
    });

    expect(modalProps.showModal).toBe(false);

    fireEvent.click(screen.getByText("Edit"));
    expect(modalProps.showModal).toBe(true);

    fireEvent.click(screen.getByTestId(modalCancelTestId));
    expect(modalProps.showModal).toBe(false);
  });


  test("clicks Edit and then Submit", () => {
    const modalSubmitTestId = "test-modal-submit";
    let modalProps
    jest.spyOn(Modal, "default").mockImplementation((props) => {
      modalProps = props;
      return <button
        data-testid={modalSubmitTestId}
        onClick={() => props.handleSubmit()}
      />;
    });
    
    const handleCancelConfirmation = jest.fn();
    renderComplianceObligationDetailsPage({
      ...baseProps,
      statuses: { "complianceObligation": { "status": "CONFIRMED" } },
      handleCancelConfirmation,
    });

    expect(modalProps.showModal).toBe(false);

    fireEvent.click(screen.getByText("Edit"));
    expect(modalProps.showModal).toBe(true);

    fireEvent.click(screen.getByTestId(modalSubmitTestId));
    expect(modalProps.showModal).toBe(false);
    expect(handleCancelConfirmation).toHaveBeenCalledTimes(1);
  });
});