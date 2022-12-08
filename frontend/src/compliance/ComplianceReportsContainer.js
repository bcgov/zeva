import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import CONFIG from '../app/config';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ComplianceReportListPage from './components/ComplianceReportListPage';

const qs = require('qs');

const ComplianceReportsContainer = (props) => {
  const { location, user } = props;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [availableYears, setAvailableYears] = useState(
    CONFIG.FEATURES.MODEL_YEAR_REPORT.YEARS
  );
  const [ratios, setRatios] = useState({});

  const query = qs.parse(location.search, { ignoreQueryPrefix: true });

  const refreshList = (showLoading) => {
    setLoading(showLoading);
    const queryFilter = [];
    Object.entries(query).forEach(([key, value]) => {
      queryFilter.push({ id: key, value });
    });
    setFiltered([...filtered, ...queryFilter]);
    if (location.state) {
      setFiltered([...filtered, ...location.state]);
    }
    const ratiosPromise = axios.get(ROUTES_COMPLIANCE.RATIOS);
    const reportsPromise = axios.get(
      ROUTES_COMPLIANCE.REPORTS + '?consider-supplemental=Y'
    );

    Promise.all([reportsPromise, ratiosPromise]).then(
      ([response, ratiosResponse]) => {
        setData(response.data);
        // if the user is a supplier, figure out which years to allow them to create reports for
        if (!user.isGovernment) {
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

          let nextYear = 2020;

          if (mostRecentCompleted) {
            nextYear = Number(mostRecentCompleted) + 1;
          }

          if (availableYears.length > 0) {
            // show only the next year if all previous reports have been assessed
            filteredYears = availableYears.filter((year) => year === nextYear);
          } else if (availableYears.length === 0) {
            const { ldvSales } = user.organization;
            if (ldvSales.length > 0) {
              // if an organization has ldv sales, only allow them to submit reports
              // for the year after their most recent sale
              ldvSales.sort(
                (a, b) => parseFloat(a.modelYear) - parseFloat(b.modelYear)
              );
              const mostRecentSale = ldvSales.pop();
              filteredYears = availableYears.filter(
                (year) => year === parseInt(mostRecentSale.modelYear, 10) + 1
              );
            } else {
              // if an organization does not have ldv sales, only allow them to submit
              // reports for the current year and previous year
              const today = new Date();
              const currentYear = today.getFullYear();
              const previousYear = currentYear - 1;
              filteredYears = availableYears.filter(
                (year) => year === currentYear || year === previousYear
              );
            }
          }

          if (unfinishedFlag) {
            filteredYears = [];
          }
          setAvailableYears(filteredYears);
        }

        setRatios(ratiosResponse.data);

        setLoading(false);
      }
    );
  };
  useEffect(() => {
    refreshList(true);
  }, []);

  return (
    <>
      <ComplianceTabs active="reports" user={user} />
      <ComplianceReportListPage
        availableYears={availableYears}
        data={data}
        filtered={filtered}
        loading={loading}
        ratios={ratios}
        setFiltered={setFiltered}
        showSupplier={user.isGovernment}
        user={user}
      />
    </>
  );
};
ComplianceReportsContainer.propTypes = {
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
};
export default withRouter(ComplianceReportsContainer);
