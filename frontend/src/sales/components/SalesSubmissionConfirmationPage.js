import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import history from '../../app/History';

import CustomPropTypes from '../../app/utilities/props';

const SalesSubmissionConfirmationPage = (props) => {
  const {
    user,
    details,
  } = props;

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <span className="left-content">
              <FontAwesomeIcon icon="check" />Submission Complete!
            </span>
          </span>
          <span className="right-content">
            <button
              className="button"
              onClick={() => {
              }}
              type="button"
            >
              <FontAwesomeIcon icon="link" /> View Submission
            </button>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div id="sales-submission-confirmation" className="page">

      <div className="row">
        <div className="col-sm-12">
          <h1>{user.organization.name} ZEV Sales Submission {details.submissionID}</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <h2>Submission Complete</h2>
          <p>
            Your submission has been received and will now be reviewed
            by The Province of British Columbia.
          </p>
          <p>
            You can view the status of your submission from the <a
              href="#"
              onClick={() => {
                history.push('/sales/');
              }}
            >Sales
            </a> table at any time.
          </p>
        </div>
      </div>

      {actionbar}
    </div>
  );
};

SalesSubmissionConfirmationPage.defaultProps = {};

SalesSubmissionConfirmationPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
  details: PropTypes.shape({
    submissionID: PropTypes.string.isRequired,
    entries: PropTypes.arrayOf(PropTypes.object),
    validation_problems: PropTypes.arrayOf(PropTypes.any),
  }).isRequired,
};

export default SalesSubmissionConfirmationPage;
