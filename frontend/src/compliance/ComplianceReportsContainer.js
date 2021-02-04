import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ComplianceReportListPage from './components/ComplianceReportListPage';

const ComplianceReportsContainer = (props) => {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [displayBtn, setDisplayBtn] = useState(true);
  let tempData = [{ "id":"1","modelYear": "2019", "status": "Assessed", "compliant": "Yes", "totalLdvSales": "3,860", "supplierClass": "Large", "obligationTotal": "", "obligationACredits": "" },
    { "id":"2","modelYear": "2020", "status": "Assessed", "compliant": "Yes", "totalLdvSales": "5,934", "supplierClass": "Medium", "obligationTotal": "574.10", "obligationACredits": "NA" }]
  
  const refreshList = (showLoading) => {
    setLoading(showLoading);
    // TODO: Remove tempData and uncomment axios call to get the list of reports from the DB
    //axios.get(ROUTES_COMPLIANCE.REPORTS).then((response) => {
      //setData(response.data);
    setData(tempData);
    displayNewReportBtn(tempData)
    setLoading(false);
    //});

  };
  const displayNewReportBtn = (data) => {
    let d = new Date();
    let currentYear = d.getFullYear();
    let draftRecord = data.filter((item) => item.status === "Draft" && item.modelYear == currentYear);
    if (draftRecord.length > 0) {
      setDisplayBtn(false)
    } 
  }

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
