// Supplimentary Components Test Data

export const UploadEvidenceTestData = {
  mockFiles: [
    { name: "file1.xlsx", size: 1024 },
    { name: "file2.xlsx", size: 2048 },
  ],
  mockDetails: {
    attachments: [
      {
        id: 1,
        filename: "attachment1.pdf",
        size: 512,
        url: "http://example.com/attachment1.pdf",
      },
    ],
  },
};

export const SupplierInfoTestData = {
  mockDetails: {
    assessmentData: {
      reportAddress: [
        {
          id: 1,
          addressType: { addressType: "Service" },
          representativeName: "John Doe",
          addressLine1: "123 Main St",
          addressLine2: "Suite 100",
          city: "Surrey",
          state: "BC",
          country: "Canada",
          postalCode: "V0S1N0",
        },
        {
          id: 2,
          addressType: { addressType: "Records" },
          representativeName: "Jane Smith",
          addressLine1: "456 Elm St",
          addressLine2: "",
          city: "Victoria",
          state: "BC",
          country: "Canada",
          postalCode: "V8V1V1",
        },
      ],
      legalName: "Test Company",
      reconciledServiceAddress:
        "123 Main St, Suite 100, Surrey, BC, Canada, V0S1N0",
      reconciledRecordsAddress: "456 Elm St, Victoria, BC, Canada, V8V1V1",
      makes: ["Ford", "Toyota"],
      supplierClass: "Class A",
      modelYear: 2023,
    },
  },
  mockNewData: {
    supplierInfo: {
      legalName: "New Test Company",
      serviceAddress: "123 Main St, Suite 100, Surrey, BC, Canada, V0S1N0",
      recordsAddress: "456 Elm St, Victoria, BC, Canada, V8V1V1",
      ldvMakes: "Ford\nToyota",
      supplierClass: "Class B",
    },
  },
  mockUser: { isGovernment: false },
};
