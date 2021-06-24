import axios from 'axios';
import React, { useEffect, useState } from 'react';

import CONFIG from '../app/config';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ComplianceReportListPage from './components/ComplianceReportListPage';

const ComplianceReportsContainer = (props) => {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const [availableYears, setAvailableYears] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.YEARS);

  const collapseDropdown = () => {
    setCollapsed(!collapsed);
  };

  const refreshList = (showLoading) => {
    setLoading(showLoading);
    axios.get(ROUTES_COMPLIANCE.REPORTS).then((response) => {
      setData(response.data);
      const allRecords = [];
      response.data.forEach((record) => {
        const status = record.validationStatus;
        const year = record.modelYear.name;
        allRecords.push({ year, status });
      });
      // sort records by year
      allRecords.sort((a, b) => parseFloat(a.year) - parseFloat(b.year));
      // if validation status exists but is not assessed for one year
      // do not add any further years to filtered years/available years
      let unfinishedFlag = false;
      const completedYears = [];
      allRecords.every((record) => {
        if (record.status !== 'ASSESSED') {
          unfinishedFlag = true;
          return false;
        }
        completedYears.push(record.year);
        return true;
      });
      let filteredYears = [];
      const mostRecentCompleted = completedYears.pop();
      const nextYear = parseInt(mostRecentCompleted, 10) + 1;
      if (availableYears.lenth > 0) {
        // show only the next year if all previous reports have been assessed
        filteredYears = availableYears.filter((year) => (
          year === nextYear
        ));
      }
      const { ldvSales } = user.organization;
      if (ldvSales) {
        // if an organization has ldv sales, only allow them to submit reports
        // for the year after their most recent sale
        ldvSales.sort((a, b) => parseFloat(a.modelYear) - parseFloat(b.modelYear));
        const mostRecentSale = ldvSales.pop();
        filteredYears = availableYears.filter((year) => (
          year === parseInt(mostRecentSale.modelYear, 10) + 1
        ));
      } else {
        // if an organization does not have ldv sales, only allow them to submit
        // reports for the current year and previous year
        const today = new Date();
        const currentYear = today.getFullYear();
        const previousYear = currentYear - 1;
        filteredYears = availableYears.filter((year) => (
          year === currentYear || year === previousYear
        ));
      }

      if (unfinishedFlag) {
        filteredYears = [];
      }
      setAvailableYears(filteredYears);
      setLoading(false);
    });
  };
  useEffect(() => {
    refreshList(true);
  }, []);

  return (
    <>
      <ComplianceTabs active="reports" user={user} />
      <ComplianceReportListPage
        availableYears={availableYears}
        collapsed={collapsed}
        collapseDropdown={collapseDropdown}
        data={data}
        loading={loading}
        user={user}
        showSupplier={user.isGovernment}
      />
    </>
  );
};
ComplianceReportsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportsContainer;
