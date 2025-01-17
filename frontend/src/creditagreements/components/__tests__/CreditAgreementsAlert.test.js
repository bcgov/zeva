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

  const scenarios = [
    {
      description: "renders with correct props for DRAFT status",
      props: { ...mockProps, status: "DRAFT" },
      expected: {
        title: "Draft",
        icon: "exclamation-circle",
        classname: "alert-warning",
        message: "saved, 2025-01-01 by John Doe.",
      },
    },
    {
      description: "renders with correct props for RECOMMENDED status",
      props: { ...mockProps, status: "RECOMMENDED" },
      expected: {
        title: "Recommended",
        icon: "exclamation-circle",
        classname: "alert-primary",
        message: "recommended for issuance, 2025-01-01 by John Doe.",
      },
    },
    {
      description: "renders with correct props for RETURNED status",
      props: { ...mockProps, status: "RETURNED" },
      expected: {
        title: "Returned",
        icon: "exclamation-circle",
        classname: "alert-primary",
        message: "PA-123 returned 2025-01-01 by the Director",
      },
    },
    {
      description:
        "renders with correct props for ISSUED status (non-government)",
      props: mockProps,
      expected: {
        title: "Issued",
        icon: "check-circle",
        classname: "alert-success",
        message: "PA-123 issued 2025-01-01 by the Government of B.C.",
      },
    },
    {
      description: "renders with correct props for ISSUED status (government)",
      props: { ...mockProps, isGovernment: true },
      expected: {
        title: "Issued",
        icon: "check-circle",
        classname: "alert-success",
        message: "PA-123 issued 2025-01-01 by the Director",
      },
    },
    {
      description: "renders with default transaction type when not matched",
      props: { ...mockProps, transactionType: "Unknown Type" },
      expected: {
        message: "IA-123 issued 2025-01-01 by the Government of B.C.",
      },
    },
    {
      description: "renders with empty title for unknown status",
      props: { ...mockProps, status: "UNKNOWN" },
      expected: {
        title: "",
      },
    },
  ];

  scenarios.forEach(({ description, props, expected }) => {
    it(description, () => {
      render(<CreditAgreementsAlert {...props} />);
      expect(Alert).toHaveBeenCalledWith(expect.objectContaining(expected), {});
    });
  });
});
