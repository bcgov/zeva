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

  it('renders correctly for status "DRAFT"', () => {
    setup("DRAFT");
    expect(screen.getByTestId("title").textContent).toBe("Draft");
    expect(screen.getByTestId("icon").textContent).toBe("exclamation-circle");
    expect(screen.getByTestId("classname").textContent).toBe("alert-warning");
    expect(screen.getByTestId("message").textContent).toBe(
      "saved, 2024-12-10 by John Doe.",
    );
  });

  it('renders correctly for status "RECOMMENDED"', () => {
    setup("RECOMMENDED");
    expect(screen.getByTestId("title").textContent).toBe("Recommended");
    expect(screen.getByTestId("icon").textContent).toBe("exclamation-circle");
    expect(screen.getByTestId("classname").textContent).toBe("alert-primary");
    expect(screen.getByTestId("message").textContent).toBe(
      "recommended for reassessment, 2024-12-10 by John Doe.",
    );
  });

  it('renders correctly for status "RETURNED"', () => {
    setup("RETURNED");
    expect(screen.getByTestId("title").textContent).toBe("Returned");
    expect(screen.getByTestId("icon").textContent).toBe("exclamation-circle");
    expect(screen.getByTestId("classname").textContent).toBe("alert-primary");
    expect(screen.getByTestId("message").textContent).toBe(
      "Supplementary report returned 2024-12-10 by the Government of B.C.",
    );
  });

  it('renders correctly for status "SUBMITTED"', () => {
    setup("SUBMITTED");
    expect(screen.getByTestId("title").textContent).toBe("Submitted");
    expect(screen.getByTestId("icon").textContent).toBe("exclamation-circle");
    expect(screen.getByTestId("classname").textContent).toBe("alert-warning");
    expect(screen.getByTestId("message").textContent).toBe(
      "Supplementary report signed and submitted 2024-12-10 by John Doe. Pending analyst review and Director reassessment.",
    );
  });

  it('renders correctly for status "ASSESSED"', () => {
    setup("ASSESSED");
    expect(screen.getByTestId("title").textContent).toBe("Assessed");
    expect(screen.getByTestId("icon").textContent).toBe("exclamation-circle");
    expect(screen.getByTestId("classname").textContent).toBe("alert-success");
    expect(screen.getByTestId("message").textContent).toBe(
      "Supplementary report assessed 2024-12-10 by John Doe.",
    );
  });

  it("renders default title and message for unknown status", () => {
    setup("UNKNOWN");
    expect(screen.getByTestId("title").textContent).toBe("");
    expect(screen.getByTestId("icon").textContent).toBe("exclamation-circle");
    expect(screen.getByTestId("classname").textContent).toBe("");
    expect(screen.getByTestId("message").textContent).toBe("");
  });
});
