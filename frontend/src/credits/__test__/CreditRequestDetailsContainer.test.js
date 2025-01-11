import React from "react";
import { render, act, cleanup, screen, fireEvent } from "@testing-library/react";
import CreditRequestDetailsContainer from "../CreditRequestDetailsContainer";
import * as CreditRequestDetailsPage from "../components/CreditRequestDetailsPage";
import { MemoryRouter as Router, Route } from "react-router-dom";
import axios from "axios";
import ROUTES_ICBCVERIFICATION from "../../app/routes/ICBCVerification";
import ROUTES_CREDIT_REQUESTS from "../../app/routes/CreditRequests";

const testIds = {
  checkbox: "testId-checkbox",
  showWarning: "testId-show-warning",
  submit: "testId-submit",
  commentEdit: "testId-comment-edit",
  commentDelete: "testId-comment-delete",
};
const creditRequestId = "12";
const defaultIssueAsMY = true;

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

const dateResponseData = {
  "uploadDate": "2024-09-01",
  "updateTimestamp": "2024-11-14T15:04:12"
};

const submissionResponseData = {
  id: 1,
  content: [],
  salesSubmissionComment: testComments
};

const baseExpectedDatailsPageProps = {
  submission: submissionResponseData,
  uploadDate: dateResponseData,
  user: baseProps.user,
  issueAsMY: defaultIssueAsMY,
};

const renderCreditRequestDetailsContainer = (props) => {
  return act(async () => {
    render(
      <Router initialEntries={[`/test-url/${creditRequestId}`]}>
        <Route path="/test-url/:id">
          <CreditRequestDetailsContainer {...props} />
        </Route>
      </Router>
    );
  });
};

class MockedDetailsPage {
  constructor() {
    this.props = undefined;
    jest.spyOn(CreditRequestDetailsPage, "default").mockImplementation((props) => {
      this.props = props;
      return (
        <div>
          <div>Mocked Credit Request Details Page</div>
          <input
            data-testid={testIds.checkbox}
            onClick={() => props.handleCheckboxClick({ target: { checked: this.inputParams.checked } })}
          />
          <input
            data-testid={testIds.showWarning}
            onClick={() => props.setShowWarning(this.inputParams.showWarning)}
          />
          <input
            data-testid={testIds.submit}
            onClick={() => props.handleSubmit(this.inputParams.validationStatus, this.inputParams.comment)}
          />
          <input
            data-testid={testIds.commentEdit}
            onClick={() => props.handleInternalCommentEdit(this.inputParams.id, this.inputParams.comment)}
          />
          <input
            data-testid={testIds.commentDelete}
            onClick={() => props.handleInternalCommentDelete(this.inputParams.id)}
          />
        </div>
      );
    });
  }

  setShowWarning(value) {
    this.props.setShowWarning(value);
  };

  async triggerInput(testId, inputParams) {
    this.inputParams = inputParams;
    await act(async () => {
      await fireEvent.click(screen.getByTestId(testId));
    });
    this.inputParams = undefined;
  }

  assertRendered() {
    const pageElements = screen.queryAllByText("Mocked Credit Request Details Page");
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

const originalWindowLocation = window.location;
const windowLocationReload = jest.fn();

beforeAll(() => {
  delete window.location;
  window.location = { ...originalWindowLocation, reload: windowLocationReload };
});

afterAll(() => {
  window.location = originalWindowLocation;
});

beforeEach(() => {
  jest.spyOn(axios, "get").mockImplementation((url) => {
    switch (url) {
      case ROUTES_ICBCVERIFICATION.DATE:
        return Promise.resolve({ data: dateResponseData });
      case ROUTES_CREDIT_REQUESTS.DETAILS.replace(":id", creditRequestId):
        return Promise.resolve({ data: submissionResponseData });
      default:
        throw new Error(`Unexpected URL: ${url}`);
    }
  });
});

afterEach(() => {
  windowLocationReload.mockClear();
  jest.restoreAllMocks();
  cleanup();
});

describe("Credit Request Details Container", () => {
  test("renders CreditRequestDetailsPage with basic initial properties", async () => {
    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestDetailsContainer(baseProps);
    detailsPage.assertRendered();
    detailsPage.assertProps(baseExpectedDatailsPageProps);
  });


  test("triggers checkbox click", async () => {
    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestDetailsContainer(baseProps);

    await detailsPage.triggerInput(testIds.checkbox, { checked: false });
    detailsPage.assertProps({...baseExpectedDatailsPageProps, issueAsMY: false});

    await detailsPage.triggerInput(testIds.checkbox, { checked: true });
    detailsPage.assertProps({...baseExpectedDatailsPageProps, issueAsMY: true});
  });


  [
    { validationStatus: "SUBMITTED", reloadCount: 1 },
    { validationStatus: "SUBMITTED", comment: "Test Comment", reloadCount: 1 },
    { validationStatus: "VALIDATED", reloadCount: 1 },
    { validationStatus: "VALIDATED", comment: "Test Comment", reloadCount: 1 },
    { validationStatus: "RECOMMEND_APPROVAL", showWarning: true, issueAsMY: defaultIssueAsMY },
    { validationStatus: "RECOMMEND_APPROVAL", comment: "Test Comment", showWarning: true, issueAsMY: defaultIssueAsMY },
    { validationStatus: "OTHER" },
    { validationStatus: "OTHER", comment: "Test Comment" },
  ].forEach((testParams) => {
    const { validationStatus, comment, reloadCount, showWarning, issueAsMY } = testParams;
    test(`triggers submit in ${validationStatus} status with${comment ? "" : " no"} comment`, async () => {
      const axiosPatchCreditRequestDetails = jest.fn();
      jest.spyOn(axios, "patch").mockImplementation((url, data) => {
        expect(url).toBe(ROUTES_CREDIT_REQUESTS.DETAILS.replace(":id", creditRequestId));
        axiosPatchCreditRequestDetails(data);
        return Promise.resolve({});
      });

      const detailsPage = new MockedDetailsPage();
      await renderCreditRequestDetailsContainer(baseProps);

      if (showWarning) {
        await detailsPage.triggerInput(testIds.showWarning, { showWarning });
      }
      await detailsPage.triggerInput(testIds.submit, { validationStatus, comment });

      expect(windowLocationReload).toHaveBeenCalledTimes(reloadCount ?? 0);
      expect(axiosPatchCreditRequestDetails).toHaveBeenCalledWith({
        validationStatus,
        issueAsModelYearReport: issueAsMY,
        salesSubmissionComment: comment ? { comment } : undefined,
        commentType: comment ? { govt: false } : undefined
      });
    });
  });


  test("triggers comment-edit", async () => {
    const newCommentIndex = 2;
    const commentId = testComments[newCommentIndex].id;
    const newComment = { id: commentId, comment: "New Test Comment", updateTimestamp: "2024-12-18T00:04:10" };

    const axiosPatchCreditRequestUpdateComment = jest.fn();
    jest.spyOn(axios, "patch").mockImplementation((url, data) => {
      expect(url).toBe(ROUTES_CREDIT_REQUESTS.UPDATE_COMMENT.replace(':id', commentId));
      axiosPatchCreditRequestUpdateComment(data);
      return Promise.resolve({ data: newComment });
    });

    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestDetailsContainer(baseProps);
    await detailsPage.triggerInput(testIds.commentEdit, newComment);
    expect(axiosPatchCreditRequestUpdateComment).toHaveBeenCalledWith({ comment: newComment.comment });

    testComments[newCommentIndex] = newComment;
    detailsPage.assertProps(baseExpectedDatailsPageProps);
  });


  test("triggers comment-delete", async () => {
    const deleteCommendIndex = 3;
    const commentId = testComments[deleteCommendIndex].id;

    const axiosPatchCreditRequestDeleteComment = jest.fn();
    jest.spyOn(axios, "patch").mockImplementation((url) => {
      expect(url).toBe(ROUTES_CREDIT_REQUESTS.DELETE_COMMENT.replace(':id', commentId));
      axiosPatchCreditRequestDeleteComment();
      return Promise.resolve({});
    });

    const detailsPage = new MockedDetailsPage();
    await renderCreditRequestDetailsContainer(baseProps);
    await detailsPage.triggerInput(testIds.commentDelete, { id: commentId });
    expect(axiosPatchCreditRequestDeleteComment).toHaveBeenCalledTimes(1);

    testComments.splice(deleteCommendIndex, 1);
    detailsPage.assertProps(baseExpectedDatailsPageProps);
  });
});
