import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CreditAgreementsListPage from "../CreditAgreementsListPage";

describe("CreditAgreementsListPage", () => {
  const mockProps = {
    creditAgreements: [],
    filtered: [],
    handleClear: jest.fn(),
    loading: false,
    setFiltered: jest.fn(),
    user: {
      isGovernment: true,
      roles: [{ roleCode: "Director" }],
    },
  };

  it("renders the Loading component when loading is true", () => {
    render(<CreditAgreementsListPage {...mockProps} loading={true} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders the header and filter section when user.isGovernment is true", () => {
    render(<CreditAgreementsListPage {...mockProps} />);

    expect(
      screen.getByText("Credit Agreements & Adjustments"),
    ).toBeInTheDocument();
    expect(screen.getByText(/filter by/i)).toBeInTheDocument();
  });

  it("calls handleClear when the clear button is clicked in CreditAgreementsFilter", () => {
    render(<CreditAgreementsListPage {...mockProps} />);

    const clearButton = screen.getByText(/clear/i);
    clearButton.click();

    expect(mockProps.handleClear).toHaveBeenCalled();
  });
});
