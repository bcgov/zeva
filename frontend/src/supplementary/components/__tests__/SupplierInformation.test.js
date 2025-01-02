import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import SupplierInformation from "../SupplierInformation";
import { SupplierInfoTestData } from "./test-data/testData";

describe("SupplierInformation component", () => {
  const mockHandleInputChange = jest.fn();
  const { mockDetails, mockNewData, mockUser } = SupplierInfoTestData;

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    details: mockDetails,
    handleInputChange: mockHandleInputChange,
    newData: mockNewData,
    user: mockUser,
    isEditable: true,
  };

  const setup = () => {
    render(<SupplierInformation {...defaultProps} />);
  };

  it("displays initial values", () => {
    setup();
    expect(screen.getByText("Test Company")).toBeInTheDocument();
    // address used in multiple places
    expect(
      screen.getAllByText("123 Main St, Suite 100, Surrey, BC, Canada, V0S1N0"),
    ).not.toHaveLength(0);
    expect(
      screen.getAllByText("456 Elm St, Victoria, BC, Canada, V8V1V1"),
    ).not.toHaveLength(0);
    expect(screen.getByText("Ford")).toBeInTheDocument();
    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByText("Class A")).toBeInTheDocument();
  });

  it("applies the highlight class when values differ", () => {
    setup();
    expect(screen.getByDisplayValue("New Test Company")).toHaveClass(
      "highlight",
    );
    expect(screen.getByDisplayValue("Class B")).toHaveClass("highlight");
  });

  it("does not apply the highlight class when values match", () => {
    const props = {
      ...defaultProps,
      newData: {
        supplierInfo: {
          ...SupplierInfoTestData.mockNewData.supplierInfo,
          legalName: "Test Company",
          supplierClass: "Class A",
        },
      },
    };

    render(<SupplierInformation {...props} />);

    expect(screen.getByDisplayValue("Test Company")).not.toHaveClass(
      "highlight",
    );
    expect(screen.getByDisplayValue("Class A")).not.toHaveClass("highlight");
  });

  it("calls handleInputChange on input change", () => {
    setup();
    const input = screen.getByDisplayValue("New Test Company");
    fireEvent.change(input, { target: { value: "Updated Company" } });

    expect(mockHandleInputChange).toHaveBeenCalledTimes(1);
  });
  it("renders a message for non-government users", () => {
    setup();
    expect(
      screen.getByText(
        "Make the required updates in the fields next to the original submitted values and provide an explanation in the comment box at the bottom of this form.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render the message for government users", () => {
    const props = {
      ...defaultProps,
      user: { isGovernment: true },
    };
    render(<SupplierInformation {...props} />);
    expect(
      screen.queryByText(
        "Make the required updates in the fields next to the original submitted values and provide an explanation in the comment box at the bottom of this form.",
      ),
    ).not.toBeInTheDocument();
  });
});
