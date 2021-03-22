import axios from 'axios';
import React, { useEffect, useState } from 'react';

import ROUTES_CREDITS from '../app/routes/Credits';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceObligationDetailsPage from './components/ComplianceObligationDetailsPage';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';

const ComplianceObligationContainer = (props) => {
  const { keycloak, user } = props;
  const reportStatuses = {
    assessment: '',
    consumerSales: '',
    creditActivity: 'draft',
    reportSummary: '',
    supplierInformation: '',
  };
  const [loading, setLoading] = useState(true);
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [reportYear, setReportYear] = useState('2021');
  const [reportDetails, setReportDetails] = useState({});
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
    const listAssertion = axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((response) => {
      const filteredAssertions = response.data.filter((data) => data.module === 'compliance_obligation');
      setAssertions(filteredAssertions);
    });

    const complianceReportDetails = axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS_BY_YEAR
      .replace(':year', reportYear)).then((response) => {
      const details = response.data;
      const creditsIssuedSales = parseCreditTransactions(details.reportYearTransactions.creditsIssuedSales);
      const transfersIn = parseCreditTransactions(details.reportYearTransactions.transfersIn);
      const transfersOut = parseCreditTransactions(details.reportYearTransactions.transfersOut);
      const reportYearBalance = {};
      creditsIssuedSales.forEach((each) => {
        reportYearBalance[each.modelYear] = {
          A: parseFloat(each.A) || 0, B: parseFloat(each.B) || 0 };
      });
      transfersIn.forEach((each) => {
        if (!Object.keys(reportYearBalance).includes(each.modelYear)) {
          reportYearBalance[each.modelYear] = { A: 0, B: 0 };
        }
        reportYearBalance[each.modelYear].A += parseFloat(each.A) || 0;
        reportYearBalance[each.modelYear].B += parseFloat(each.B) || 0;
      });
      transfersOut.forEach((each) => {
        if (!Object.keys(reportYearBalance).includes(each.modelYear)) {
          reportYearBalance[each.modelYear] = { A: 0, B: 0 };
        }
        reportYearBalance[each.modelYear].A += parseFloat(-each.A) || 0;
        reportYearBalance[each.modelYear].B += parseFloat(-each.B) || 0;
      });
      const provisionalBalance = {};
      Object.keys(reportYearBalance).forEach((year) => {
        provisionalBalance[year] = { A: parseFloat(reportYearBalance[year].A), B: parseFloat(reportYearBalance[year].B) };
      });
      Object.keys(details.pendingBalance).forEach((year) => {
        provisionalBalance[year].A += parseFloat(details.pendingBalance[year].A);
        provisionalBalance[year].B += parseFloat(details.pendingBalance[year].B);
      });

      setReportDetails({
        priorYearBalance: {
          year: details.priorYearBalance.year,
          a: details.priorYearBalance.a,
          b: details.priorYearBalance.b,
        },
        reportYearBalance,
        pendingBalance: details.pendingBalance,
        provisionalBalance,
        transactions: {
          creditsIssuedSales,
          transfersIn,
          transfersOut,
        },
      });
    });

    Promise.all([listAssertion, complianceReportDetails]).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <>
      <ComplianceReportTabs active="credit-activity" reportStatuses={reportStatuses} user={user} />
      <ComplianceObligationDetailsPage
        reportDetails={reportDetails}
        reportYear={reportYear}
        loading={loading}
        user={user}
        assertions={assertions}
        checkboxes={checkboxes}
        handleCheckboxClick={handleCheckboxClick}
      />
    </>
  );
};

ComplianceObligationContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceObligationContainer;
