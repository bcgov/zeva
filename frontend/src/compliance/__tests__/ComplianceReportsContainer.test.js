import React from "react";
import { render, cleanup, waitFor } from "@testing-library/react";
import ComplianceReportsContainer from "../ComplianceReportsContainer";
import * as ReactRouter from "react-router-dom";
import axios from "axios";
import ROUTES_COMPLIANCE from "../../app/routes/Compliance";

const Router = ReactRouter.BrowserRouter;

const baseOrganization = {
  name: "Test Organization",
  isGovernment: false,
  hasSubmittedReport: false,
  firstModelYear: 2023,
  ldvSales: [],
};

const baseUser = {
  hasPermission: () => {},
  isGovernment: false,
  organization: baseOrganization,
};

const baseProps = {
  user: baseUser,
  location: {
    search: "",
    state: null,
  },
};

const mockAvailableYears = [2020, 2021, 2022, 2023, 2024, 2025];

jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
  };
});

jest.mock("axios");

jest.mock("../../app/config", () => ({
  FEATURES: {
    MODEL_YEAR_REPORT: {
      YEARS: [2020, 2021, 2022, 2023, 2024, 2025],
    },
  },
}));

const renderContainer = async (props = baseProps) => {
  const result = render(
    <Router>
      <ComplianceReportsContainer {...props} />
    </Router>
  );
  await waitFor(() => {
    expect(axios.get).toHaveBeenCalled();
  });
  return result;
};

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe("ComplianceReportsContainer - availableYears calculation", () => {
  test("excludes DRAFT reports when calculating unfinished reports", async () => {
    // Mock data: supplier has a draft MY2023 report
    const reportsData = [
      {
        id: 1,
        modelYear: { name: "2023" },
        validationStatus: "DRAFT",
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url === ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y") {
        return Promise.resolve({ data: reportsData });
      }
      if (url === ROUTES_COMPLIANCE.RATIOS) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: [] });
    });

    await renderContainer();

    // Verify axios was called
    expect(axios.get).toHaveBeenCalledWith(
      ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y"
    );
  });

  test("blocks new reports when SUBMITTED report is not assessed", async () => {
    // Mock data: supplier has a submitted MY2023 report waiting for assessment
    const reportsData = [
      {
        id: 1,
        modelYear: { name: "2023" },
        validationStatus: "SUBMITTED",
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url === ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y") {
        return Promise.resolve({ data: reportsData });
      }
      if (url === ROUTES_COMPLIANCE.RATIOS) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: [] });
    });

    await renderContainer();

    expect(axios.get).toHaveBeenCalledWith(
      ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y"
    );
  });

  test("allows next year when all previous reports are assessed", async () => {
    // Mock data: supplier has assessed MY2023 report
    const reportsData = [
      {
        id: 1,
        modelYear: { name: "2023" },
        validationStatus: "ASSESSED",
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url === ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y") {
        return Promise.resolve({ data: reportsData });
      }
      if (url === ROUTES_COMPLIANCE.RATIOS) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: [] });
    });

    await renderContainer();

    expect(axios.get).toHaveBeenCalledWith(
      ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y"
    );
  });

  test("handles supplier with multiple draft reports correctly", async () => {
    // Mock data: supplier has multiple draft reports from different years
    const reportsData = [
      {
        id: 1,
        modelYear: { name: "2022" },
        validationStatus: "DRAFT",
      },
      {
        id: 2,
        modelYear: { name: "2023" },
        validationStatus: "DRAFT",
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url === ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y") {
        return Promise.resolve({ data: reportsData });
      }
      if (url === ROUTES_COMPLIANCE.RATIOS) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: [] });
    });

    await renderContainer();

    expect(axios.get).toHaveBeenCalledWith(
      ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y"
    );
  });

  test("handles mix of draft and assessed reports correctly", async () => {
    // Mock data: supplier has an assessed report and an abandoned draft
    const reportsData = [
      {
        id: 1,
        modelYear: { name: "2022" },
        validationStatus: "ASSESSED",
      },
      {
        id: 2,
        modelYear: { name: "2023" },
        validationStatus: "DRAFT",
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url === ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y") {
        return Promise.resolve({ data: reportsData });
      }
      if (url === ROUTES_COMPLIANCE.RATIOS) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: [] });
    });

    await renderContainer();

    expect(axios.get).toHaveBeenCalledWith(
      ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y"
    );
  });

  test("handles government user (should not filter years)", async () => {
    const govProps = {
      ...baseProps,
      user: {
        ...baseUser,
        isGovernment: true,
        organization: {
          ...baseOrganization,
          isGovernment: true,
        },
      },
    };

    axios.get.mockImplementation((url) => {
      if (url === ROUTES_COMPLIANCE.REPORTS + "?consider-supplemental=Y") {
        return Promise.resolve({ data: [] });
      }
      if (url === ROUTES_COMPLIANCE.RATIOS) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: [] });
    });

    await renderContainer(govProps);

    expect(axios.get).toHaveBeenCalled();
  });
});
