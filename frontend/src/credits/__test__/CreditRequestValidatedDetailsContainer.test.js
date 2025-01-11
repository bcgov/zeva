import React from "react";
import { render, act, cleanup, screen } from "@testing-library/react";
import CreditRequestValidatedDetailsContainer from "../CreditRequestValidatedDetailsContainer";
import * as CreditRequestValidatedDetailsPage from "../components/CreditRequestValidatedDetailsPage";
import { MemoryRouter as Router, Route } from "react-router-dom";
import axios from "axios";
import ROUTES_CREDIT_REQUESTS from "../../app/routes/CreditRequests";

const creditRequestId = "12";

const baseProps = {
  user: {
    username: "TESTER",
    hasPermission: () => {},
  }
};

const testComments = [
  { id: 3, comment: "Test Comment 3" },
  { id: 4, comment: "Test Comment 4" },
  { id: 5, comment: "Test Comment 5" },
  { id: 6, comment: "Test Comment 6" },
  { id: 7, comment: "Test Comment 7" },
  { id: 8, comment: "Test Comment 8" },
  { id: 9, comment: "Test Comment 9" },
  { id: 10, comment: "Test Comment 10" },
];

const unselectedResponseData = [1, 3, 4];

const submissionResponseData = {
  id: 8,
  content: [],
  salesSubmissionComment: testComments,
  unselected: unselectedResponseData.length,
  validationStatus: "VALIDATED",
};

const creditRequestContent = [
  { id: 1, salesDate: "2021-12-11T00:00:00" },
  { id: 2, salesDate: "2021-12-12T00:00:00" },
  { id: 3, salesDate: "2021-12-13T00:00:00" },
];

const baseExpectedDatailsPageProps = {
  invalidatedList: unselectedResponseData,
  submission: submissionResponseData,
  user: baseProps.user,
  content: creditRequestContent,
  itemsCount: creditRequestContent.length,
  tableLoading: false,
};

const renderCreditRequestValidatedDetailsContainer = (props) => {
  return act(async () => {
    render(
      <Router initialEntries={[`/test-url/${creditRequestId}`]}>
        <Route path="/test-url/:id">
          <CreditRequestValidatedDetailsContainer {...props} />
        </Route>
      </Router>
    );
  });
};

class MockedDetailsPage {
  constructor() {
    this.props = undefined;
    jest.spyOn(CreditRequestValidatedDetailsPage, "default").mockImplementation((props) => {
      this.props = props;
      return <div>Mocked Credit Request Validated Details Page</div>;
    });
  }

  changeComment(comment) {
    act(() => this.props.handleCommentChange(comment));
  }

  addComment() {
    act(() => this.props.handleAddComment());
  }

  assertRendered() {
    const pageElements = screen.queryAllByText("Mocked Credit Request Validated Details Page");
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
  jest.spyOn(axios, "get").mockImplementation((url) => {
    switch (url) {
      case ROUTES_CREDIT_REQUESTS.DETAILS.replace(":id", creditRequestId) + "?skip_content=true":
        return Promise.resolve({ data: submissionResponseData });
      case ROUTES_CREDIT_REQUESTS.UNSELECTED.replace(':id', creditRequestId):
        return Promise.resolve({ data: unselectedResponseData });
      default:
        throw new Error(`Unexpected URL: ${url}`);
    }
  });

  jest.spyOn(axios, "post").mockImplementation((url) => {
    expect(url).toEqual(ROUTES_CREDIT_REQUESTS.CONTENT.replace(":id", creditRequestId));
    return Promise.resolve({ data: {
      content: creditRequestContent,
      count: creditRequestContent.length
    } });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  cleanup();
});

describe("Credit Request Validated Details Container", () => {
  test("renders CreditRequestValidatedDetailsPage with basic initial properties", async () => {
    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestValidatedDetailsContainer(baseProps);
    detailsPage.assertRendered();
    detailsPage.assertProps(baseExpectedDatailsPageProps);
  });

  test("handle add-comment", async () => {
    const axiosPatchCreditRequestDetails = jest.fn();
    jest.spyOn(axios, "patch").mockImplementation((url, data) => {
      expect(url).toEqual(ROUTES_CREDIT_REQUESTS.DETAILS.replace(":id", creditRequestId));
      axiosPatchCreditRequestDetails(data);
      return Promise.resolve({});
    });

    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestValidatedDetailsContainer(baseProps);
    const newComment = "New Test Comment.";
    detailsPage.changeComment(newComment);
    detailsPage.addComment();
    expect(axiosPatchCreditRequestDetails).toHaveBeenCalledWith({
      salesSubmissionComment: { comment: newComment }
    });
    detailsPage.assertProps(baseExpectedDatailsPageProps);
  });
});
