import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceObligationDetailsPage from './components/ComplianceObligationDetailsPage';
import history from '../app/History';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import formatNumeric from '../app/utilities/formatNumeric';

const ComplianceObligationContainer = (props) => {
  const { user } = props;

  const [confirmed, setConfirmed] = useState(false);
  const [disabledCheckboxes, setDisabledCheckboxes] = useState('');
  const [offsetNumbers, setOffsetNumbers] = useState({});
  const [loading, setLoading] = useState(true);
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [reportYear, setReportYear] = useState('2019');
  const [reportDetails, setReportDetails] = useState({});
  const [ratios, setRatios] = useState({});
  const [details, setDetails] = useState({});
  const [statuses, setStatuses] = useState({});
  const [supplierClassInfo, setSupplierClassInfo] = useState({ ldvSales: 0, class: '' });
  const { id } = useParams();

  const handleCancelConfirmation = () => {
    const data = {
      delete_confirmations: true,
      module: 'compliance_obligation',
    };

    axios.patch(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id), data).then((response) => {
      history.push(ROUTES_COMPLIANCE.REPORTS);
      history.replace(ROUTES_COMPLIANCE.REPORT_CREDIT_ACTIVITY.replace(':id', response.data.id));
    });
  };

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter(
        (each) => Number(each) !== Number(event.target.id),
      );
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id);
      setCheckboxes(checked);
    }
  };

  const creditReduction = (event) => {
    const { id: radioId } = event.target;
    const provisionalBalanceCurrentYearA = 1192.33;
    const provisionalBalanceCurrentYearB = 43.43;
    const provisionalBalanceLastYearA = 567.43;
    const provisionalBalanceLastYearB = 147.86;
    const largeSupplier = true;
    const zevClassACreditReduction = 600.00;
    const unspecifiedZevClassReduction = 350.00;
    let zevClassACurrentYear = 0;
    let zevClassALastYear = 0;
    let unspecifiedZevClassCurrentYearA = 0;
    let unspecifiedZevClassCurrentYearB = 0;
    let unspecifiedZevClassLastYearA = 0;
    let unspecifiedZevClassLastYearB = 0;
    let balanceA2019 = 0;
    let balanceA2020 = 0;
    let remainingUnspecifiedReduction = 0;
    let totalCombinedReductionCurrentYearA = 0;
    let totalCombinedReductionCurrentYearB = 0;
    let totalReductionLastYearA = 0;
    let totalReductionLastYearB = 0;

    if (largeSupplier) {
      // Perform ZEV Class A reduction first for older year then current year.
      if (provisionalBalanceLastYearA > 0 && zevClassACreditReduction >= provisionalBalanceLastYearA) {
        zevClassALastYear = provisionalBalanceLastYearA;
      }
      if (provisionalBalanceLastYearA > 0 && zevClassACreditReduction < provisionalBalanceLastYearA) {
        zevClassALastYear = zevClassACreditReduction;
      }
      console.log('ZEV Class A 2019', -Math.abs(zevClassALastYear));

      const remainingReduction = zevClassACreditReduction - zevClassALastYear;
      if (provisionalBalanceCurrentYearA > 0 && remainingReduction <= provisionalBalanceCurrentYearA) {
        zevClassACurrentYear = remainingReduction;
      }
      if (provisionalBalanceCurrentYearA > 0 && remainingReduction > provisionalBalanceCurrentYearA) {
        zevClassACurrentYear = remainingReduction - provisionalBalanceCurrentYearA;
      }
      console.log('ZEV class A 2020(Nothing to substract)', zevClassACurrentYear);
      balanceA2019 = provisionalBalanceLastYearA - zevClassALastYear;
      balanceA2020 = provisionalBalanceCurrentYearA - zevClassACurrentYear;
    } else {
      balanceA2019 = provisionalBalanceLastYearA;
      balanceA2020 = provisionalBalanceCurrentYearA;
    }

    if (radioId === 'A') {
      // Reduce older year's A credits first then older year's B.
      if (balanceA2019 > 0 && balanceA2019 >= unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearA = unspecifiedZevClassReduction;
      }
      if (balanceA2019 > 0 && balanceA2019 < unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearA = balanceA2019;
        remainingUnspecifiedReduction = unspecifiedZevClassReduction - unspecifiedZevClassLastYearA;
        if (remainingUnspecifiedReduction > 0 && provisionalBalanceLastYearB > 0 && provisionalBalanceLastYearB >= remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearB = remainingUnspecifiedReduction;
        }
        if (remainingUnspecifiedReduction > 0 && provisionalBalanceLastYearB > 0 && provisionalBalanceLastYearB < remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearB = provisionalBalanceLastYearB;
        }
      }
      if (balanceA2019 === 0 && provisionalBalanceLastYearB > 0 && unspecifiedZevClassReduction >= provisionalBalanceLastYearB) {
        unspecifiedZevClassLastYearB = provisionalBalanceLastYearB;
      }
      console.log('Unspecified reduction A and B 2019', unspecifiedZevClassLastYearA, unspecifiedZevClassLastYearB);
      // Reduce current year's A credits first then current year's B.
      remainingUnspecifiedReduction = unspecifiedZevClassReduction - (unspecifiedZevClassLastYearA + unspecifiedZevClassLastYearB);
      if (balanceA2020 > 0 && balanceA2020 >= remainingUnspecifiedReduction) {
        unspecifiedZevClassCurrentYearA = remainingUnspecifiedReduction;
      }
      if (balanceA2020 === 0 && provisionalBalanceCurrentYearB > 0 && remainingUnspecifiedReduction >= provisionalBalanceCurrentYearB) {
        unspecifiedZevClassCurrentYearB = provisionalBalanceCurrentYearB;
      }
      if (balanceA2020 > 0 && balanceA2020 < remainingUnspecifiedReduction) {
        unspecifiedZevClassCurrentYearA = balanceA2020;
        const unspecifieldBalance = unspecifiedZevClassReduction - unspecifiedZevClassCurrentYearA;
        if (unspecifieldBalance > 0 && provisionalBalanceCurrentYearB > 0 && provisionalBalanceCurrentYearB >= unspecifieldBalance) {
          unspecifiedZevClassCurrentYearB = unspecifieldBalance;
        }
        if (unspecifieldBalance > 0 && provisionalBalanceCurrentYearB > 0 && provisionalBalanceCurrentYearB < unspecifieldBalance) {
          unspecifiedZevClassLastYearB = unspecifieldBalance - provisionalBalanceLastYearB;
        }
      }
      console.log('Unspecified reduction A and B 2020', unspecifiedZevClassCurrentYearA, unspecifiedZevClassCurrentYearB);
    }

    if (radioId === 'B') {
      // Reduce older year's B credits first then older year's A.
      if (provisionalBalanceLastYearB > 0 && provisionalBalanceLastYearB >= unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearB = unspecifiedZevClassReduction;
      }
      if (provisionalBalanceLastYearB > 0 && provisionalBalanceLastYearB < unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearB = provisionalBalanceLastYearB;
        remainingUnspecifiedReduction = unspecifiedZevClassReduction - unspecifiedZevClassLastYearB;
        if (remainingUnspecifiedReduction > 0 && balanceA2019 > 0 && balanceA2019 >= remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearA = remainingUnspecifiedReduction;
        }
        if (remainingUnspecifiedReduction > 0 && balanceA2019 > 0 && balanceA2019 < remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearA = balanceA2019;
        }
      }
      if (provisionalBalanceLastYearB === 0 && provisionalBalanceLastYearA > 0 && unspecifiedZevClassReduction >= provisionalBalanceLastYearA) {
        unspecifiedZevClassLastYearA = provisionalBalanceLastYearA;
      }
      console.log('Unspecified reduction A and B 2019', unspecifiedZevClassLastYearA, unspecifiedZevClassLastYearB);
      // Reduce current year's B credits first then current year's A.
      remainingUnspecifiedReduction = unspecifiedZevClassReduction - (unspecifiedZevClassLastYearA + unspecifiedZevClassLastYearB);
      if (provisionalBalanceCurrentYearB > 0 && provisionalBalanceCurrentYearB >= remainingUnspecifiedReduction) {
        unspecifiedZevClassCurrentYearB = remainingUnspecifiedReduction;
      }
      if (provisionalBalanceCurrentYearB === 0 && provisionalBalanceCurrentYearA > 0 && remainingUnspecifiedReduction >= provisionalBalanceCurrentYearA) {
        unspecifiedZevClassCurrentYearA = provisionalBalanceCurrentYearA;
      }
      if (provisionalBalanceCurrentYearB > 0 && provisionalBalanceCurrentYearB < remainingUnspecifiedReduction) {
        unspecifiedZevClassCurrentYearB = provisionalBalanceCurrentYearB;
        const unspecifieldBalance = unspecifiedZevClassReduction - (unspecifiedZevClassLastYearA + unspecifiedZevClassLastYearB + unspecifiedZevClassCurrentYearB);
        if (unspecifieldBalance > 0 && balanceA2020 > 0 && balanceA2020 >= unspecifieldBalance) {
          unspecifiedZevClassCurrentYearA = unspecifieldBalance;
        }
        if (unspecifieldBalance > 0 && balanceA2020 > 0 && balanceA2020 < unspecifieldBalance) {
          unspecifiedZevClassCurrentYearA = unspecifieldBalance - provisionalBalanceCurrentYearA;
        }
        console.log('Unspecified reduction A and B 2020', unspecifiedZevClassCurrentYearA, unspecifiedZevClassCurrentYearB);
      }
    }
    totalCombinedReductionCurrentYearA = zevClassACurrentYear + unspecifiedZevClassCurrentYearA;
    totalCombinedReductionCurrentYearB = unspecifiedZevClassCurrentYearB;
    totalReductionLastYearA = zevClassALastYear + unspecifiedZevClassLastYearA;
    totalReductionLastYearB = unspecifiedZevClassLastYearB;
    console.log('Total Combined Reduction 2020 =', formatNumeric((totalCombinedReductionCurrentYearA), 2), totalCombinedReductionCurrentYearB);
    console.log('Total Combined Reduction 2019 =', totalReductionLastYearA, totalReductionLastYearB);
  };
  const handleOffsetChange = (event) => {
    const { id, value } = event.target;
    const year = id.split('-')[0];
    const creditClass = id.split('-')[1];
    if (Object.keys(offsetNumbers).includes(year)) {
      const yearTotal = offsetNumbers[year];
      const newYearTotal = { ...yearTotal, [creditClass]: parseFloat(value) };
      setOffsetNumbers({ ...offsetNumbers, [year]: newYearTotal });
    }
  };
  const handleSave = () => {
    const reportDetailsArray = [];
    Object.keys(reportDetails).forEach((each) => {
      Object.keys(reportDetails[each]).forEach((year) => {
        if (each !== 'transactions' && each !== 'pendingBalance') {
          const a = reportDetails[each][year].A;
          const b = reportDetails[each][year].B;
          reportDetailsArray.push({
            category: each, year, a, b,
          });
        } else if (each === 'pendingBalance') {
          reportDetailsArray.push({
            category: each, year: reportDetails[each][year].modelYear, A: reportDetails[each][year].A, B: reportDetails[each][year].B,
          });
        } else {
          const category = year;
          reportDetails[each][year].forEach((record) => {
            const A = parseFloat(record.A) || 0;
            const B = parseFloat(record.B) || 0;
            reportDetailsArray.push({
              category, year: record.modelYear, A, B,
            });
          });
        }
      });
    });
    const data = {
      reportId: id,
      offset: offsetNumbers,
      creditActivity: reportDetailsArray,
      confirmations: checkboxes,
    };
    axios.post(ROUTES_COMPLIANCE.OBLIGATION,
      data).then(() => {
      history.push(ROUTES_COMPLIANCE.REPORTS);
      history.replace(ROUTES_COMPLIANCE.REPORT_CREDIT_ACTIVITY.replace(':id', id));
    });
  };

  const refreshDetails = () => {
    setLoading(true);
    axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)).then((response) => {
      const reportDetailsResponse = response.data;
      setReportYear(reportDetailsResponse.modelYear.name);
      const {
        ldvSales,
        modelYearReportHistory,
        supplierClass,
        validationStatus,
        confirmations,
        statuses: reportStatuses,
      } = reportDetailsResponse;
      setDetails({
        complianceObligation: {
          history: modelYearReportHistory,
          validationStatus,
        },
      });

      if (confirmations.length > 0) {
        setConfirmed(true);
      }

      setStatuses(reportStatuses);
      setSupplierClassInfo({ class: supplierClass, ldvSales });

      const ratioPromise = axios.get(ROUTES_COMPLIANCE.RATIOS).then((ratioResponse) => {
        const filteredRatio = ratioResponse.data.filter((data) => data.modelYear === reportDetailsResponse.modelYear.name)[0];
        setRatios(filteredRatio);
      });

      const complianceReportDetails = axios.get(ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID
        .replace(':id', id)).then((complianceResponse) => {
        const complianceResponseDetails = complianceResponse.data.complianceObligation;
        const { complianceOffset } = complianceResponse.data;
        const creditBalanceStart = {};
        const creditBalanceEnd = {};
        const provisionalBalance = {};
        const pendingBalance = [];
        const transfersIn = [];
        const transfersOut = [];
        const creditsIssuedSales = [];
        const complianceOffsetNumbers = [];
        if (complianceOffset) {
          complianceOffset.forEach((item) => {
            complianceOffsetNumbers.push({
              modelYear: item.modelYear.name,
              A: parseFloat(item.creditAOffsetValue),
              B: parseFloat(item.creditAOffsetValue),
            });
          });
          setOffsetNumbers(complianceOffsetNumbers);
        }

        complianceResponseDetails.forEach((item) => {
          if (item.category === 'creditBalanceStart') {
            creditBalanceStart[item.modelYear.name] = {
              A: item.creditAValue,
              B: item.creditBValue,
            };
          }
          if (item.category === 'creditBalanceEnd') {
            creditBalanceEnd[item.modelYear.name] = {
              A: item.creditAValue,
              B: item.creditBValue,
            };
          }
          if (item.category === 'transfersIn') {
            transfersIn.push({
              modelYear: item.modelYear.name,
              A: item.creditAValue,
              B: item.creditBValue,
            });
          }
          if (item.category === 'transfersOut') {
            transfersOut.push({
              modelYear: item.modelYear.name,
              A: -item.creditAValue,
              B: -item.creditBValue,
            });
          }
          if (item.category === 'creditsIssuedSales') {
            creditsIssuedSales.push({
              modelYear: item.modelYear.name,
              A: item.creditAValue,
              B: item.creditBValue,
            });
          }
          if (item.category === 'pendingBalance') {
            pendingBalance.push({
              modelYear: item.modelYear.name,
              A: item.creditAValue,
              B: item.creditBValue,
            });
          }
        });

        // go through every year in end balance and push to provisional
        Object.keys(creditBalanceEnd).forEach((item) => {
          provisionalBalance[item] = {
            A: creditBalanceEnd[item].A,
            B: creditBalanceEnd[item].B,
          };
        });

        // go through every item in pending and add to total if year already there or create new
        pendingBalance.forEach((item) => {
          if (provisionalBalance[item.modelYear]) {
            provisionalBalance[item.modelYear].A += item.A;
            provisionalBalance[item.modelYear].B += item.B;
          } else {
            provisionalBalance[item.modelYear] = {
              A: item.A,
              B: item.B,
            };
          }
        });

        setReportDetails({
          creditBalanceStart,
          creditBalanceEnd,
          pendingBalance,
          provisionalBalance,
          transactions: {
            creditsIssuedSales,
            transfersIn,
            transfersOut,
          },
        });
        setLoading(false);
        const listAssertion = axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((assertionResponse) => {
          const filteredAssertions = assertionResponse.data.filter((data) => data.module === 'compliance_obligation');
          setAssertions(filteredAssertions);
          const confirmedCheckboxes = [];
          filteredAssertions.forEach((assertion) => {
            if (confirmations.indexOf(assertion.id) >= 0) {
              confirmedCheckboxes.push(assertion.id);
            }
          });
          setCheckboxes(confirmedCheckboxes);
        });
        Promise.all([listAssertion, complianceReportDetails, ratioPromise]).then(() => {
          setLoading(false);
        });
      });
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [reportYear]);

  return (
    <>
      <ComplianceReportTabs active="credit-activity" reportStatuses={statuses} user={user} />
      <ComplianceObligationDetailsPage
        assertions={assertions}
        checkboxes={checkboxes}
        confirmed={confirmed}
        details={details}
        disabledCheckboxes={disabledCheckboxes}
        handleCheckboxClick={handleCheckboxClick}
        handleOffsetChange={handleOffsetChange}
        handleSave={handleSave}
        loading={loading}
        offsetNumbers={offsetNumbers}
        ratios={ratios}
        reportDetails={reportDetails}
        reportYear={reportYear}
        supplierClassInfo={supplierClassInfo}
        user={user}
        statuses={statuses}
        creditReduction={creditReduction}
        id={id}
        handleCancelConfirmation={handleCancelConfirmation}
      />
    </>
  );
};

ComplianceObligationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceObligationContainer;
