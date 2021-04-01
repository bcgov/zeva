import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceObligationDetailsPage from './components/ComplianceObligationDetailsPage';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';

const ComplianceObligationContainer = (props) => {
  const { user } = props;
  const reportStatuses = {
    assessment: '',
    consumerSales: '',
    creditActivity: 'draft',
    reportSummary: '',
    supplierInformation: '',
  };
  const [offsetNumbers, setOffsetNumbers] = useState({});
  const [loading, setLoading] = useState(true);
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [reportYear, setReportYear] = useState('2019');
  const [reportDetails, setReportDetails] = useState({});
  const [ratios, setRatios] = useState({});
  const [supplierClassInfo, setSupplierClassInfo] = useState({ sales: 0, class: '' });
  const { id } = useParams();
  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter((each) => Number(each) !== Number(event.target.id));
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id);
      setCheckboxes(checked);
    }
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
      const { supplierClass, ldvSales } = reportDetailsResponse;
      setSupplierClassInfo({ class: supplierClass, ldvSales });

      const ratioPromise = axios.get(ROUTES_COMPLIANCE.RATIOS).then((ratioResponse) => {
        const filteredRatio = ratioResponse.data.filter((data) => data.modelYear === reportDetailsResponse.modelYear.name)[0];
        setRatios(filteredRatio);
      });

      const complianceReportDetails = axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS_BY_YEAR
        .replace(':year', reportDetailsResponse.modelYear.name)).then((complianceResponse) => {
        const yearObject = {};
        const details = complianceResponse.data;
        const creditsIssuedSales = parseCreditTransactions(
          details.reportYearTransactions.creditsIssuedSales,
        );
        const transfersIn = parseCreditTransactions(
          details.reportYearTransactions.transfersIn,
        );
        const transfersOut = parseCreditTransactions(
          details.reportYearTransactions.transfersOut,
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
        Object.keys(details.pendingBalance).forEach((year) => {
          yearObject[year] = { A: 0, B: 0 };
          provisionalBalance[year].A += parseFloat(details.pendingBalance[year].A);
          provisionalBalance[year].B += parseFloat(details.pendingBalance[year].B);
        });
        setOffsetNumbers(yearObject);
        const priorYear = details.priorYearBalance.year;
        const creditBalanceStart = {};
        creditBalanceStart[priorYear] = {
          year: details.priorYearBalance.year,
          A: details.priorYearBalance.A,
          B: details.priorYearBalance.B,
        };
        setReportDetails({
          creditBalanceStart,
          creditBalanceEnd: reportYearBalance,
          pendingBalance: details.pendingBalance,
          provisionalBalance,
          transactions: {
            creditsIssuedSales,
            transfersIn,
            transfersOut,
          },
        });

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
      <ComplianceReportTabs active="credit-activity" reportStatuses={reportStatuses} user={user} />
      <ComplianceObligationDetailsPage
        offsetNumbers={offsetNumbers}
        ratios={ratios}
        reportDetails={reportDetails}
        reportYear={reportYear}
        loading={loading}
        user={user}
        assertions={assertions}
        checkboxes={checkboxes}
        handleCheckboxClick={handleCheckboxClick}
        supplierClassInfo={supplierClassInfo}
        handleOffsetChange={handleOffsetChange}
        handleSave={handleSave}
      />
    </>
  );
};

ComplianceObligationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceObligationContainer;
