import React from "react";
import { render, screen } from "@testing-library/react";
import SupplementaryAlert from "../SupplementaryAlert";
import "@testing-library/jest-dom/extend-expect";

// mock the alert component
jest.mock(
  "../../../app/components/Alert",
  () =>
    ({ title, icon, classname, message }) => (
      <div data-testid="alert-mock">
        <span data-testid="title">{title}</span>
        <span data-testid="icon">{icon}</span>
        <span data-testid="classname">{classname}</span>
        <span data-testid="message">{message}</span>
      </div>
    ),
);

describe("SupplementaryAlert", () => {
  const setup = (status) => {
    render(<SupplementaryAlert {...defaultProps} status={status} />);
  };

  const defaultProps = {
    date: "2024-12-10",
    user: "John Doe",
  };

  const checkStatusRender = (title, icon, classname, message) => {
    expect(screen.getByTestId("title").textContent).toBe(title);
    expect(screen.getByTestId("icon").textContent).toBe(icon);
    expect(screen.getByTestId("classname").textContent).toBe(classname);
    expect(screen.getByTestId("message").textContent).toBe(message);
  };

  it('renders correctly for status "DRAFT"', () => {
    setup("DRAFT");
    checkStatusRender(
      "Draft",
      "exclamation-circle",
      "alert-warning",
      "saved, 2024-12-10 by John Doe.",
    );
  });

  it('renders correctly for status "RECOMMENDED"', () => {
    setup("RECOMMENDED");
    checkStatusRender(
      "Recommended",
      "exclamation-circle",
      "alert-primary",
      "recommended for reassessment, 2024-12-10 by John Doe.",
    );
  });

  it('renders correctly for status "RETURNED"', () => {
    setup("RETURNED");
    checkStatusRender(
      "Returned",
      "exclamation-circle",
      "alert-primary",
      "Supplementary report returned 2024-12-10 by the Government of B.C.",
    );
  });

  it('renders correctly for status "SUBMITTED"', () => {
    setup("SUBMITTED");
    checkStatusRender(
      "Submitted",
      "exclamation-circle",
      "alert-warning",
      "Supplementary report signed and submitted 2024-12-10 by John Doe. Pending analyst review and Director reassessment.",
    );
  });

  it('renders correctly for status "ASSESSED"', () => {
    setup("ASSESSED");
    checkStatusRender(
      "Assessed",
      "exclamation-circle",
      "alert-success",
      "Supplementary report assessed 2024-12-10 by John Doe.",
    );
  });

  it("renders default title and message for unknown status", () => {
    setup("UNKNOWN");
    checkStatusRender("", "exclamation-circle", "", "");
  });
});
