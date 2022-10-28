//assessed supplementaries should be an array of assessed supplementary reports, ordered by created date (from earliest to most recent)
//the arguments passed to reconcileSupplementaries() may be directly modified, so do not pass props or state to this function
const reconcileSupplementaries = (
  assessmentData,
  assessedSupplementaries,
  complianceData
) => {
  const result = {
    reconciledAssessmentData: assessmentData,
    reconciledLdvSales: complianceData ? complianceData.ldvSales : undefined,
    reconciledComplianceObligation: complianceData
      ? complianceData.complianceObligation
      : undefined
  };

  if (assessedSupplementaries && assessedSupplementaries.length > 0) {
    const latest_supplemental =
      assessedSupplementaries[assessedSupplementaries.length - 1];

    //reconcile legal name, makes, vehicle supplier class, addresses
    if (latest_supplemental.supplierIndormation) {
      for (const supplierInfoAtom of latest_supplemental.supplierInformation) {
        const category = supplierInfoAtom.category;
        const value = supplierInfoAtom.value;
        if (category === 'LEGAL_NAME') {
          assessmentData.legalName = value;
        } else if (category === 'LDV_MAKES') {
          assessmentData.makes = value.split('\n');
        } else if (category === 'SUPPLIER_CLASS') {
          assessmentData.supplierClass = value;
        } else if (category === 'SERVICE_ADDRESS') {
          assessmentData.reconciledServiceAddress = value;
        } else if (category === 'RECORDS_ADDRESS') {
          assessmentData.reconciledRecordsAddress = value;
        }
      }
    }

    //reconcile ldv sales:
    if (latest_supplemental.ldvSales || latest_supplemental.ldvSales === 0) {
      result.reconciledLdvSales = latest_supplemental.ldvSales;
    }

    //reconcile zev sales:
    const zevSales = {};
    for (const zevSale of assessmentData.zevSales) {
      zevSales[zevSale.id] = zevSale;
    }
    for (const supplementary of assessedSupplementaries) {
      const suppZevSales = supplementary.zevSales;
      if (suppZevSales) {
        for (const suppZevSale of suppZevSales) {
          const modelYearReportVehicle = suppZevSale.modelYearReportVehicle;
          if (modelYearReportVehicle && zevSales[modelYearReportVehicle]) {
            const zevSale = zevSales[modelYearReportVehicle];
            if (suppZevSale.sales || suppZevSale.sales === 0) {
              zevSale.salesIssued = suppZevSale.sales;
            }
            if (suppZevSale.make) {
              zevSale.make = make;
            }
            if (suppZevSale.modelName) {
              zevSale.modelName = suppZevSale.modelName;
            }
            if (suppZevSale.modelYear) {
              zevSale.modelYear = suppZevSale.modelYear;
            }
            if (suppZevSale.range) {
              zevSale.range = suppZevSale.range;
            }
            if (suppZevSale.vehicleZevType) {
              zevSale.vehicleZevType = suppZevSale.vehicleZevType;
            }
            if (suppZevSale.zevClass) {
              zevSale.zevClass = suppZevSale.zevClass;
            }
          }
        }
      }
    }

    //reconcile credit activities:
    if (complianceData) {
      const creditActivites = {};
      if (complianceData.complianceObligation) {
        for (const creditActivity of complianceData.complianceObligation) {
          const category = creditActivity.category;
          const modelYear = creditActivity.modelYear.name;
          if (!creditActivites[category]) {
            creditActivites[category] = {};
          }
          creditActivites[category][modelYear] = creditActivity;
        }
      }
      const suppCreditActivities = latest_supplemental.creditActivity;
      if (suppCreditActivities) {
        for (const suppCreditActivity of suppCreditActivities) {
          const category = suppCreditActivity.category;
          const modelYear = suppCreditActivity.modelYear.name;
          if (
            creditActivites[category] &&
            creditActivites[category][modelYear]
          ) {
            const creditActivity = creditActivites[category][modelYear];
            creditActivity.creditAValue = suppCreditActivity.creditAValue;
            creditActivity.creditBValue = suppCreditActivity.creditBValue;
          } else {
            complianceData.complianceObligation.push(suppCreditActivity);
          }
        }
      }
    }
  }

  return result;
};

export default reconcileSupplementaries;
