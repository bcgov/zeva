import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ZevSales from "../ZevSales";
import "@testing-library/jest-dom/extend-expect";

describe("ZevSales Component", () => {
  const defaultProps = {
    addSalesRow: jest.fn(),
    details: {
      actualStatus: "DRAFT",
      status: "DRAFT",
      assessmentData: {
        modelYear: "2023",
      },
    },
    handleInputChange: jest.fn(),
    salesRows: [
      {
        oldData: {
          sales: 10,
          modelYear: 2023,
          make: "Tesla",
          model: "Model S",
          zevType: "BEV",
          range: 400,
          zevClass: "A",
        },
        newData: {},
      },
    ],
    isEditable: true,
  };

  it("renders the component with correct model year and heading", () => {
    render(<ZevSales {...defaultProps} />);
    expect(
      screen.getByText("2023 Model Year Zero-Emission Vehicles Sales"),
    ).toBeInTheDocument();
  });

  it("renders the sales table with correct data", () => {
    render(<ZevSales {...defaultProps} />);

    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Model Year")).toBeInTheDocument();
    expect(screen.getByText("Make")).toBeInTheDocument();
    expect(screen.getByText("Model")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Range (km)")).toBeInTheDocument();
    expect(screen.getByText("ZEV Class")).toBeInTheDocument();

    expect(screen.getByDisplayValue("10")).toBeInTheDocument(); // Sales input
    expect(screen.getByDisplayValue("2023")).toBeInTheDocument(); // Model Year input
    expect(screen.getByDisplayValue("Tesla")).toBeInTheDocument(); // Make input
    expect(screen.getByDisplayValue("Model S")).toBeInTheDocument(); // Model input
    expect(screen.getByDisplayValue("BEV")).toBeInTheDocument(); // Type input
    expect(screen.getByDisplayValue("400")).toBeInTheDocument(); // Range input
    expect(screen.getByDisplayValue("A")).toBeInTheDocument(); // ZEV Class input
  });

  it("calls handleInputChange when sales input changes", () => {
    render(<ZevSales {...defaultProps} />);

    const salesInput = screen.getByDisplayValue("10");
    fireEvent.change(salesInput, { target: { value: "20" } });

    expect(defaultProps.handleInputChange).toHaveBeenCalledWith(
      expect.any(Object),
    );
    expect(salesInput).toHaveClass("highlight");
  });

  it("removes highlight class when sales input matches old data", () => {
    render(<ZevSales {...defaultProps} />);

    const salesInput = screen.getByDisplayValue("10");
    fireEvent.change(salesInput, { target: { value: "20" } });
    fireEvent.change(salesInput, { target: { value: "10" } });

    expect(salesInput).not.toHaveClass("highlight");
  });

  it("renders the add another line button if status is not ASSESSED and editable", () => {
    render(<ZevSales {...defaultProps} />);

    const addButton = screen.getByText("Add another line for a new ZEV model");
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(defaultProps.addSalesRow).toHaveBeenCalled();
  });

  it("does not render the add another line button if status is ASSESSED", () => {
    render(
      <ZevSales
        {...defaultProps}
        details={{ ...defaultProps.details, actualStatus: "ASSESSED" }}
      />,
    );

    const addButton = screen.queryByText(
      "Add another line for a new ZEV model",
    );
    expect(addButton).not.toBeInTheDocument();
  });
});
