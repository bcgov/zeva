import React from "react";
import { render, cleanup, screen, queryAllByRole } from "@testing-library/react";
import ComplianceRatiosDetailsPage from "../ComplianceRatiosDetailsPage";
import * as Loading from "../../../app/components/Loading";
import * as ReactRouter from "react-router-dom";
import { complianceRatios } from "../__testHelpers/CommonTestDataFunctions";

const Router = ReactRouter.BrowserRouter;

const baseUser = {
  hasPermission: () => {}
};

const propsInLoadedState = {
  user: baseUser,
  complianceRatios,
  loading: false
};

const propsInLoadingState = {
  user: baseUser,
  complianceRatios: [],
  loading: true
};

const renderComplianceRatiosDetailsPage = (props) => {
  return render(
    <Router>
      <ComplianceRatiosDetailsPage {...props} />
    </Router>
  );
};

beforeEach(() => {
  jest.spyOn(Loading, "default").mockImplementation(() => <div>LoadingMock</div>);
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe("Compliance Ratios Details Page", () => {
  test("renders without crashing", () => {
    renderComplianceRatiosDetailsPage(propsInLoadedState);
  });


  test("renders loading message when data is loading", () => {
    renderComplianceRatiosDetailsPage(propsInLoadingState);

    const loading = screen.queryAllByText("LoadingMock");
    expect(loading.length).toBeGreaterThan(0);
  });


  test("renders without loading message when data is loaded", () => {
    renderComplianceRatiosDetailsPage(propsInLoadedState);

    const loading = screen.queryAllByText("LoadingMock");
    expect(loading).toHaveLength(0);
  });


  test("renders compliance ratios correctly", () => {
    renderComplianceRatiosDetailsPage(propsInLoadedState);

    const table = document.getElementsByClassName("compliance-ratios-table").item(0);
    const ratiosDetails = queryAllByRole(table, "rowgroup");

    const actualComplianceRatios = ratiosDetails.map(row => {
      const cells = queryAllByRole(row, "gridcell");
      return {
        modelYear: cells[0].textContent,
        complianceRatio: cells[1].textContent,
        zevClassA: cells[2].textContent
      };
    });

    const expectedComplianceRatios = complianceRatios.map(data => ({
      modelYear: data.modelYear,
      complianceRatio: data.complianceRatio + "%",
      zevClassA: data.zevClassA + "%"
    }));

    expect(actualComplianceRatios).toEqual(expectedComplianceRatios);
  });
});
