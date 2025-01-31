import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import CreditAgreementsForm from "../CreditAgreementsForm";
import "@testing-library/jest-dom/extend-expect";

describe("CreditAgreementsForm", () => {
  const mockProps = {
    addRow: jest.fn(),
    agreementDetails: {
      vehicleSupplier: null,
      transactionType: null,
      effectiveDate: "",
      attachments: [],
      bceidComment: "",
    },
    analystAction: true,
    creditRows: [],
    deleteFiles: [],
    files: [],
    handleChangeDetails: jest.fn(),
    handleChangeRow: jest.fn(),
    handleCommentChangeBceid: jest.fn(),
    handleDeleteRow: jest.fn(),
    handleSubmit: jest.fn(),
    id: null,
    setDeleteFiles: jest.fn(),
    setUploadFiles: jest.fn(),
    suppliers: [{ id: 1, name: "Supplier 1" }],
    transactionTypes: [{ name: "Transaction 1" }],
    user: { isGovernment: true },
    years: [{ name: "2025" }],
    modelYearReports: [],
  };

  // currently does not work because of dynamic class names that change on each run
  xit("matches the snapshot", () => {
    const { asFragment } = render(<CreditAgreementsForm {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls handleChangeDetails when a dropdown changes", () => {
    render(<CreditAgreementsForm {...mockProps} />);

    const supplierDropdown = screen.getByLabelText("Vehicle Supplier");
    fireEvent.change(supplierDropdown, { target: { value: "1" } });

    expect(mockProps.handleChangeDetails).toHaveBeenCalledWith(
      "1",
      "vehicleSupplier",
      true,
    );
  });

  it("calls addRow when the add line button is clicked", () => {
    render(<CreditAgreementsForm {...mockProps} />);

    const addLineButton = screen.getByText(/Add another line/i);
    fireEvent.click(addLineButton);

    expect(mockProps.addRow).toHaveBeenCalled();
  });

  it("calls handleSubmit when the Save button is clicked", () => {
    const updatedProps = {
      ...mockProps,
      agreementDetails: {
        ...mockProps.agreementDetails,
        vehicleSupplier: "Supplier 1",
        transactionType: "Transaction 1",
        effectiveDate: "2025-01-01",
      },
    };

    render(<CreditAgreementsForm {...updatedProps} />);

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(updatedProps.handleSubmit).toHaveBeenCalledWith("");
  });

  it("renders files correctly in the attachments section", () => {
    const testFiles = [
      { id: 1, filename: "TestFile1.pdf", size: 1024, url: "test-url-1" },
    ];

    render(
      <CreditAgreementsForm
        {...mockProps}
        agreementDetails={{
          ...mockProps.agreementDetails,
          attachments: testFiles,
        }}
      />,
    );

    expect(screen.getByText("TestFile1.pdf")).toBeInTheDocument();
  });

  it("removes a file when the delete button is clicked", () => {
    const testFiles = [
      { id: 1, filename: "TestFile1.pdf", size: 1024, url: "test-url-1" },
    ];

    const { container } = render(
      <CreditAgreementsForm
        {...mockProps}
        agreementDetails={{
          ...mockProps.agreementDetails,
          attachments: testFiles,
        }}
      />,
    );

    const deleteButton = container.querySelector(".delete");
    fireEvent.click(deleteButton);

    expect(mockProps.setDeleteFiles).toHaveBeenCalledWith([1]);
  });

  it("renders transaction date input correctly", () => {
    render(<CreditAgreementsForm {...mockProps} />);

    const transactionDateInput = screen.getByLabelText("Transaction Date");
    expect(transactionDateInput).toBeInTheDocument();
    fireEvent.change(transactionDateInput, { target: { value: "2025-01-01" } });

    expect(mockProps.handleChangeDetails).toHaveBeenCalledWith(
      "2025-01-01",
      "effectiveDate",
    );
  });

  it("renders attachment section when files are present", () => {
    const updatedProps = {
      ...mockProps,
      agreementDetails: {
        ...mockProps.agreementDetails,
        attachments: [
          { id: 1, filename: "TestFile1.pdf", size: 1024, url: "test-url-1" },
        ],
      },
    };

    render(<CreditAgreementsForm {...updatedProps} />);

    expect(screen.getByText("TestFile1.pdf")).toBeInTheDocument();
  });

  it("navigates to the correct route when Back button is clicked", () => {
    render(<CreditAgreementsForm {...mockProps} />);

    const backButton = screen.getByText(/Back/i);
    fireEvent.click(backButton);

    expect(window.location.pathname).toBe("/credit-agreements/");
  });

  it("renders Agreement ID input when displayModelYear is false", () => {
    render(<CreditAgreementsForm {...mockProps} />);

    const agreementIdInput = screen.getByLabelText("Agreement ID (optional)");
    expect(agreementIdInput).toBeInTheDocument();
  });

  it("calls handleChangeRow when the model year dropdown changes", () => {
    const mockHandleChangeRow = jest.fn();
    const updatedProps = {
      ...mockProps,
      handleChangeRow: mockHandleChangeRow,
      creditRows: [{ modelYear: "2025", quantity: "10" }],
      years: [{ name: "2025" }, { name: "2026" }],
    };

    render(<CreditAgreementsForm {...updatedProps} />);

    const modelYearDropdown = screen.getByLabelText("model year");
    fireEvent.change(modelYearDropdown, { target: { value: "2026" } });

    expect(mockHandleChangeRow).toHaveBeenCalledWith("2026", "modelYear", 0);
  });

  it("calls handleChangeRow when the quantity input changes", () => {
    const mockHandleChangeRow = jest.fn();
    const updatedProps = {
      ...mockProps,
      handleChangeRow: mockHandleChangeRow,
      creditRows: [{ modelYear: "2025", quantity: "10" }],
    };

    render(<CreditAgreementsForm {...updatedProps} />);

    const quantityInput = screen.getByLabelText("quantity of credits");
    fireEvent.change(quantityInput, { target: { value: "15" } });

    expect(mockHandleChangeRow).toHaveBeenCalledWith("15", "quantity", 0);
  });

  it("calls handleChangeRow when the credit class radio button changes", () => {
    const mockHandleChangeRow = jest.fn();
    const updatedProps = {
      ...mockProps,
      handleChangeRow: mockHandleChangeRow,
      creditRows: [{ creditClass: "A", modelYear: "2025", quantity: "10" }],
    };

    render(<CreditAgreementsForm {...updatedProps} />);
    const creditClassB = screen.getByLabelText("B credits");
    fireEvent.click(creditClassB);

    expect(mockHandleChangeRow).toHaveBeenCalledWith("B", "creditClass", 0);
  });

  it("returns model year values matching vehicle supplier and transaction type", () => {
    const updatedProps = {
      ...mockProps,
      agreementDetails: {
        ...mockProps.agreementDetails,
        vehicleSupplier: "1",
        transactionType: "Reassessment Allocation",
      },
      modelYearReports: [
        { id: 1, organizationId: 1, name: "2025" },
        { id: 2, organizationId: 2, name: "2026" },
      ],
    };

    render(<CreditAgreementsForm {...updatedProps} />);

    const modelYearDropdown = screen.getByLabelText("Model Year");
    const options = within(modelYearDropdown).getAllByRole("option");

    // will return 2 options because of placeholder
    expect(options).toHaveLength(2);
    expect(options[1]).toHaveTextContent("2025");
  });
});
