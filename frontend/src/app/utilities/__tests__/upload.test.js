import { upload, chunkUpload, getFileUploadPromises } from "../upload";
import axios from "axios";

jest.mock("axios");

const mockFiles = [new File(["file content"], "testfile.txt")];
const mockMultipleFiles = [
  new File(["file content"], "testfile.txt"),
  new File(["file content"], "testfile2.txt"),
];
const mockResponse = {
  data: { success: true },
};
const mockUrl = "https://example.com/upload";
const additionalData = { key1: "value1", key2: "value2" };

describe("upload", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should upload a file", async () => {
    axios.post.mockResolvedValue(mockResponse);

    const result = await upload(mockUrl, mockFiles);

    expect(axios.post).toHaveBeenCalledWith(mockUrl, expect.any(FormData), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    expect(result).toEqual({
      data: expect.objectContaining({ success: true }),
    });
  });

  it("should upload multiple files", async () => {
    axios.post.mockResolvedValue(mockResponse);
    await upload(mockUrl, mockMultipleFiles);
    expect(axios.post).toHaveBeenCalledWith(mockUrl, expect.any(FormData), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const formData = axios.post.mock.calls[0][1];
    expect(formData.getAll("files").length).toBe(2);
  });

  it("should add additional data to the request", async () => {
    axios.post.mockResolvedValue({ data: "success" });

    const response = await upload(mockUrl, mockFiles, additionalData);

    expect(axios.post).toHaveBeenCalledWith(
      mockUrl,
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );

    const formData = axios.post.mock.calls[0][1];
    expect(formData.getAll("files").length).toBe(1);
    expect(formData.getAll("files")[0]).toEqual(mockFiles[0]);
    expect(formData.get("key1")).toBe("value1");
    expect(formData.get("key2")).toBe("value2");

    expect(response).toEqual({ data: "success" });
  });
});

describe("getFileUploadPromises", () => {
  const mockPresignedUrlResponse = {
    data: {
      url: "http://example.com/upload",
      minioObjectName: "mockObjectName",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock FileReader
    jest.spyOn(global, "FileReader").mockImplementation(function () {
      this.readAsArrayBuffer = jest.fn(() => {
        this.onload({ target: { result: "mocked-file-content" } });
      });
    });

    // Mock axios
    axios.get.mockResolvedValue(mockPresignedUrlResponse);
    axios.put.mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return an array of promises", () => {
    const promises = getFileUploadPromises(mockUrl, mockMultipleFiles);

    expect(promises).toHaveLength(mockMultipleFiles.length);
    promises.forEach((promise) => {
      expect(promise).toBeInstanceOf(Promise);
    });
  });
});
