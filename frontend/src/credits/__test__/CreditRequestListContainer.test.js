import React from "react";
import { render, act, cleanup, screen, fireEvent } from "@testing-library/react";
import CreditRequestListContainer from "../CreditRequestListContainer";
import * as CreditRequestsPage from "../components/CreditRequestsPage";
import { MemoryRouter as Router, Route } from "react-router-dom";
import axios from "axios";
import ROUTES_CREDIT_REQUESTS from "../../app/routes/CreditRequests";

const baseProps = {
  user: {
    username: "TESTER",
    hasPermission: () => {},
  }
};

const responseDataResults = [
  { id: 1, validationStatus: "DRAFT" },
  { id: 2, validationStatus: "ISSUED" },
  { id: 3, validationStatus: "SUBMITTED" },
  { id: 4, validationStatus: "SUBMITTED" },
];

const baseExpectedDatailsPageProps = {
  user: baseProps.user,
  submissions: responseDataResults,
  submissionsCount: responseDataResults.length,
  page: 1, // default page number
  pageSize: 10, // default page size
  filters: [],
  sorts: [],
};

const testParams = {
  page: 3,
  pageSize: 20,
  queryFilters: [
    { "id": "field1", "value": "Item 1" },
    { "id": "field2", "value": "Item 2" },
  ],
  stateFilters: [
    { "id": "field3", "value": "Item 3" },
    { "id": "field4", "value": "Item 4" },
    { "id": "field5", "value": "Item 5" },
  ],
  sorts: [
    { "id": "field1", "desc": true },
    { "id": "field6", "desc": false },
  ]
}

const renderCreditRequestListContainer = (props, state, query) => {
  return act(async () => {
    const search = query ? `?${query.map(x => `${x.id}=${x.value}`).join("&")}` : undefined;
    render(
      <Router initialEntries={[{ pathname: "/test-url", search, state }]}>
        <Route path="/test-url">
          <CreditRequestListContainer {...props} />
        </Route>
      </Router>
    );
  });
};

class MockedDetailsPage {
  clearButtonTestId = "clear-button";
  constructor() {
    this.props = undefined;
    jest.spyOn(CreditRequestsPage, "default").mockImplementation((props) => {
      this.props = props;
      return (
        <div>
          <div>Mocked Credit Requests Page</div>
          <button data-testid={this.clearButtonTestId} onClick={this.props.handleClear} />
        </div>
      );
    });
  }

  async clickClearButton() {
    await act(async () => {
      await fireEvent.click(screen.getByTestId(this.clearButtonTestId));
    });
  }

  assertRendered() {
    const pageElements = screen.queryAllByText("Mocked Credit Requests Page");
    expect(pageElements).toHaveLength(1);
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
  jest.spyOn(axios, "post").mockImplementation((urlString) => {
    const url = urlString.split("?")[0];
    expect(url).toEqual(ROUTES_CREDIT_REQUESTS.LIST_PAGINATED);
    return Promise.resolve({ data: {
      results: responseDataResults,
      count: responseDataResults.length
    } });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe("Credit Request List Container", () => {
  test("renders CreditRequestValidatedDetailsPage with basic initial properties", async () => {
    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestListContainer(baseProps);
    detailsPage.assertRendered();
    detailsPage.assertProps(baseExpectedDatailsPageProps);
  });


  test("renders CreditRequestValidatedDetailsPage with a specific page number", async () => {
    const { page, pageSize } = testParams;
    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestListContainer(baseProps, { page, pageSize });
    detailsPage.assertRendered();
    detailsPage.assertProps({ ...baseExpectedDatailsPageProps, page, pageSize });
  });


  test("renders CreditRequestValidatedDetailsPage with filter and sort", async () => {
    const { queryFilters, stateFilters, sorts } = testParams;
    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestListContainer(baseProps, { filters: stateFilters, sorts }, queryFilters);
    detailsPage.assertRendered();
    detailsPage.assertProps({
      ...baseExpectedDatailsPageProps,
      filters: [ ...queryFilters, ...stateFilters ],
      sorts
    });
  });


  test("handles clear", async () => {
    const { page, pageSize, stateFilters, sorts } = testParams;
    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestListContainer(baseProps, { page, pageSize, filters: stateFilters, sorts });
    detailsPage.assertRendered();
    detailsPage.assertProps({
      ...baseExpectedDatailsPageProps,
      page,
      pageSize,
      filters: stateFilters,
      sorts
    });
    detailsPage.clickClearButton();
    detailsPage.assertProps({ ...baseExpectedDatailsPageProps, pageSize });
  });
});