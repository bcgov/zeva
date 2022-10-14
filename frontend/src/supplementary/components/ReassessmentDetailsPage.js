//intended only for directors to view an assessed reassessment

import React from 'react';
import calculateCreditReduction from '../../app/utilities/calculateCreditReduction';
import getClassAReduction from '../../app/utilities/getClassAReduction';
import getComplianceObligationDetails from '../../app/utilities/getComplianceObligationDetails';
import getTotalReduction from '../../app/utilities/getTotalReduction';
import getUnspecifiedClassReduction from '../../app/utilities/getUnspecifiedClassReduction';
import ComplianceObligationAmountsTable from '../../compliance/components/ComplianceObligationAmountsTable';
import ComplianceObligationReductionOffsetTable from '../../compliance/components/ComplianceObligationReductionOffsetTable';
import ComplianceObligationTableCreditsIssued from '../../compliance/components/ComplianceObligationTableCreditsIssued';
import NoticeOfAssessmentSection from '../../compliance/components/NoticeOfAssessmentSection';

const ReassessmentDetailsPage = (props) => {
  //from props, reconcile existing data with new data, then pass to downstream components
  //here, reconciliation means using new data if some exist; otherwise use the old data
  const {
    details,
    ldvSales,
    newBalances,
    newData,
    obligationDetails,
    ratios,
    user
  } = props;

  let supplierName = details.assessmentData.legalName;
  if (newData && newData.supplierInfo && newData.supplierInfo.legalName) {
    supplierName = newData.supplierInfo.legalName;
  }

  let addresses = details.assessmentData.reportAddress;
  let addressesAreStrings = false;
  if (
    newData &&
    newData.supplierInfo &&
    newData.supplierInfo.recordsAddress &&
    typeof newData.supplierInfo.recordsAddress === 'string' &&
    newData.supplierInfo.serviceAddress &&
    typeof newData.supplierInfo.serviceAddress === 'string'
  ) {
    addressesAreStrings = true;
    addresses = [
      newData.supplierInfo.serviceAddress,
      newData.supplierInfo.recordsAddress
    ];
  }

  let makes = details.assessmentData.makes;
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvMakes) {
    makes = newData.supplierInfo.ldvMakes.split('\n');
  }

  let supplierClass = details.assessmentData.supplierClass;
  if (newData && newData.supplierInfo && newData.supplierInfo.supplierClass) {
    supplierClass = newData.supplierInfo.supplierClass;
  }
  if (supplierClass !== 'S' || supplierClass !== 'M' || supplierClass !== 'L') {
    const transformedSupplierClass = supplierClass
      .replace(' ', '')
      .toLowerCase();
    if (transformedSupplierClass.includes('small')) {
      supplierClass = 'S';
    } else if (transformedSupplierClass.includes('medium')) {
      supplierClass = 'M';
    } else if (transformedSupplierClass.includes('large')) {
      supplierClass = 'L';
    }
  }

  const reportYear = Number(details.assessmentData.modelYear);

  let classAReductionValue = getClassAReduction(
    ldvSales,
    ratios.zevClassA,
    supplierClass
  );
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    classAReductionValue = getClassAReduction(
      newData.supplierInfo.ldvSales,
      ratios.zevClassA,
      supplierClass
    );
  }

  const classAReductions = [
    {
      modelYear: reportYear,
      value: classAReductionValue
    }
  ];

  let sales = details.ldvSales;
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    sales = newData.supplierInfo.ldvSales;
  }

  let totalReduction = getTotalReduction(ldvSales, ratios.complianceRatio);
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    totalReduction = getTotalReduction(
      newData.supplierInfo.ldvSales,
      ratios.complianceRatio
    );
  }

  let unspecifiedReductionValue = getUnspecifiedClassReduction(
    totalReduction,
    classAReductionValue
  );

  const unspecifiedReductions = [
    {
      modelYear: reportYear,
      value: unspecifiedReductionValue
    }
  ];

  const newCreditActivities = {};
  if (newData && newData.creditActivity) {
    for (const activity of newData.creditActivity) {
      const category = activity.category;
      const modelYear = activity.modelYear;
      const value = {
        creditAValue: activity.creditAValue,
        creditBValue: activity.creditBValue
      };
      if (!newCreditActivities.category) {
        newCreditActivities[category] = {};
      }
      newCreditActivities[category][modelYear] = value;
    }
  }

  const complianceObligationDetails = [];
  for (const detail of obligationDetails) {
    const category = detail.category;
    const modelYear = detail.modelYear.name;
    if (
      newCreditActivities[category] &&
      newCreditActivities[category][modelYear]
    ) {
      complianceObligationDetails.push({
        ...detail,
        ...newCreditActivities[category][modelYear]
      });
    } else {
      complianceObligationDetails.push(detail);
    }
  }

  const {
    creditBalanceEnd,
    creditBalanceStart,
    creditsIssuedSales,
    pendingBalance,
    provisionalBalance,
    transfersIn,
    transfersOut,
    initiativeAgreement,
    purchaseAgreement,
    administrativeAllocation,
    administrativeReduction,
    automaticAdministrativePenalty
  } = getComplianceObligationDetails(complianceObligationDetails);

  const reportDetails = {
    creditBalanceStart,
    creditBalanceEnd,
    pendingBalance,
    provisionalBalance,
    transactions: {
      creditsIssuedSales,
      transfersIn,
      transfersOut,
      initiativeAgreement,
      purchaseAgreement,
      administrativeAllocation,
      administrativeReduction,
      automaticAdministrativePenalty
    }
  };

  const creditReductionSelection =
    details.assessmentData && details.assessmentData.creditReductionSelection;

  const transformedNewBalances = [];
  Object.keys(newBalances).forEach((year) => {
    const { A: creditA, B: creditB } = newBalances[year];
    transformedNewBalances.push({
      modelYear: Number(year),
      creditA,
      creditB
    });
  });
  const creditReduction = calculateCreditReduction(
    transformedNewBalances,
    classAReductions,
    unspecifiedReductions,
    creditReductionSelection
  );
  const { deductions, balances, deficits } = creditReduction;
  const updatedBalances = { balances: balances, deficits: deficits };

  return (
    <div id="supplementary" className="page">
      <NoticeOfAssessmentSection
        name={supplierName}
        addresses={addresses}
        addressesAreStrings={addressesAreStrings}
        makes={makes}
        supplierClass={supplierClass}
        disabledInputs={false}
      />
      <br></br>
      <h3>Compliance Obligation</h3>
      <ComplianceObligationAmountsTable
        classAReductions={classAReductions}
        page={'assessment'}
        ratios={ratios}
        reportYear={Number(details.assessmentData.modelYear)}
        sales={sales}
        statuses={{ assessment: { status: 'ASSESSED' } }}
        supplierClass={supplierClass}
        totalReduction={totalReduction}
        unspecifiedReductions={unspecifiedReductions}
      />
      <div className="mt-4">
        <ComplianceObligationTableCreditsIssued
          pendingBalanceExist={false}
          reportYear={reportYear}
          reportDetails={reportDetails}
        />
      </div>
      <h3 className="mt-4 mb-2">Credit Reduction</h3>
      <ComplianceObligationReductionOffsetTable
        assessment={true}
        reportYear={reportYear}
        creditReductionSelection={creditReductionSelection}
        deductions={deductions}
        statuses={{ assessment: { status: 'ASSESSED' } }}
        supplierClass={supplierClass}
        updatedBalances={updatedBalances}
        user={user}
      />
    </div>
  );
};

export default ReassessmentDetailsPage;
