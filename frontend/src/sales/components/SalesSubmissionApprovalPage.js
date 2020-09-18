import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import SalesSubmissionModelsTable from './SalesSubmissionModelsTable';

const SalesSubmissionApprovalPage = (props) => {
  const {
    handleSubmit,
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
          <SalesSubmissionModelsTable
            items={submission.content}
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
              {user.isGovernment && submission.validationStatus === 'SUBMITTED' && [
                <button
                  className="button primary"
                  key="btn-validate"
                  type="button"
                >
                  Validate
                </button>,
                <button
                  className="button primary"
                  key="btn-approve"
                  onClick={handleSubmit}
                  type="button"
                >
                  <FontAwesomeIcon icon="share-square" /> Approve
                </button>,
              ]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

SalesSubmissionApprovalPage.defaultProps = {};

SalesSubmissionApprovalPage.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionApprovalPage;
