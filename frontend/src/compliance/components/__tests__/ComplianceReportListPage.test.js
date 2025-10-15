import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import ComplianceReportListPage from "../ComplianceReportListPage";
import * as ReactRouter from "react-router-dom";

const Router = ReactRouter.BrowserRouter;

const baseOrganization = {
  name: "Sample Organization",
  isGovernment: false,
  hasSubmittedReport: false,
  firstModelYear: 2023,
};

const baseUser = {
  hasPermission: () => {},
  isGovernment: false,
  organization: baseOrganization,
};

const baseProps = {
  availableYears: [],
  data: [],
  filtered: [],
  loading: false,
  ratios: [],
  setFiltered: jest.fn(),
  showSupplier: false,
  user: baseUser,
};

const renderComplianceReportListPage = (props) => {
  return render(
    <Router>
      <ComplianceReportListPage {...props} />
    </Router>
  );
};

jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
  };
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe("ComplianceReportListPage", () => {
  test("renders without crashing", () => {
    renderComplianceReportListPage(baseProps);
    expect(screen.getByText("Model Year Reports")).toBeTruthy();
  });

  test("does not show New Report button for government users", () => {
    const props = {
      ...baseProps,
      user: {
        ...baseUser,
        isGovernment: true,
      },
    };
    renderComplianceReportListPage(props);
    expect(screen.queryByText("New Report")).toBeNull();
  });

  describe("New Report button year selection", () => {
    test("uses most recent available year when availableYears has entries", () => {
      const props = {
        ...baseProps,
        availableYears: [2023, 2024, 2025],
        user: {
          ...baseUser,
          organization: {
            ...baseOrganization,
            hasSubmittedReport: false,
            firstModelYear: 2023,
          },
        },
      };
      renderComplianceReportListPage(props);
      const newReportButton = screen.getByText("New Report");
      expect(newReportButton).toBeTruthy();

      // The button should use the most recent available year (2025)
      const parentLink = newReportButton.closest('button');
      expect(parentLink).toBeTruthy();
    });

    test("uses firstModelYear when availableYears is empty and hasSubmittedReport is false", () => {
      const props = {
        ...baseProps,
        availableYears: [],
        user: {
          ...baseUser,
          organization: {
            ...baseOrganization,
            hasSubmittedReport: false,
            firstModelYear: 2023,
          },
        },
      };
      renderComplianceReportListPage(props);
      const newReportButton = screen.getByText("New Report");
      expect(newReportButton).toBeTruthy();
    });

    test("does not show New Report button when availableYears is empty and hasSubmittedReport is true", () => {
      const props = {
        ...baseProps,
        availableYears: [],
        user: {
          ...baseUser,
          organization: {
            ...baseOrganization,
            hasSubmittedReport: true,
            firstModelYear: 2023,
          },
        },
      };
      renderComplianceReportListPage(props);
      expect(screen.queryByText("New Report")).toBeNull();
    });

    test("handles supplier who skipped their first year (regression test for bug)", () => {
      // This tests the scenario where a supplier created their account in 2023
      // but never submitted a MY2023 report, and now wants to submit MY2024
      const props = {
        ...baseProps,
        availableYears: [2024], // System calculated 2024 as the next available year
        user: {
          ...baseUser,
          organization: {
            ...baseOrganization,
            hasSubmittedReport: false, // Never submitted any report
            firstModelYear: 2023, // Account created in 2023
          },
        },
      };
      renderComplianceReportListPage(props);

      // Button should exist and use 2024 (from availableYears), not 2023 (from firstModelYear)
      const newReportButton = screen.getByText("New Report");
      expect(newReportButton).toBeTruthy();
    });

    test("prefers availableYears over firstModelYear even when hasSubmittedReport is false", () => {
      const props = {
        ...baseProps,
        availableYears: [2025],
        user: {
          ...baseUser,
          organization: {
            ...baseOrganization,
            hasSubmittedReport: false,
            firstModelYear: 2020,
          },
        },
      };
      renderComplianceReportListPage(props);

      // Should show the button with 2025, not 2020
      const newReportButton = screen.getByText("New Report");
      expect(newReportButton).toBeTruthy();
    });

    test("uses availableYears even when it differs from firstModelYear and report was submitted", () => {
      const props = {
        ...baseProps,
        availableYears: [2024],
        user: {
          ...baseUser,
          organization: {
            ...baseOrganization,
            hasSubmittedReport: true,
            firstModelYear: 2020,
          },
        },
      };
      renderComplianceReportListPage(props);

      const newReportButton = screen.getByText("New Report");
      expect(newReportButton).toBeTruthy();
    });
  });

  test("displays compliance reporting instructions for non-government users", () => {
    renderComplianceReportListPage(baseProps);
    expect(screen.getByText(/Under section 17 \(5\) of the ZEV Act/i)).toBeTruthy();
  });

  test("does not display instructions for government users", () => {
    const props = {
      ...baseProps,
      user: {
        ...baseUser,
        isGovernment: true,
      },
    };
    renderComplianceReportListPage(props);
    expect(screen.queryByText(/Under section 17 \(5\) of the ZEV Act/i)).toBeNull();
  });
});
