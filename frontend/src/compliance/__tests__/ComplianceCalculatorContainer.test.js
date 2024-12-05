import React from "react";
import { render, act, cleanup, screen, fireEvent } from "@testing-library/react";
import ComplianceCalculatorContainer from "../ComplianceCalculatorContainer";
import * as ComplianceCalculatorDetailsPage from "../components/ComplianceCalculatorDetailsPage";
import * as ReactRouter from "react-router-dom";
import axios from "axios";
import ROUTES_COMPLIANCE from "../../app/routes/Compliance";
import ROUTES_VEHICLES from "../../app/routes/Vehicles";
import { complianceRatios, getComplianceInfo } from "../components/__testHelpers/CommonTestDataFunctions";

const Router = ReactRouter.BrowserRouter;

const baseUser = {
  hasPermission: () => {}
};

const baseProps = {
  user: baseUser
};

const lastModelYear = 2027;
const testModelYears = [];
for (let year = 2019; year <= lastModelYear; year++) {
  testModelYears.push({
    name: year.toString(),
    effectiveDate: `${year}-01-01`,
    expirationDate: `${year}-12-31`,
  });
}

const vehicleModels = {
  model1: {
    "id": 1,
    "validationStatus": "VALIDATED",
    "modelName": "Test Model 1",
    "isActive": true,
  },
  model2: {
    "id": 2,
    "validationStatus": "DRAFT",
    "modelName": "Test Model 2",
    "isActive": true,
  },
  model3: {
    "id": 3,
    "validationStatus": "VALIDATED",
    "modelName": "Test Model 3",
    "isActive": true,
  },
  model4: {
    "id": 4,
    "validationStatus": "VALIDATED",
    "modelName": "Test Model 4",
    "isActive": false,
  },
};
const allVehicleModels = Object.values(vehicleModels);

const baseExpectedDatailsPageProps = {
  complianceNumbers: { total: "", classA: "", remaining: "" },
  complianceYearInfo: {},
  modelYearList: testModelYears,
  selectedYearOption: "--",
  supplierSize: "",
  allVehicleModels: [vehicleModels.model1, vehicleModels.model3],
  estimatedModelSales: [{}],
  user: baseUser
};

const renderComplianceCalculatorContainer = async (props) => {
  return await act(async () => {
    render(
    <Router>
      <ComplianceCalculatorContainer {...props} />
    </Router>
    );
  });
};

class MockedDetailsPage {
  constructor() {
    this.props = undefined;
    jest.spyOn(ComplianceCalculatorDetailsPage, "default").mockImplementation((props) => {
      this.props = props;
      return (
        <div>
          <input
            data-testid="input-test-id"
            onChange={props.handleInputChange}
          />
          <button onClick={props.setEstimatedModelSales} />
        </div>
      );
    });
  }

  inputValue(id, value) {
    const input = screen.getByTestId("input-test-id");
    fireEvent.change(input, { target: { id, value } });
  }

  assertProps(expectedProps) {
    const actualProps = {};
    for (const key in expectedProps) {
      actualProps[key] = this.props[key];
    }
    expect(actualProps).toEqual(expectedProps);
  }
}

// explicitly mock axios here instead of using the mock provided by jest-mock-axios,
// as that mock does not have the axios.spread function
jest.mock("axios", () => {
  const originalModule = jest.requireActual("axios");
  return { __esModule: true, ...originalModule };
});

beforeEach(() => {
  jest.spyOn(axios, "get").mockImplementation((url) => {
    switch (url) {
      case ROUTES_VEHICLES.YEARS:
        return Promise.resolve({ data: testModelYears });
      case ROUTES_COMPLIANCE.RATIOS:
        return Promise.resolve({ data: complianceRatios });
      case ROUTES_VEHICLES.LIST:
        return Promise.resolve({ data: allVehicleModels });
      default:
        return Promise.resolve({ data: [] });
    }
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe("Compliance Calculator Container", () => {
  test("renders without crashing", async () => {
    new MockedDetailsPage();
    await renderComplianceCalculatorContainer(baseProps);
  });


  test("renders ComplianceCalculatorDetailsPage with basic initial properties", async () => {
    const detailsPage = new MockedDetailsPage();
    await renderComplianceCalculatorContainer(baseProps);
    detailsPage.assertProps(baseExpectedDatailsPageProps);
  });


  test("handle 'model-year' change without sales and supplier-size input", async () => {
    const detailsPage = new MockedDetailsPage();
    await renderComplianceCalculatorContainer(baseProps);

    ["2024", "2020", "2021", "2025", "2027"].forEach((selectedYearOption) => {
      detailsPage.inputValue("model-year", selectedYearOption);
      const complianceYearInfo = getComplianceInfo(selectedYearOption);
      detailsPage.assertProps({ ...baseExpectedDatailsPageProps, selectedYearOption, complianceYearInfo });
    });
  });


  test("handle 'supplier-size' change without sales and model-year input", async () => {
    const detailsPage = new MockedDetailsPage();
    await renderComplianceCalculatorContainer(baseProps);

    ["medium", "large"].forEach((supplierSize) => {
      detailsPage.inputValue("supplier-size", supplierSize);
      detailsPage.assertProps({ ...baseExpectedDatailsPageProps, supplierSize });
    });
  });


  test("handle sales input without model-year and supplier-size", async () => {
    const detailsPage = new MockedDetailsPage();
    await renderComplianceCalculatorContainer(baseProps);

    [5000, 7400, 0, 300].forEach((sales) => {
      detailsPage.inputValue("total-sales-number", sales.toString());
      detailsPage.assertProps(baseExpectedDatailsPageProps);
    });
  });


  test("handle model-year, supplier-class and sales inputs", async () => {
    const detailsPage = new MockedDetailsPage();
    await renderComplianceCalculatorContainer(baseProps);

    const assertProps = (modelYear, supplierSize, expectedCompliance) => {
      detailsPage.assertProps({
        ...baseExpectedDatailsPageProps,
        selectedYearOption: modelYear,
        supplierSize,
        complianceYearInfo: getComplianceInfo(modelYear),
        complianceNumbers: expectedCompliance,
      });
    };

    detailsPage.inputValue("supplier-size", "large");
    detailsPage.inputValue("model-year", "2019");
    detailsPage.inputValue("total-sales-number", "5000");
    assertProps("2019", "large", { total: 0, classA: 0, remaining: 0 });

    detailsPage.inputValue("supplier-size", "medium");
    assertProps("2019", "medium", { total: 0, classA: "NA", remaining: "NA" });

    detailsPage.inputValue("model-year", "2024");
    assertProps("2024", "medium", { total: 975, classA: "NA", remaining: "NA" });

    detailsPage.inputValue("supplier-size", "large");
    assertProps("2024", "large", { total: 975, classA: 700, remaining: 275 });

    detailsPage.inputValue("total-sales-number", "7500");
    assertProps("2024", "large", { total: 1462.5, classA: 1050, remaining: 412.5 });

    detailsPage.inputValue("model-year", "2026");
    assertProps("2026", "large", { total: 1972.5, classA: 1140, remaining: 832.5 });

    detailsPage.inputValue("supplier-size", "medium");
    assertProps("2026", "medium", { total: 1972.5, classA: "NA", remaining: "NA" });

    detailsPage.inputValue("total-sales-number", "3000");
    assertProps("2026", "medium", { total: 789, classA: "NA", remaining: "NA" });
  });
});