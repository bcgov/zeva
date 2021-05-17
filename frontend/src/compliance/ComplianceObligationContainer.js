import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceObligationDetailsPage from './components/ComplianceObligationDetailsPage';
import history from '../app/History';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import CONFIG from '../app/config';
import formatNumeric from '../app/utilities/formatNumeric';

const ComplianceObligationContainer = (props) => {
  const { user } = props;

  const [confirmed, setConfirmed] = useState(false);
  const [disabledCheckboxes, setDisabledCheckboxes] = useState('');
  const [offsetNumbers, setOffsetNumbers] = useState({});
  const [loading, setLoading] = useState(true);
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [reportYear, setReportYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [reportDetails, setReportDetails] = useState({});
  const [ratios, setRatios] = useState({});
  const [details, setDetails] = useState({});
  const [statuses, setStatuses] = useState({});
  const [supplierClassInfo, setSupplierClassInfo] = useState({ ldvSales: 0, class: '' });
  const { id } = useParams();
  const [remainingABalance, setRemainingABalance] = useState({
    lastYearABalance: 0,
    currentYearABalance: 0,
  });
  const [zevClassAReduction, setZevClassAReduction] = useState({
    currentYearA: 0,
    lastYearA: 0,
  });
  const [unspecifiedReductions, setUnspecifiedReductions] = useState({
    currentYearA: 0,
    currentYearB: 0,
    lastYearA: 0,
    lastYearB: 0,
  });
  const [creditBalance, setCreditBalance] = useState({ A: 0, B: 0 });
  let provisionalBalanceCurrentYearA = 0;
  let provisionalBalanceCurrentYearB = 0;
  let provisionalBalanceLastYearA = 0;
  let provisionalBalanceLastYearB = 0;
  let creditADeficit = 0;

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

  const creditAReduction = (supplierClass, classAReduction, provisionalBalance) => {
    const zevClassACreditReduction = classAReduction;
    Object.keys(provisionalBalance).forEach((each) => {
      const modelYear = parseInt(each, 10);
      if (modelYear === reportYear) {
        provisionalBalanceCurrentYearA = parseInt(provisionalBalance[each].A, 10);
      }
      if (modelYear === reportYear - 1) {
        provisionalBalanceLastYearA = parseInt(provisionalBalance[each].A, 10);
      }
    });

    if (supplierClass === 'L') {
      let lastYearReduction = 0;
      let currentYearReduction = 0;

      // Perform ZEV Class A reduction first for older year then current year.
      if (provisionalBalanceLastYearA > 0 && zevClassACreditReduction >= provisionalBalanceLastYearA) {
        lastYearReduction = provisionalBalanceLastYearA;
      }
      if (provisionalBalanceLastYearA > 0 && zevClassACreditReduction < provisionalBalanceLastYearA) {
        lastYearReduction = zevClassACreditReduction;
      }

      const remainingReduction = zevClassACreditReduction - lastYearReduction;

      if (provisionalBalanceCurrentYearA > 0 && remainingReduction <= provisionalBalanceCurrentYearA) {
        currentYearReduction = remainingReduction;
      }
      if (provisionalBalanceCurrentYearA >= 0 && remainingReduction > provisionalBalanceCurrentYearA) {
        currentYearReduction = provisionalBalanceCurrentYearA;
        creditADeficit = (remainingReduction - provisionalBalanceCurrentYearA);
      }
      setZevClassAReduction({
        lastYearA: formatNumeric((lastYearReduction), 2),
        currentYearA: currentYearReduction,
      });
      setRemainingABalance({
        lastYearABalance: provisionalBalanceLastYearA - lastYearReduction,
        currentYearABalance: provisionalBalanceCurrentYearA - currentYearReduction,
        creditADeficit,
      });
    } else {
      setRemainingABalance({
        lastYearABalance: provisionalBalanceLastYearA,
        currentYearABalance: provisionalBalanceCurrentYearA,
        creditADeficit,
      });
    }
  };
  const unspecifiedCreditReduction = (event, paramReduction) => {
    const { provisionalBalance } = reportDetails;
    const { lastYearABalance, currentYearABalance, creditADeficit } = remainingABalance;
    const { id: radioId } = event.target;
    const unspecifiedZevClassReduction = paramReduction;
    let unspecifiedZevClassCurrentYearA = 0;
    let unspecifiedZevClassCurrentYearB = 0;
    let unspecifiedZevClassLastYearA = 0;
    let unspecifiedZevClassLastYearB = 0;
    let remainingUnspecifiedReduction = 0;
    let unspecifiedCreditDeficit = 0;

    Object.keys(provisionalBalance).forEach((each) => {
      const modelYear = parseInt(each, 10);
      if (modelYear === reportYear) {
        provisionalBalanceCurrentYearA = parseInt(provisionalBalance[each].A, 10);
        provisionalBalanceCurrentYearB = parseInt(provisionalBalance[each].B, 10);
      }
      if (modelYear === reportYear - 1) {
        provisionalBalanceLastYearA = parseInt(provisionalBalance[each].A, 10);
        provisionalBalanceLastYearB = parseInt(provisionalBalance[each].B, 10);
      }
    });

    if (radioId === 'A') {
      // Reduce older year's A credits first then older year's B.
      if (lastYearABalance > 0 && lastYearABalance >= unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearA = unspecifiedZevClassReduction;
      }
      if (lastYearABalance > 0 && lastYearABalance < unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearA = lastYearABalance;
        remainingUnspecifiedReduction = unspecifiedZevClassReduction - unspecifiedZevClassLastYearA;
        if (remainingUnspecifiedReduction > 0 && provisionalBalanceLastYearB > 0 && provisionalBalanceLastYearB >= remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearB = remainingUnspecifiedReduction;
        }
        if (remainingUnspecifiedReduction > 0 && provisionalBalanceLastYearB > 0 && provisionalBalanceLastYearB < remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearB = provisionalBalanceLastYearB;
        }
      }
      if (lastYearABalance === 0 && provisionalBalanceLastYearB > 0 && unspecifiedZevClassReduction >= provisionalBalanceLastYearB) {
        unspecifiedZevClassLastYearB = provisionalBalanceLastYearB;
      }
      // Reduce current year's A credits first then current year's B.
      remainingUnspecifiedReduction = unspecifiedZevClassReduction - (unspecifiedZevClassLastYearA + unspecifiedZevClassLastYearB);
      if (currentYearABalance > 0 && currentYearABalance >= remainingUnspecifiedReduction) {
        unspecifiedZevClassCurrentYearA = remainingUnspecifiedReduction;
      }
      if (currentYearABalance === 0 && provisionalBalanceCurrentYearB > 0 && remainingUnspecifiedReduction >= provisionalBalanceCurrentYearB) {
        unspecifiedZevClassCurrentYearB = provisionalBalanceCurrentYearB;
        if (remainingUnspecifiedReduction > provisionalBalanceCurrentYearB) {
          unspecifiedCreditDeficit = remainingUnspecifiedReduction - provisionalBalanceCurrentYearB;
        }
      }
      if (currentYearABalance > 0 && currentYearABalance < remainingUnspecifiedReduction) {
        unspecifiedZevClassCurrentYearA = currentYearABalance;
        const unspecifieldBalance = unspecifiedZevClassReduction - unspecifiedZevClassCurrentYearA;
        if (unspecifieldBalance > 0 && provisionalBalanceCurrentYearB > 0 && provisionalBalanceCurrentYearB >= unspecifieldBalance) {
          unspecifiedZevClassCurrentYearB = unspecifieldBalance;
        }
        if (unspecifieldBalance > 0 && provisionalBalanceCurrentYearB > 0 && provisionalBalanceCurrentYearB < unspecifieldBalance) {
          unspecifiedZevClassLastYearB = unspecifieldBalance - provisionalBalanceLastYearB;
        }
      }
    }

    if (radioId === 'B') {
      // Reduce older year's B credits first then older year's A.
      if (provisionalBalanceLastYearB > 0 && provisionalBalanceLastYearB >= unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearB = unspecifiedZevClassReduction;
      }
      if (provisionalBalanceLastYearB > 0 && provisionalBalanceLastYearB < unspecifiedZevClassReduction) {
        unspecifiedZevClassLastYearB = provisionalBalanceLastYearB;
        remainingUnspecifiedReduction = unspecifiedZevClassReduction - unspecifiedZevClassLastYearB;
        if (remainingUnspecifiedReduction > 0 && lastYearABalance > 0 && lastYearABalance >= remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearA = remainingUnspecifiedReduction;
        }
        if (remainingUnspecifiedReduction > 0 && lastYearABalance > 0 && lastYearABalance < remainingUnspecifiedReduction) {
          unspecifiedZevClassLastYearA = lastYearABalance;
        }
      }
      if (provisionalBalanceLastYearB === 0 && lastYearABalance >= 0 && unspecifiedZevClassReduction >= lastYearABalance) {
        unspecifiedZevClassLastYearA = lastYearABalance;
      }
      // Reduce current year's B credits first then current year's A.
      remainingUnspecifiedReduction = unspecifiedZevClassReduction - (unspecifiedZevClassLastYearA + unspecifiedZevClassLastYearB);
      if (provisionalBalanceCurrentYearB > 0 && provisionalBalanceCurrentYearB >= remainingUnspecifiedReduction) {
        unspecifiedZevClassCurrentYearB = remainingUnspecifiedReduction;
      }
      if (provisionalBalanceCurrentYearB === 0 && currentYearABalance >= 0 && remainingUnspecifiedReduction >= currentYearABalance) {
        unspecifiedZevClassCurrentYearA = currentYearABalance;
      }
      if (provisionalBalanceCurrentYearB > 0 && provisionalBalanceCurrentYearB < remainingUnspecifiedReduction) {
        unspecifiedZevClassCurrentYearB = provisionalBalanceCurrentYearB;
        const unspecifieldBalance = unspecifiedZevClassReduction - (unspecifiedZevClassLastYearA + unspecifiedZevClassLastYearB + unspecifiedZevClassCurrentYearB);
        if (unspecifieldBalance > 0 && currentYearABalance > 0 && currentYearABalance >= unspecifieldBalance) {
          unspecifiedZevClassCurrentYearA = unspecifieldBalance;
        }
        if (unspecifieldBalance > 0 && currentYearABalance > 0 && currentYearABalance < unspecifieldBalance) {
          unspecifiedZevClassCurrentYearA = unspecifieldBalance - currentYearABalance;
        }
      }
    }
    const ratioBalance = unspecifiedZevClassReduction
      - (unspecifiedZevClassLastYearA
        + unspecifiedZevClassLastYearB
        + unspecifiedZevClassCurrentYearB
        + unspecifiedZevClassCurrentYearA);
    if (ratioBalance > 0) {
      unspecifiedCreditDeficit = ratioBalance;
    }
    setUnspecifiedReductions({
      currentYearA: unspecifiedZevClassCurrentYearA,
      currentYearB: unspecifiedZevClassCurrentYearB,
      lastYearA: unspecifiedZevClassLastYearA,
      lastYearB: unspecifiedZevClassLastYearB,
    });
    setCreditBalance({
      A: (currentYearABalance - unspecifiedZevClassCurrentYearA),
      B: (provisionalBalanceCurrentYearB - (unspecifiedZevClassCurrentYearB)),
      creditADeficit,
      unspecifiedCreditDeficit,
    });
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
    axios.all([
      axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)),
      axios.get(ROUTES_COMPLIANCE.RATIOS),
      axios.get(ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id)),
    ]).then(axios.spread((reportDetailsResponse, ratioResponse, complianceResponse) => {
      const {
        ldvSales,
        modelYearReportHistory,
        supplierClass,
        validationStatus,
        confirmations,
        modelYear,
        statuses: reportStatuses,
      } = reportDetailsResponse.data;
      setDetails({
        complianceObligation: {
          history: modelYearReportHistory,
          validationStatus,
        },
      });

      const year = parseInt(modelYear.name, 10);
      setReportYear(year);
      if (confirmations.length > 0) {
        setConfirmed(true);
      }

      setStatuses(reportStatuses);
      setSupplierClassInfo({ class: supplierClass, ldvSales });

      const filteredRatio = ratioResponse.data.filter((data) => data.modelYear === modelYear.name)[0];
      setRatios(filteredRatio);
      const classAReduction = ((filteredRatio.zevClassA / 100) * ldvSales);

      const complianceResponseDetails = complianceResponse.data.complianceObligation;
      const { complianceOffset } = complianceResponse.data;
      const creditBalanceStart = {};
      const creditBalanceEnd = {};
      const provisionalBalance = [];
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
            A: item.creditAValue,
            B: item.creditBValue,
          });
        }
        if (item.category === 'creditsIssuedSales') {
          item.issuedCredits.forEach((each) => {
            creditsIssuedSales.push({
              modelYear: each.modelYear,
              A: each.A,
              B: each.B,
            });
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

      creditAReduction(supplierClass, classAReduction, provisionalBalance);

      axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((assertionResponse) => {
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
      setLoading(false);
    }));
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
        unspecifiedCreditReduction={unspecifiedCreditReduction}
        id={id}
        handleCancelConfirmation={handleCancelConfirmation}
        zevClassAReduction={zevClassAReduction}
        unspecifiedReductions={unspecifiedReductions}
        creditBalance={creditBalance}
      />
    </>
  );
};

ComplianceObligationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceObligationContainer;
