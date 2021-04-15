import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceObligationDetailsPage from './components/ComplianceObligationDetailsPage';
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
    const { id: radioId} = event.target;
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

      let remainingReduction = zevClassACreditReduction - zevClassALastYear;
      if (provisionalBalanceCurrentYearA > 0 && remainingReduction <= provisionalBalanceCurrentYearA) {
        zevClassACurrentYear = remainingReduction;
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
        let unspecifieldBalance = unspecifiedZevClassReduction - unspecifiedZevClassCurrentYearA;
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
      console.log('Unspecified reduction A and B 2019',  unspecifiedZevClassLastYearA, unspecifiedZevClassLastYearB);
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
        let unspecifieldBalance = unspecifiedZevClassReduction - (unspecifiedZevClassLastYearA + unspecifiedZevClassLastYearB + unspecifiedZevClassCurrentYearB) ;
        if (unspecifieldBalance > 0 && balanceA2020 > 0 && balanceA2020 >= unspecifieldBalance) {
          unspecifiedZevClassCurrentYearA = unspecifieldBalance;
        }
        if (unspecifieldBalance > 0 && balanceA2020 > 0 && balanceA2020 < unspecifieldBalance) {
          unspecifiedZevClassCurrentYearA = unspecifieldBalance - provisionalBalanceCurrentYearA;    
      } 
      console.log('Unspecified reduction A and B 2020', unspecifiedZevClassCurrentYearA, unspecifiedZevClassCurrentYearB);
    }
  
    totalCombinedReductionCurrentYearA = zevClassACurrentYear + unspecifiedZevClassCurrentYearA;
    totalCombinedReductionCurrentYearB = unspecifiedZevClassCurrentYearB;
    totalReductionLastYearA = zevClassALastYear + unspecifiedZevClassLastYearA;
    totalReductionLastYearB = unspecifiedZevClassLastYearB;
    console.log('Total Combined Reduction 2020 =', formatNumeric((totalCombinedReductionCurrentYearA), 2), totalCombinedReductionCurrentYearB);
    console.log('Total Combined Reduction 2019 =', totalReductionLastYearA, totalReductionLastYearB);
  }
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
        if (each !== 'transactions') {
          const a = reportDetails[each][year].A;
          const b = reportDetails[each][year].B;
          reportDetailsArray.push({
            category: each, year, a, b,
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
    };
    axios.post(ROUTES_COMPLIANCE.OBLIGATION,
      data).then(() => {
      setDisabledCheckboxes('disabled');
      // add confirmation !
    });
  };
  const parseCreditTransactions = (data) => {
    const output = [];
    data.forEach((element) => {
      const found = output.findIndex((each) => each.modelYear === element.modelYear.name);
      if (found >= 0) {
        output[found][element.creditClass.creditClass] = element.totalValue;
      } else {
        output.push({
          modelYear: element.modelYear.name,
          [element.creditClass.creditClass]: element.totalValue,
        });
      }
    });
    return output;
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
        setCheckboxes(confirmations);
      }

      setStatuses(reportStatuses);
      setSupplierClassInfo({ class: supplierClass, ldvSales });

      const ratioPromise = axios.get(ROUTES_COMPLIANCE.RATIOS).then((ratioResponse) => {
        const filteredRatio = ratioResponse.data.filter((data) => data.modelYear === reportDetailsResponse.modelYear.name)[0];
        setRatios(filteredRatio);
      });

      const complianceReportDetails = axios.get(ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID
        .replace(':id', id)).then((complianceResponse) => {
        const yearObject = {};
        const complianceResponseDetails = complianceResponse.data;
        if (!complianceResponseDetails.reportYearTransactions) {
          // not returning values from database, grab from snapshot instead
          const creditBalanceStart = {};
          const creditBalanceEnd = {};
          const provisionalBalance = {};
          const pendingBalance = {};
          const transfersIn = [];
          const transfersOut = [];
          const creditsIssuedSales = [];
          const offsetNumbers = [];
          // get offset from backend

          complianceResponseDetails.forEach((item) => {
            if (item.category === 'creditBalanceStart') {
              creditBalanceStart[item.modelYear.name] = { A: item.creditAValue, B: item.creditBValue };
            }
            if (item.category === 'creditBalanceEnd') {
              creditBalanceEnd[item.modelYear.name] = { A: item.creditAValue, B: item.creditBValue };
            }
            if (item.category === 'provisionalBalance') {
              provisionalBalance[item.modelYear.name] = { A: parseFloat(item.creditAValue), B: parseFloat(item.creditBValue) };
            }
            if (item.category === 'pendingBalance') {
              pendingBalance[item.modelYear.name] = { A: item.creditAValue, B: item.creditBValue };
            }
            if (item.category === 'transfersIn') {
              transfersIn.push({ modelYear: item.modelYear.name, A: item.creditAValue, B: item.creditBValue });
            }
            if (item.category === 'transfersOut') {
              transfersOut.push({ modelYear: item.modelYear.name, A: item.creditAValue, B: item.creditBValue });
            }
            if (item.category === 'creditsIssuedSales') {
              creditsIssuedSales.push({ modelYear: item.modelYear.name, A: item.creditAValue, B: item.creditBValue });
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
        } else {
          const creditsIssuedSales = parseCreditTransactions(
            complianceResponseDetails.reportYearTransactions.creditsIssuedSales,
          );
          const transfersIn = parseCreditTransactions(
            complianceResponseDetails.reportYearTransactions.transfersIn,
          );
          const transfersOut = parseCreditTransactions(
            complianceResponseDetails.reportYearTransactions.transfersOut,
          );
          const reportYearBalance = {};
          creditsIssuedSales.forEach((each) => {
            yearObject[each.modelYear] = { A: 0, B: 0 };
            reportYearBalance[each.modelYear] = {
              A: parseFloat(each.A) || 0,
              B: parseFloat(each.B) || 0,
            };
          });
          transfersIn.forEach((each) => {
            yearObject[each.modelYear] = { A: 0, B: 0 };
            if (!Object.keys(reportYearBalance).includes(each.modelYear)) {
              reportYearBalance[each.modelYear] = { A: 0, B: 0 };
            }
            reportYearBalance[each.modelYear].A += parseFloat(each.A) || 0;
            reportYearBalance[each.modelYear].B += parseFloat(each.B) || 0;
          });
          transfersOut.forEach((each) => {
            yearObject[each.modelYear] = { A: 0, B: 0 };
            if (!Object.keys(reportYearBalance).includes(each.modelYear)) {
              reportYearBalance[each.modelYear] = { A: 0, B: 0 };
            }
            reportYearBalance[each.modelYear].A += parseFloat(-each.A) || 0;
            reportYearBalance[each.modelYear].B += parseFloat(-each.B) || 0;
          });
          const provisionalBalance = {};
          Object.keys(reportYearBalance).forEach((year) => {
            yearObject[year] = { A: 0, B: 0 };
            provisionalBalance[year] = { A: parseFloat(reportYearBalance[year].A), B: parseFloat(reportYearBalance[year].B) };
          });
          Object.keys(complianceResponseDetails.pendingBalance).forEach((year) => {
            yearObject[year] = { A: 0, B: 0 };
            provisionalBalance[year].A += parseFloat(complianceResponseDetails.pendingBalance[year].A);
            provisionalBalance[year].B += parseFloat(complianceResponseDetails.pendingBalance[year].B);
          });
          setOffsetNumbers(yearObject);
          const priorYear = complianceResponseDetails.priorYearBalance.year;
          const creditBalanceStart = {};
          creditBalanceStart[priorYear] = {
            year: complianceResponseDetails.priorYearBalance.year,
            A: complianceResponseDetails.priorYearBalance.A,
            B: complianceResponseDetails.priorYearBalance.B,
          };
          setReportDetails({
            creditBalanceStart,
            creditBalanceEnd: reportYearBalance,
            pendingBalance: complianceResponseDetails.pendingBalance,
            provisionalBalance,
            transactions: {
              creditsIssuedSales,
              transfersIn,
              transfersOut,
            },
          });
        }
        const listAssertion = axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((assertionResponse) => {
          const filteredAssertions = assertionResponse.data.filter((data) => data.module === 'compliance_obligation');
          setAssertions(filteredAssertions);
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
      />
    </>
  );
};

ComplianceObligationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceObligationContainer;
