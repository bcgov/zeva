// This file contains common test data and functions used in multiple test files in Compliance.

export const complianceRatios = [
    { "id": 1, "modelYear": "2019", "complianceRatio": "0.00", "zevClassA": "0.00" },
    { "id": 2, "modelYear": "2020", "complianceRatio": "9.50", "zevClassA": "6.00" },
    { "id": 3, "modelYear": "2021", "complianceRatio": "12.00", "zevClassA": "8.00" },
    { "id": 4, "modelYear": "2022", "complianceRatio": "14.50", "zevClassA": "10.00" },
    { "id": 5, "modelYear": "2023", "complianceRatio": "17.00", "zevClassA": "12.00" },
    { "id": 6, "modelYear": "2024", "complianceRatio": "19.50", "zevClassA": "14.00" },
    { "id": 7, "modelYear": "2025", "complianceRatio": "22.00", "zevClassA": "16.00" },
    { "id": 8, "modelYear": "2026", "complianceRatio": "26.30", "zevClassA": "15.20" },
    { "id": 9, "modelYear": "2027", "complianceRatio": "42.60", "zevClassA": "28.70" },
    { "id": 10, "modelYear": "2028", "complianceRatio": "58.90", "zevClassA": "43.20" },
    { "id": 11, "modelYear": "2029", "complianceRatio": "74.80", "zevClassA": "58.00" },
    { "id": 12, "modelYear": "2030", "complianceRatio": "91.00", "zevClassA": "73.30" },
    { "id": 13, "modelYear": "2031", "complianceRatio": "93.20", "zevClassA": "77.20" },
    { "id": 14, "modelYear": "2032", "complianceRatio": "95.20", "zevClassA": "80.60" },
    { "id": 15, "modelYear": "2033", "complianceRatio": "97.20", "zevClassA": "83.70" },
    { "id": 16, "modelYear": "2034", "complianceRatio": "99.30", "zevClassA": "86.70" },
    { "id": 17, "modelYear": "2035", "complianceRatio": "100.00", "zevClassA": "89.50" }
  ];

export const getComplianceInfo = (modelYear) => {
  const _modelYear = modelYear.toString();
  return complianceRatios.find((complianceRatio) => complianceRatio.modelYear === _modelYear);
};
