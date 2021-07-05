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

  const [assertions, setAssertions] = useState([]);
  const [balances, setBalances] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [classAReductions, setClassAReductions] = useState([]);
  const [creditReductionSelection, setCreditReductionSelection] = useState(null);
  const [deductions, setDeductions] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingBalanceExist, setPendingBalanceExist] = useState(false);
  const [ratios, setRatios] = useState({});
  const [reportDetails, setReportDetails] = useState({});
  const [reportYear, setReportYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [sales, setSales] = useState(0);
  const [statuses, setStatuses] = useState({});
  const [supplierClass, setSupplierClass] = useState('S');
  const [totalReduction, setTotalReduction] = useState(0);
  const [unspecifiedReductions, setUnspecifiedReductions] = useState([]);
  const [updatedBalances, setUpdatedBalances] = useState({});
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

  const handleChangeSales = (event) => {
    const { value } = event.target;
    setSales(Number(value));

    if (!isNaN(Number(value))) {
      const tempTotalReduction = getTotalReduction(Number(value), ratios.complianceRatio);
      const classAReduction = getClassAReduction(Number(value), ratios.zevClassA, supplierClass);
      const leftoverReduction = getUnspecifiedClassReduction(
        Number(tempTotalReduction), Number(classAReduction),
      );

      setTotalReduction(tempTotalReduction);

      const tempClassAReductions = [{
        modelYear: Number(reportYear),
        value: Number(classAReduction),
      }];
      setClassAReductions(tempClassAReductions);

      const tempUnspecifiedReductions = [{
        modelYear: Number(reportYear),
        value: Number(leftoverReduction),
      }];
      setUnspecifiedReductions(tempUnspecifiedReductions);

      if (creditReductionSelection) {
        const creditReduction = calculateCreditReduction(
          balances,
          tempClassAReductions,
          tempUnspecifiedReductions,
          creditReductionSelection,
        );

        setDeductions(creditReduction.deductions);

        setUpdatedBalances({
          balances: creditReduction.balances,
          deficits: creditReduction.deficits,
        });
      }
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

    setDeductions(creditReduction.deductions);

    setUpdatedBalances({
      balances: creditReduction.balances,
      deficits: creditReduction.deficits,
    });
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

    if (deductions) {
      // zev class A reductions
      deductions.filter((deduction) => deduction.type === 'classAReduction').forEach((deduction) => {
        reportDetailsArray.push({
          category: 'ClassAReduction',
          year: deduction.modelYear,
          a: deduction.creditA,
          b: deduction.creditB,
        });
      });

      // unspecified reductions
      deductions.filter((deduction) => deduction.type === 'unspecifiedReduction').forEach((deduction) => {
        reportDetailsArray.push({
          category: 'UnspecifiedClassCreditReduction',
          year: deduction.modelYear,
          a: deduction.creditA,
          b: deduction.creditB,
        });
      });
    }

    if (updatedBalances) {
      // provincial balance after reductions
      if (updatedBalances.balances.length > 0) {
        updatedBalances.balances.forEach((balance) => {
          reportDetailsArray.push({
            category: 'ProvisionalBalanceAfterCreditReduction',
            year: balance.modelYear,
            a: balance.creditA || 0,
            b: balance.creditB || 0,
          });
        });
      }

      // deficits
      if (updatedBalances.deficits.length > 0) {
        updatedBalances.deficits.forEach((balance) => {
          reportDetailsArray.push({
            category: 'CreditDeficit',
            year: balance.modelYear,
            a: balance.creditA || 0,
            b: balance.creditB || 0,
          });
        });
      }
    }
    

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

    // reportDetailsArray.push({
    //   category: 'ProvisionalBalanceAfterCreditReduction',
    //   year: reportYear,
    //   a: creditBalance.A,
    //   b: creditBalance.B,
    // });

    // reportDetailsArray.push({
    //   category: 'CreditDeficit',
    //   year: reportYear,
    //   a: creditBalance.creditADeficit,
    //   b: creditBalance.unspecifiedCreditDeficit,
    // });

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
        creditReductionSelection: radioSelection,
        modelYear,
        modelYearReportHistory,
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

      setStatuses(reportStatuses);

      const filteredRatios = ratioResponse.data.find(
        (data) => Number(data.modelYear) === Number(currentReportYear),
      );
      setRatios(filteredRatios);

      const complianceResponseDetails = complianceResponse.data.complianceObligation;
      const { ldvSales } = complianceResponse.data;

      setSales(Number(ldvSales));

      const creditBalanceStart = {};
      const creditBalanceEnd = {};
      const provisionalBalance = {};
      const pendingBalance = [];
      const transfersIn = [];
      const transfersOut = [];
      const creditsIssuedSales = [];

      complianceResponseDetails.forEach((item) => {
        let endingBalanceA = 0;
        let endingBalanceB = 0;

        if (creditBalanceEnd[item.modelYear.name]) {
          endingBalanceA = creditBalanceEnd[item.modelYear.name].A;
          endingBalanceB = creditBalanceEnd[item.modelYear.name].B;
        }

        if (item.category === 'creditBalanceStart') {
          creditBalanceStart[item.modelYear.name] = {
            A: item.creditAValue,
            B: item.creditBValue,
          };

          endingBalanceA += Number(item.creditAValue);
          endingBalanceB += Number(item.creditBValue);
        }

        if (item.category === 'transfersIn') {
          transfersIn.push({
            modelYear: item.modelYear.name,
            A: item.creditAValue,
            B: item.creditBValue,
          });

          endingBalanceA += Number(item.creditAValue);
          endingBalanceB += Number(item.creditBValue);
        }

        if (item.category === 'transfersOut') {
          transfersOut.push({
            modelYear: item.modelYear.name,
            A: item.creditAValue,
            B: item.creditBValue,
          });

          endingBalanceA -= Number(item.creditAValue);
          endingBalanceB -= Number(item.creditBValue);
        }

        if (item.category === 'creditsIssuedSales') {
          creditsIssuedSales.push({
            modelYear: item.modelYear.name,
            A: item.creditAValue,
            B: item.creditBValue,
          });

          endingBalanceA += item.creditAValue;
          endingBalanceB += item.creditBValue;
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

          endingBalanceA += item.creditAValue;
          endingBalanceB += item.creditBValue;
        }

        creditBalanceEnd[item.modelYear.name] = {
          A: endingBalanceA,
          B: endingBalanceB,
        };
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

      setDeductions(creditReduction.deductions);

      setUpdatedBalances({
        balances: creditReduction.balances,
        deficits: creditReduction.deficits,
      });

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
        classAReductions={classAReductions}
        creditReductionSelection={creditReductionSelection}
        deductions={deductions}
        details={details}
        handleCancelConfirmation={handleCancelConfirmation}
        handleChangeSales={handleChangeSales}
        handleCheckboxClick={handleCheckboxClick}
        handleSave={handleSave}
        handleUnspecifiedCreditReduction={handleUnspecifiedCreditReduction}
        id={id}
        loading={loading}
        pendingBalanceExist={pendingBalanceExist}
        ratios={ratios}
        reportDetails={reportDetails}
        reportYear={reportYear}
        sales={sales}
        statuses={statuses}
        supplierClass={supplierClass}
        totalReduction={totalReduction}
        unspecifiedReductions={unspecifiedReductions}
        updatedBalances={updatedBalances}
        user={user}
      />
    </>
  );
};

ComplianceObligationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceObligationContainer;
