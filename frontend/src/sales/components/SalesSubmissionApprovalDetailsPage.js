import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import SalesSubmissionVehiclesTable from './SalesSubmissionVehiclesTable';

const SalesSubmissionApprovalDetailsPage = (props) => {
  const {
    routeParams,
    submission,
    user,
  } = props;

  return (
    <div id="sales-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>{submission.organization && submission.organization.name} ZEV Sales Submission {submission.submissionDate}</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <SalesSubmissionVehiclesTable
            routeParams={routeParams}
            submission={submission}
            user={user}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  history.goBack();
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> Back
              </button>
            </span>
            <span className="right-content">
              <button
                className="button primary"
                type="button"
              >
                <FontAwesomeIcon icon="save" /> Save
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

SalesSubmissionApprovalDetailsPage.defaultProps = {};

SalesSubmissionApprovalDetailsPage.propTypes = {
  routeParams: PropTypes.shape().isRequired,
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionApprovalDetailsPage;
