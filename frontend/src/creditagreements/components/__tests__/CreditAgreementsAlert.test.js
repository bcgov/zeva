import React from "react";
import { render } from "@testing-library/react";
import CreditAgreementsAlert from "../CreditAgreementsAlert";
import Alert from "../../../app/components/Alert";

jest.mock("../../../app/components/Alert", () =>
  jest.fn(() => <div data-testid="alert-mock" />),
);

describe("CreditAgreementsAlert", () => {
  const mockProps = {
    status: "ISSUED",
    date: "2025-01-01",
    isGovernment: false,
    id: "123",
    transactionType: "Purchase Agreement",
    updateUser: { displayName: "John Doe" },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders with correct props for DRAFT status", () => {
    const props = { ...mockProps, status: "DRAFT" };
    render(<CreditAgreementsAlert {...props} />);

    expect(Alert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Draft",
        icon: "exclamation-circle",
        classname: "alert-warning",
        message: "saved, 2025-01-01 by John Doe.",
      }),
      {},
    );
  });

  it("renders with correct props for RECOMMENDED status", () => {
    const props = { ...mockProps, status: "RECOMMENDED" };
    render(<CreditAgreementsAlert {...props} />);

    expect(Alert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Recommended",
        icon: "exclamation-circle",
        classname: "alert-primary",
        message: "recommended for issuance, 2025-01-01 by John Doe.",
      }),
      {},
    );
  });

  it("renders with correct props for RETURNED status", () => {
    const props = { ...mockProps, status: "RETURNED" };
    render(<CreditAgreementsAlert {...props} />);

    expect(Alert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Returned",
        icon: "exclamation-circle",
        classname: "alert-primary",
        message: "PA-123 returned 2025-01-01 by the Director",
      }),
      {},
    );
  });

  it("renders with correct props for ISSUED status (non-government)", () => {
    render(<CreditAgreementsAlert {...mockProps} />);

    expect(Alert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Issued",
        icon: "check-circle",
        classname: "alert-success",
        message: "PA-123 issued 2025-01-01 by the Government of B.C.",
      }),
      {},
    );
  });

  it("renders with correct props for ISSUED status (government)", () => {
    const props = { ...mockProps, isGovernment: true };
    render(<CreditAgreementsAlert {...props} />);

    expect(Alert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Issued",
        icon: "check-circle",
        classname: "alert-success",
        message: "PA-123 issued 2025-01-01 by the Director",
      }),
      {},
    );
  });

  it("renders with default transaction type when not matched", () => {
    const props = { ...mockProps, transactionType: "Unknown Type" };
    render(<CreditAgreementsAlert {...props} />);

    expect(Alert).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "IA-123 issued 2025-01-01 by the Government of B.C.",
      }),
      {},
    );
  });

  it("renders with empty title for unknown status", () => {
    const props = { ...mockProps, status: "UNKNOWN" };
    render(<CreditAgreementsAlert {...props} />);

    expect(Alert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "",
      }),
      {},
    );
  });
});
