import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import CreditAgreementsDetailsPage from "../components/CreditAgreementsDetailsPage";
import "@testing-library/jest-dom/extend-expect";
import { CreditAgreementDetailsPageTestData } from "./test-data/testData";
import axios from "axios";
import { BrowserRouter as Router } from "react-router-dom";

describe("CreditAgreementsDetailsPage", () => {
  const { mockProps } = CreditAgreementDetailsPageTestData();
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn(() => "mockObjectURL");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("renders comments correctly", async () => {
    render(
      <Router>
        <CreditAgreementsDetailsPage {...mockProps} />
      </Router>,
    );
    expect(screen.getByText(/lgtm/i)).toBeInTheDocument();
  });

  it("renders attachments correctly", async () => {
    render(
      <Router>
        <CreditAgreementsDetailsPage {...mockProps} />
      </Router>,
    );
    expect(screen.getByText(/test.pdf/i)).toBeInTheDocument();
  });

  it("submit triggers modal, and confirm triggers handle submit", async () => {
    render(
      <Router>
        <CreditAgreementsDetailsPage {...mockProps} />
      </Router>,
    );
    const submitButton = screen.getByText(/submit to director/i);
    fireEvent.click(submitButton);

    const confirmButton = screen.getByText(/^submit$/i);
    fireEvent.click(confirmButton);

    expect(mockProps.handleSubmit).toHaveBeenCalled();
  });

  it("calls handleAddComment when a comment is added", () => {
    const { container, getByText } = render(
      <Router>
        <CreditAgreementsDetailsPage {...mockProps} />
      </Router>,
    );

    const input = container.querySelector('[data-link="https://quilljs.com"]');
    fireEvent.change(input, { target: { value: "New comment" } });
    const addButton = getByText("Add Comment");
    fireEvent.click(addButton);

    expect(mockProps.handleAddComment).toHaveBeenCalled();
  });

  it("shows conditional text when whether issued or recommended is selected", async () => {
    const { mockProps } = CreditAgreementDetailsPageTestData("ISSUED");
    render(
      <Router>
        <CreditAgreementsDetailsPage {...mockProps} />
      </Router>,
    );
    expect(
      screen.getByText(/IA-1 issued.*by the Director/i),
    ).toBeInTheDocument();
  });

  it("renders agreement attachments and allows file download", async () => {
    const { mockProps } = CreditAgreementDetailsPageTestData();
    axios.get.mockResolvedValue({
      data: new Blob(["test content"], { type: "application/pdf" }),
    });

    render(
      <Router>
        <CreditAgreementsDetailsPage {...mockProps} />
      </Router>,
    );

    expect(screen.getByText(/test.pdf/i)).toBeInTheDocument();

    const downloadButton = screen.getByText(/test.pdf/i);
    fireEvent.click(downloadButton);

    expect(axios.get).toHaveBeenCalledWith("/test.pdf", {
      responseType: "blob",
      headers: { Authorization: null },
    });
  });
});
