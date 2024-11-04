// assessed supplementaries should be an array of assessed supplementary reports, ordered by created date (from earliest to most recent)
// the arguments passed to reconcileSupplementaries() may be directly modified, so do not pass props or state to this function
const reconcileSupplementaries = (
  assessmentData,
  assessedSupplementaries,
  complianceData,
  previousReassessmentCreditActivities
) => {
  const result = {
    reconciledAssessmentData: assessmentData,
    reconciledLdvSales: complianceData ? complianceData.ldvSales : undefined,
    reconciledComplianceObligation: complianceData
      ? complianceData.complianceObligation
      : undefined
  }

  const zevSales = {}
  if (assessmentData.zevSales) {
    for (const zevSale of assessmentData.zevSales) {
      zevSale.fromModelYearReport = true
      zevSales[zevSale.id] = zevSale
    }
  }

  if (assessedSupplementaries && assessedSupplementaries.length > 0) {
    const latestSupplemental =
      assessedSupplementaries[assessedSupplementaries.length - 1]

    // reconcile legal name, makes, vehicle supplier class, addresses
    if (latestSupplemental.supplierInformation) {
      for (const supplierInfoAtom of latestSupplemental.supplierInformation) {
        const category = supplierInfoAtom.category
        const value = supplierInfoAtom.value
        if (category === 'LEGAL_NAME') {
          assessmentData.legalName = value
        } else if (category === 'LDV_MAKES') {
          assessmentData.makes = value.split('\n')
        } else if (category === 'SUPPLIER_CLASS') {
          assessmentData.supplierClass = value
        } else if (category === 'SERVICE_ADDRESS') {
          assessmentData.reconciledServiceAddress = value
        } else if (category === 'RECORDS_ADDRESS') {
          assessmentData.reconciledRecordsAddress = value
        }
      }
    }

    // reconcile ldv sales:
    if (latestSupplemental.ldvSales || latestSupplemental.ldvSales === 0) {
      result.reconciledLdvSales = latestSupplemental.ldvSales
    }

    // reconcile zev sales:
    const suppOriginZevSales = {}
    for (const supplementary of assessedSupplementaries) {
      const suppZevSales = supplementary.zevSales
      if (suppZevSales) {
        for (const suppZevSale of suppZevSales) {
          const modelYearReportVehicleId = suppZevSale.modelYearReportVehicle
          const suppOriginZevSaleId = suppZevSale.supplementalOriginZevSaleId
          if (!modelYearReportVehicleId && !suppOriginZevSaleId) {
            suppZevSale.fromModelYearReport = false
            suppZevSale.salesIssued = suppZevSale.sales
            suppOriginZevSales[suppZevSale.id] = suppZevSale
          }
        }
      }
    }
    for (const supplementary of assessedSupplementaries) {
      const suppZevSales = supplementary.zevSales
      if (suppZevSales) {
        for (const suppZevSale of suppZevSales) {
          const modelYearReportVehicleId = suppZevSale.modelYearReportVehicle
          const suppOriginZevSaleId = suppZevSale.supplementalOriginZevSaleId
          let saleInQuestion
          if (
            modelYearReportVehicleId &&
            !suppOriginZevSaleId &&
            zevSales[modelYearReportVehicleId]
          ) {
            saleInQuestion = zevSales[modelYearReportVehicleId]
          } else if (
            !modelYearReportVehicleId &&
            suppOriginZevSaleId &&
            suppOriginZevSales[suppOriginZevSaleId]
          ) {
            saleInQuestion = suppOriginZevSales[suppOriginZevSaleId]
          }
          if (saleInQuestion) {
            if (suppZevSale.sales || suppZevSale.sales === 0) {
              saleInQuestion.salesIssued = suppZevSale.sales
            }
            if (suppZevSale.make) {
              saleInQuestion.make = suppZevSale.make
            }
            if (suppZevSale.modelName) {
              saleInQuestion.modelName = suppZevSale.modelName
            }
            if (suppZevSale.modelYear) {
              saleInQuestion.modelYear = suppZevSale.modelYear
            }
            if (suppZevSale.range) {
              saleInQuestion.range = suppZevSale.range
            }
            if (suppZevSale.vehicleZevType) {
              saleInQuestion.vehicleZevType = suppZevSale.vehicleZevType
            }
            if (suppZevSale.zevClass) {
              saleInQuestion.zevClass = suppZevSale.zevClass
            }
          }
        }
      }
    }
    if (!assessmentData.zevSales) {
      assessmentData.zevSales = []
    }
    assessmentData.zevSales = assessmentData.zevSales.concat(
      Object.values(suppOriginZevSales)
    )

    // reconcile credit activities:
    if (complianceData) {
      const creditActivites = {}
      if (complianceData.complianceObligation) {
        for (const creditActivity of complianceData.complianceObligation) {
          const category = creditActivity.category
          const modelYear = creditActivity.modelYear.name
          if (!creditActivites[category]) {
            creditActivites[category] = {}
          }
          creditActivites[category][modelYear] = creditActivity
        }
      }
      const suppCreditActivities = latestSupplemental.creditActivity
      if (suppCreditActivities) {
        for (const suppCreditActivity of suppCreditActivities) {
          const category = suppCreditActivity.category
          const modelYear = suppCreditActivity.modelYear.name
          if (
            creditActivites[category] &&
            creditActivites[category][modelYear]
          ) {
            const creditActivity = creditActivites[category][modelYear]
            creditActivity.creditAValue = suppCreditActivity.creditAValue
            creditActivity.creditBValue = suppCreditActivity.creditBValue
          } else {
            complianceData.complianceObligation.push(suppCreditActivity)
          }
        }
      }
    }
  }

  if (complianceData?.complianceObligation && previousReassessmentCreditActivities) {
    const creditActivites = complianceData.complianceObligation
    for (const previousReassessmentCreditActivity of previousReassessmentCreditActivities) {
      const category = previousReassessmentCreditActivity.category
      const modelYear = previousReassessmentCreditActivity.modelYear.name
      if (category === 'PreviousReassessmentEndingBalance') {
        const creditActivityInQuestion = creditActivites.find((activity) => activity.category === 'creditBalanceStart' && activity.modelYear.name === modelYear)
        if (creditActivityInQuestion) {
          creditActivityInQuestion.creditAValue = previousReassessmentCreditActivity.creditAValue
          creditActivityInQuestion.creditBValue = previousReassessmentCreditActivity.creditBValue
        }
      }
    }
  }

  return result
}

export default reconcileSupplementaries
