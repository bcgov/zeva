import React from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportsTable from './ComplianceReportsTable'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loading from '../../app/components/Loading';
import history from '../../app/History';

const ComplianceReportListPage = (props) => {
  const { user, data, displayBtn, loading } = props;

  if (loading) {
    return <Loading />;
  }
  
  return (
    <div id="compliance-report-list" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>Model Year Compliance Reports</h2>
        </div>
        {displayBtn && (<div className="col-md-4 text-right">
          <button
            className="button primary ml-3"
            onClick={() => {
              history.push(ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION.replace(/:id/g, 'new'));
            }}
            type="button"
          >
            <FontAwesomeIcon icon="plus" /> New Report
            </button>
        </div>
        )}
      </div>
      <div className="row mt-4">
          <div className="col-sm-12">
            <ComplianceReportsTable data={data} user={user}></ComplianceReportsTable>
          </div>
      </div> 
    </div>
  );
};
ComplianceReportListPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  displayBtn: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};
export default ComplianceReportListPage;
