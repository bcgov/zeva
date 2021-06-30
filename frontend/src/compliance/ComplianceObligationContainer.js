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
import getClassAReduction from '../app/utilities/getClassAReduction';
import getTotalReduction from '../app/utilities/getTotalReduction';
import getUnspecifiedClassReduction from '../app/utilities/getUnspecifiedClassReduction';

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
  const [balances, setBalances] = useState([]);
  const [pendingBalanceExist, setPendingBalanceExist] = useState(false);
  const [supplierClass, setSupplierClass] = useState('S');
  const [sales, setSales] = useState(0);
  const [creditReductionSelection, setCreditReductionSelection] = useState(null);
  const { id } = useParams();
  const [classAReductions, setClassAReductions] = useState([]);
  const [unspecifiedReductions, setUnspecifiedReductions] = useState([]);
  const [creditBalance, setCreditBalance] = useState({ A: 0, B: 0 });
  const [totalReduction, setTotalReduction] = useState(0);

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
    setSales(Number(value));

    if (!isNaN(Number(value))) {
      const tempTotalReduction = getTotalReduction(Number(value), ratios.complianceRatio);
      const classAReduction = getClassAReduction(Number(value), ratios.zevClassA, supplierClass);
      const leftoverReduction = getUnspecifiedClassReduction(Number(tempTotalReduction), Number(classAReduction));

      setClassAReductions([{
        modelYear: Number(reportYear),
        value: Number(classAReduction),
      }]);

      setUnspecifiedReductions([{
        modelYear: Number(reportYear),
        value: Number(leftoverReduction),
      }]);

      setTotalReduction(tempTotalReduction);
    }
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

  const handleUnspecifiedCreditReduction = (radioId) => {
    setCreditReductionSelection(radioId);

    const creditReduction = calculateCreditReduction(
      balances,
      classAReductions,
      unspecifiedReductions,
      radioId,
    );

    console.error(creditReduction);

    // setZevClassAReduction(result.zevClassAReduction);
    // setUnspecifiedReductions(result.unspecifiedReductions);
    // setCreditBalance(result.creditBalance);
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
    // reportDetailsArray.push({
    //   category: 'ClassAReduction',
    //   year: reportYear,
    //   a: zevClassAReduction.currentYearA,
    //   b: 0,
    // });

    // // zev class A reductions previous year
    // reportDetailsArray.push({
    //   category: 'ClassAReduction',
    //   year: reportYear - 1,
    //   a: zevClassAReduction.lastYearA,
    //   b: 0,
    // });

    // unspecified balance current year
    // reportDetailsArray.push({
    //   category: 'UnspecifiedClassCreditReduction',
    //   year: reportYear,
    //   a: unspecifiedReductions.currentYearA,
    //   b: unspecifiedReductions.currentYearB,
    // });

    // unspecified balance previous year
    // reportDetailsArray.push({
    //   category: 'UnspecifiedClassCreditReduction',
    //   year: reportYear - 1,
    //   a: unspecifiedReductions.lastYearA,
    //   b: unspecifiedReductions.lastYearB,
    // });

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
        confirmations,
        modelYear,
        modelYearReportHistory,
        radioSelection,
        statuses: reportStatuses,
        supplierClass: tempSupplierClass,
        validationStatus,
      } = reportDetailsResponse.data;

      setDetails({
        complianceObligation: {
          history: modelYearReportHistory,
          validationStatus,
        },
      });

      setCreditReductionSelection(radioSelection);

      setSupplierClass(tempSupplierClass);

      const currentReportYear = Number(modelYear.name);
      setReportYear(currentReportYear);

      if (confirmations.length > 0) {
        setConfirmed(true);
      }

      setStatuses(reportStatuses);

      const filteredRatios = ratioResponse.data.find(
        (data) => Number(data.modelYear) === Number(currentReportYear),
      );
      setRatios(filteredRatios);

      const complianceResponseDetails = complianceResponse.data.complianceObligation;
      const { ldvSales } = complianceResponse.data;

      // setSupplierClassInfo({ class: supplierClass, ldvSales });
      setSales(Number(ldvSales));

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

      // const creditAReduction = calculateCreditAReduction(
      //   supplierClass, classAReduction, provisionalBalance, Number(modelYear.name),
      // );

      // if (creditAReduction.zevClassACreditReduction) {
      //   setZevClassAReduction(creditAReduction.zevClassACreditReduction);
      // }

      // setRemainingABalance(creditAReduction.remainingABalance);
      const tempTotalReduction = getTotalReduction(ldvSales, filteredRatios.complianceRatio);
      const classAReduction = getClassAReduction(ldvSales, filteredRatios.zevClassA, supplierClass);
      const leftoverReduction = getUnspecifiedClassReduction(tempTotalReduction, classAReduction);
      setTotalReduction(tempTotalReduction);

      Object.keys(provisionalBalance).forEach((year) => {
        const { A: creditA, B: creditB } = provisionalBalance[year];
        balances.push({
          modelYear: Number(year),
          creditA,
          creditB,
        });
      });

      setBalances([...balances]);

      classAReductions.push({
        modelYear: Number(modelYear.name),
        value: Number(classAReduction),
      });

      unspecifiedReductions.push({
        modelYear: Number(modelYear.name),
        value: Number(leftoverReduction),
      });

      setClassAReductions([...classAReductions]);
      setUnspecifiedReductions([...unspecifiedReductions]);

      const creditReduction = calculateCreditReduction(
        balances,
        classAReductions,
        unspecifiedReductions,
        radioSelection,
      );

      // if (creditReduction.zevClassAReduction) {
      //   setZevClassAReduction(creditReduction.zevClassAReduction);
      // }
      // setUnspecifiedReductions(creditReduction.unspecifiedReductions);

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
        supplierClass={supplierClass}
        user={user}
        statuses={statuses}
        handleUnspecifiedCreditReduction={handleUnspecifiedCreditReduction}
        id={id}
        handleCancelConfirmation={handleCancelConfirmation}
        zevClassAReduction={{
          currentYearA: classAReductions.length > 0 ? classAReductions[0].value : 0,
        }}
        creditBalance={creditBalance}
        sales={sales}
        handleChangeSales={handleChangeSales}
        creditReductionSelection={creditReductionSelection}
        pendingBalanceExist={pendingBalanceExist}
        classAReductions={classAReductions}
        unspecifiedReductions={unspecifiedReductions}
        totalReduction={totalReduction}
      />
    </>
  );
};

ComplianceObligationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceObligationContainer;
