import React from "react";
import { render, cleanup } from "@testing-library/react";
import ComplianceReportAlert from "../ComplianceReportAlert";
import * as Alert from "../../../app/components/Alert";
import * as ReactRouter from "react-router-dom";

const Router = ReactRouter.BrowserRouter;

const baseProps = {
  next: "Summary",
  report: {
    "history": [{ data: "Testing History" }],
    "validationStatus": "DRAFT"
  },
  status: {
    "status": "UNSAVED",
  },
  type: "Testing Type",
};

const baseTestCases = [{
  statuses: ["UNSAVED", "SAVED"],
  title: "Model Year Report Draft",
  classname: "alert-warning",
}, {
  statuses: ["SUBMITTED", "RETURNED", "RECOMMENDED"],
  title: "Model Year Report Submitted",
  classname: "alert-primary",
}, {
  statuses: ["ASSESSED"],
  title: "Model Year Report Assessed",
  classname: "alert-success",
}];

class MockedAlert {
  constructor() {
    this.props = undefined;
    jest.spyOn(Alert, "default").mockImplementation((props) => {
      this.props = props;
      return <div>AlertMocked</div>;
    });
  }

  assertProps(expectedProps) {
    const actualProps = {
      title: this.props.title,
      classname: this.props.classname,
    };
    expect(actualProps).toEqual(expectedProps);
  }
}

const renderComplianceReportAlert = (props) => {
  return render(
    <Router>
      <ComplianceReportAlert {...props} />
    </Router>
  );
};

afterEach(() => {
  jest.restoreAllMocks()
  cleanup()
})


describe("Compliance Report Alert", () => {
  test("renders without crashing", () => {
    renderComplianceReportAlert(baseProps);
  });

  test("renders as Report Summary without crashing", () => {
    renderComplianceReportAlert({
      ...baseProps,
      type: "Report Summary",
    });
  });


  [
    ...baseTestCases,
    {
      statuses: ["CONFIRMED"],
      title: "Model Year Report Draft",
      classname: "alert-warning",
    }
  ].forEach((testCase) => testCase.statuses.forEach((status) => {
    test(`renders as Report Summary as ${status}`, () => {
      const mockedAlert = new MockedAlert();
      renderComplianceReportAlert({
        ...baseProps,
        type: "Report Summary",
        status: { status: status },
      });
      
      mockedAlert.assertProps({
        title: testCase.title,
        classname: testCase.classname,
      });
    });
  }));


  [
    ...baseTestCases,
    {
      statuses: ["CONFIRMED"],
      title: "Model Year Report Draft",
      classname: "alert-primary",
    }
  ].forEach((testCase) => testCase.statuses.forEach((status) => {
    test(`renders as Report Summary as ${status}`, () => {
      const mockedAlert = new MockedAlert();
      renderComplianceReportAlert({
        ...baseProps,
        status: { status: status },
      });
      
      mockedAlert.assertProps({
        title: testCase.title,
        classname: testCase.classname,
      });
    });
  }));
})