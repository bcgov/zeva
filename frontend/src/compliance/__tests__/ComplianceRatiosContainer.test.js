import React from "react";
import { render, act, cleanup, screen } from "@testing-library/react";
import ComplianceRatiosContainer from "../ComplianceRatiosContainer";
import * as ComplianceRatiosDetailsPage from "../components/ComplianceRatiosDetailsPage";
import * as ReactRouter from "react-router-dom";
import axios from "axios";
import ROUTES_COMPLIANCE from "../../app/routes/Compliance";
import { complianceRatios } from "../components/__testHelpers/CommonTestDataFunctions";

const Router = ReactRouter.BrowserRouter;

const baseUser = {
  hasPermission: () => {}
};

const baseProps = {
  user: baseUser
};

const renderComplianceRatiosContainer = async (props) => {
  return await act(async () => {
    render(
      <Router>
        <ComplianceRatiosContainer {...props} />
      </Router>
    );
  });
};

// explicitly mock axios here instead of using the mock provided by jest-mock-axios,
// as that mock does not have the axios.spread function
jest.mock("axios", () => {
  const originalModule = jest.requireActual("axios");
  return { __esModule: true, ...originalModule };
});

beforeEach(() => {
  jest.spyOn(axios, "get").mockImplementation((url) => {
    switch (url) {
      case ROUTES_COMPLIANCE.RATIOS:
        return Promise.resolve({ data: complianceRatios });
      default:
        return Promise.resolve({ data: [] });
    }
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe("Compliance Ratios Container", () => {
  test("renders without crashing", async () => {
    await renderComplianceRatiosContainer(baseProps);
  });


  test("renders compliance-ratios-details-page", async () => {
    const allProps = [];
    jest.spyOn(ComplianceRatiosDetailsPage, "default").mockImplementation((props) => {
      allProps.push(props);
      return <div>ComplianceRatiosDetailsPageMock</div>;
    });

    await renderComplianceRatiosContainer(baseProps);

    const ratiosDetails = screen.queryAllByText("ComplianceRatiosDetailsPageMock");

    // Expect there is exactly one ComplianceRatiosDetailsPage being shown
    expect(ratiosDetails).toHaveLength(1);

    // Expect the data is shown as "loading" first
    expect(allProps[0].loading).toBe(true);

    // Expect the correct compliance-ratios are shown eventually
    expect(allProps[allProps.length - 1]).toEqual({ user: baseUser, loading: false, complianceRatios });
  });
});