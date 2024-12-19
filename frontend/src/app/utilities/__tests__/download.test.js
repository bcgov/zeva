import download from "../download";
import axios from "axios";

jest.mock("axios");

describe("download", () => {
  const mockBlob = new Blob(["file content"], { type: "text/plain" });
  const mockSetAttribute = jest.fn();
  const mockClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    URL.createObjectURL = jest.fn();

    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === "a") {
        return {
          setAttribute: mockSetAttribute,
          click: mockClick,
          href: "",
        };
      }
      return {};
    });
    document.body.appendChild = jest.fn();
  });

  it("should download a file with the filename from content-disposition header", async () => {
    const mockResponse = {
      data: mockBlob,
      headers: { "content-disposition": 'attachment; filename="testfile.txt"' },
    };
    axios.get.mockResolvedValue(mockResponse);

    await download("https://example.com/file", {}, null);

    expect(axios.get).toHaveBeenCalledWith("https://example.com/file", {
      responseType: "blob",
    });
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockSetAttribute).toHaveBeenCalledWith("download", "testfile.txt");
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("should use the filename override if provided", async () => {
    const mockResponse = {
      data: mockBlob,
      headers: {},
    };
    axios.get.mockResolvedValue(mockResponse);

    await download("https://example.com/file", {}, "customname.txt");

    expect(axios.get).toHaveBeenCalledWith("https://example.com/file", {
      responseType: "blob",
    });
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockSetAttribute).toHaveBeenCalledWith("download", "customname.txt");
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("should include additional params in the request", async () => {
    const mockResponse = {
      data: mockBlob,
      headers: { "content-disposition": 'attachment; filename="testfile.txt"' },
    };

    axios.get.mockResolvedValue(mockResponse);

    const params = { headers: { Authorization: "Bearer token" } };
    await download("https://example.com/file", params);

    expect(axios.get).toHaveBeenCalledWith("https://example.com/file", {
      responseType: "blob",
      ...params,
    });
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });
});
