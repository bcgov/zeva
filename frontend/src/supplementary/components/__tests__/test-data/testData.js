// Supplimentary Components Test Data

export const SupplimentaryAlertsTestData = {
  testCases: [
    {
      status: "DRAFT",
      expected: {
        title: "Draft",
        icon: "exclamation-circle",
        classname: "alert-warning",
        message: "saved, 2024-12-10 by John Doe.",
      },
    },
    {
      status: "RECOMMENDED",
      expected: {
        title: "Recommended",
        icon: "exclamation-circle",
        classname: "alert-primary",
        message: "recommended for reassessment, 2024-12-10 by John Doe.",
      },
    },
    {
      status: "RETURNED",
      expected: {
        title: "Returned",
        icon: "exclamation-circle",
        classname: "alert-primary",
        message:
          "Supplementary report returned 2024-12-10 by the Government of B.C.",
      },
    },
    {
      status: "SUBMITTED",
      expected: {
        title: "Submitted",
        icon: "exclamation-circle",
        classname: "alert-warning",
        message:
          "Supplementary report signed and submitted 2024-12-10 by John Doe. Pending analyst review and Director reassessment.",
      },
    },
    {
      status: "ASSESSED",
      expected: {
        title: "Assessed",
        icon: "exclamation-circle",
        classname: "alert-success",
        message: "Supplementary report assessed 2024-12-10 by John Doe.",
      },
    },
    {
      status: "UNKNOWN",
      expected: {
        title: "",
        icon: "exclamation-circle",
        classname: "",
        message: "",
      },
    },
  ],
};

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
