import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ComplianceReportListPage from './components/ComplianceReportListPage';

const ComplianceReportsContainer = (props) => {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [displayBtn, setDisplayBtn] = useState(true);

  const displayNewReportBtn = (data) => {
    const d = new Date();
    const currentYear = d.getFullYear();
    const draftRecord = data.filter((item) => item.validationStatus === 'DRAFT' && item.modelYear.name == currentYear);
    if (draftRecord.length > 0) {
      setDisplayBtn(false);
    }
  };

  const refreshList = (showLoading) => {
    setLoading(showLoading);
    axios.get(ROUTES_COMPLIANCE.REPORTS).then((response) => {
      setData(response.data);
      displayNewReportBtn(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList(true);
  }, []);

  return (
    <>
      <ComplianceTabs active="reports" user={user} />
      <ComplianceReportListPage data={data} loading={loading} displayBtn={displayBtn} user={user} />
    </>
  );
};
ComplianceReportsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportsContainer;
