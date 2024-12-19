import React from "react";
import {
  cleanup,
  render,
  fireEvent,
  waitFor,
  screen,
} from "@testing-library/react";
import axios from "axios";
import UploadEvidence from "../UploadEvidence";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";
import { UploadEvidenceTestData } from "./test-data/testData";

describe("UploadEvidence component", () => {
  const { mockFiles, mockDetails } = UploadEvidenceTestData;
  jest.mock("axios", () => ({
    get: jest.fn(() =>
      Promise.resolve({
        data: "mockObjectURL",
      }),
    ),
  }));
  const mockSetUploadFiles = jest.fn();
  const mockSetDeleteFiles = jest.fn();

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /// Setup the component with the given mockFiles
  /// @param {Array} files - The mock files to be used in the test
  /// @param {Object} details - The mock details object to be used in the test
  /// @returns {void}
  const setup = (files = [], details = { attachments: [] }) => {
    render(
      <UploadEvidence
        details={details}
        setUploadFiles={mockSetUploadFiles}
        files={files}
        setDeleteFiles={mockSetDeleteFiles}
        deleteFiles={[]}
      />,
    );
  };

  /// Set up the component with a container to access query selectors
  /// @param {Object} details - The details object to be used in the test
  /// @param {Array} files - The files array to be used in the test
  /// @returns {Object} The container object
  const setUpContainer = (details = { attachments: [] }, files = []) => {
    const { container } = render(
      <UploadEvidence
        details={details}
        setUploadFiles={mockSetUploadFiles}
        files={files}
        setDeleteFiles={mockSetDeleteFiles}
        deleteFiles={[]}
      />,
    );
    return container;
  };

  it("renders the component without files/attachments", () => {
    setup();
    expect(screen.getByText("Attachments")).toBeInTheDocument();
    expect(screen.queryByText("Filename")).not.toBeInTheDocument();
  });

  it("calls setUploadFiles when a file is uploaded", async () => {
    const container = setUpContainer();
    const excelFile = new File(["dummy content"], "example.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileDrop = container.querySelector("input[type=file]");
    await userEvent.upload(fileDrop, excelFile);
    await waitFor(() =>
      expect(mockSetUploadFiles).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "example.xlsx" }),
        ]),
      ),
    );
  });

  it("renders files and attachments correctly", () => {
    setup(mockFiles);
    expect(screen.getByText("file1.xlsx")).toBeInTheDocument();
    expect(screen.getByText("file2.xlsx")).toBeInTheDocument();
  });

  it("handles file removal correctly", () => {
    const container = setUpContainer(undefined, mockFiles);
    const deleteButtons = container.querySelectorAll("button.delete");
    expect(deleteButtons.length).toBe(2);

    fireEvent.click(deleteButtons[0]);
    // Check if the file was removed, state is updated after the click event
    expect(mockSetUploadFiles).toHaveBeenCalledWith([
      { name: "file2.xlsx", size: 2048 },
    ]);
  });

  it("marks attachment for deletion", async () => {
    const container = setUpContainer(mockDetails, mockFiles);
    const deleteButtons = container.querySelectorAll("button.delete");
    expect(deleteButtons.length).toBe(3);

    const deleteButton = deleteButtons[0];

    fireEvent.click(deleteButton);
    await waitFor(() => expect(mockSetDeleteFiles).toHaveBeenCalledWith([1]));
  });

  it("handles attachment download correctly", async () => {
    global.URL.createObjectURL = jest.fn(() => "mockObjectURL");
    setUpContainer(mockDetails, mockFiles);
    const downloadButton = screen.queryByRole("button", {
      name: "attachment1.pdf",
    });
    fireEvent.click(downloadButton);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(axios.get).toHaveBeenCalledWith(
      "http://example.com/attachment1.pdf",
      {
        headers: { Authorization: null },
        responseType: "blob",
      },
    );
  });
});
