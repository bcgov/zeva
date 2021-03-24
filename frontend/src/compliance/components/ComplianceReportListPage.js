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
          <h2>Model Year Reports</h2>
        </div>
        {displayBtn && (<div className="col-md-4 text-right">
          <button
            className="button primary ml-3"
            onClick={() => {
              history.push(ROUTES_COMPLIANCE.NEW);
            }}
            type="button"
          >
            <FontAwesomeIcon icon="plus" /> New Report
            </button>
        </div>
        )}
      </div>
      <div className="text-blue mt-4">
        Under section 17 (5) of the ZEV Act a model year report must include for
        the adjustment period ending September 30:
        <ul className="mt-2">
          <li>
            the number of credits issued or transferred or added to your balance
          </li>
          <li>
            the number of credits offset or transferred away from your balance
          </li>
        </ul>
        Consumer sales of zero-emission vehicles made prior to October 1 must be
        included in a submitted credit application prior to completing your
        model year report. Model year reports must be submitted on or before
        October 20.
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
