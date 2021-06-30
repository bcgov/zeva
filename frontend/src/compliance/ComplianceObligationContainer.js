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
import calculateCreditReduction from '../app/utilities/calculateCreditReduction';
import calculateCreditAReduction from '../app/utilities/calculateCreditAReduction';

const ComplianceObligationContainer = (props) => {
  const { user } = props;

  const [confirmed, setConfirmed] = useState(false);
  const [disabledCheckboxes, setDisabledCheckboxes] = useState('');
  const [loading, setLoading] = useState(true);
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [reportYear, setReportYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [reportDetails, setReportDetails] = useState({});
  const [ratios, setRatios] = useState({});
  const [details, setDetails] = useState({});
  const [statuses, setStatuses] = useState({});
  const [pendingBalanceExist, setPendingBalanceExist] = useState(false);
  const [supplierClassInfo, setSupplierClassInfo] = useState({ ldvSales: 0, class: '' });
  const [sales, setSales] = useState(0);
  const [creditReductionSelection, setCreditReductionSelection] = useState(null);
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

  const handleChangeSales = (event) => {
    const { value } = event.target;
    setSales(value);
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

  const unspecifiedCreditReduction = (event, classAReduction) => {
    const { provisionalBalance } = reportDetails;
    const { id: radioId } = event.target;

    const result = calculateCreditReduction(
      radioId, supplierClassInfo.class, classAReduction, provisionalBalance, sales, ratios, reportYear,
    );

    setCreditReductionSelection(radioId);

    setZevClassAReduction(result.zevClassAReduction);
    setUnspecifiedReductions(result.unspecifiedReductions);
    setCreditBalance(result.creditBalance);
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

    // zev class A reductions current year
    reportDetailsArray.push({
      category: 'ClassAReduction',
      year: reportYear,
      a: zevClassAReduction.currentYearA,
      b: 0,
    });

    // zev class A reductions previous year
    reportDetailsArray.push({
      category: 'ClassAReduction',
      year: reportYear - 1,
      a: zevClassAReduction.lastYearA,
      b: 0,
    });

    // unspecified balance current year
    reportDetailsArray.push({
      category: 'UnspecifiedClassCreditReduction',
      year: reportYear,
      a: unspecifiedReductions.currentYearA,
      b: unspecifiedReductions.currentYearB,
    });

    // unspecified balance previous year
    reportDetailsArray.push({
      category: 'UnspecifiedClassCreditReduction',
      year: reportYear - 1,
      a: unspecifiedReductions.lastYearA,
      b: unspecifiedReductions.lastYearB,
    });

    reportDetailsArray.push({
      category: 'ProvisionalBalanceAfterCreditReduction',
      year: reportYear,
      a: creditBalance.A,
      b: creditBalance.B,
    });

    reportDetailsArray.push({
      category: 'CreditDeficit',
      year: reportYear,
      a: creditBalance.creditADeficit,
      b: creditBalance.unspecifiedCreditDeficit,
    });

    const data = {
      reportId: id,
      sales,
      creditActivity: reportDetailsArray,
      confirmations: checkboxes,
      creditReductionSelection,
    };
    axios.post(
      ROUTES_COMPLIANCE.OBLIGATION, data,
    ).then(() => {
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
        modelYearReportHistory,
        supplierClass,
        validationStatus,
        confirmations,
        modelYear,
        statuses: reportStatuses,
        creditReductionSelection,
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

      const filteredRatio = ratioResponse.data.filter((data) => data.modelYear === modelYear.name)[0];
      setRatios(filteredRatio);
 
      const complianceResponseDetails = complianceResponse.data.complianceObligation;
      const { ldvSales } = complianceResponse.data;
      setSupplierClassInfo({ class: supplierClass, ldvSales });
      const classAReduction = ((filteredRatio.zevClassA / 100) * ldvSales);

      setSales(ldvSales);
      const creditBalanceStart = {};
      const creditBalanceEnd = {};
      const provisionalBalance = {};
      const pendingBalance = [];
      const transfersIn = [];
      const transfersOut = [];
      const creditsIssuedSales = [];

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
          if (item.issuedCredits) {
            item.issuedCredits.forEach((each) => {
              creditsIssuedSales.push({
                modelYear: each.modelYear,
                A: each.A,
                B: each.B,
              });
            });
          } else {
            creditsIssuedSales.push({
              modelYear: typeof item.modelYear === 'string' ? item.modelYear : item.modelYear.name,
              A: item.creditAValue,
              B: item.creditBValue,
            });
          }
        }
        if (item.category === 'pendingBalance') {
          if (item.creditAValue > 0 || item.creditBValue > 0) {
            setPendingBalanceExist(true);
          }
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
          A: Number(creditBalanceEnd[item].A),
          B: Number(creditBalanceEnd[item].B),
        };
      });

      // go through every item in pending and add to total if year already there or create new
      pendingBalance.forEach((item) => {
        if (provisionalBalance[item.modelYear]) {
          provisionalBalance[item.modelYear].A += Number(item.A);
          provisionalBalance[item.modelYear].B += Number(item.B);
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

      setCreditReductionSelection(creditReductionSelection);

      const creditAReduction = calculateCreditAReduction(
        supplierClass, classAReduction, provisionalBalance, Number(modelYear.name),
      );

      if (creditAReduction.zevClassACreditReduction) {
        setZevClassAReduction(creditAReduction.zevClassACreditReduction);
      }

      setRemainingABalance(creditAReduction.remainingABalance);

      const creditReduction = calculateCreditReduction(
        creditReductionSelection,
        supplierClass,
        classAReduction,
        provisionalBalance,
        ldvSales,
        filteredRatio,
        Number(modelYear.name),
      );

      if (creditReduction.zevClassAReduction) {
        setZevClassAReduction(creditReduction.zevClassAReduction);
      }
      setUnspecifiedReductions(creditReduction.unspecifiedReductions);

      setCreditBalance(creditReduction.creditBalance);

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
        handleSave={handleSave}
        loading={loading}
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
        sales={sales}
        handleChangeSales={handleChangeSales}
        creditReductionSelection={creditReductionSelection}
        pendingBalanceExist={pendingBalanceExist}
      />
    </>
  );
};

ComplianceObligationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceObligationContainer;
