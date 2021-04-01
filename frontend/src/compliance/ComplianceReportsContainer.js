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

      const filteredYears = availableYears.filter((year) => (
        response.data.findIndex(
          (item) => parseInt(item.modelYear.name, 10) === parseInt(year, 10),
        ) < 0
      ));

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
      />
    </>
  );
};
ComplianceReportsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportsContainer;
