import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import ROUTES_CREDITS from '../../app/routes/Credits';
import ModelListTable from './ModelListTable';

const CreditRequestDetailsPage = (props) => {
  const {
    submission,
    user,
  } = props;

  return (
    <div id="credit-request-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>
            {submission.organization && `${submission.organization.name} `}
            ZEV Sales Submission {submission.submissionDate}
          </h1>
        </div>
      </div>

      <div className="row mt-1">
        <div className="col-sm-12">
          {'ICBC data current to: March 31, 2020 &mdash; '}
          <Link to={ROUTES_CREDITS.UPLOADVERIFICATION}>Update ICBC Data</Link>
        </div>
      </div>

      <div className="row mt-3">
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
              {user.isGovernment && submission.validationStatus === 'SUBMITTED' && (
                <button
                  className="button primary"
                  onClick={() => {
                    const url = ROUTES_CREDITS.SALES_SUBMISSION_DETAILS.replace(/:id/g, submission.id);

                    history.push(url);
                  }}
                  type="button"
                >
                  Validate
                </button>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="table">
            <ModelListTable
              items={submission.records}
              submission={submission}
              user={user}
            />
          </div>
        </div>
      </div>

      <div className="row mt-3">
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
              {user.isGovernment && submission.validationStatus === 'SUBMITTED' && (
                <button
                  className="button primary"
                  onClick={() => {
                    const url = ROUTES_CREDITS.SALES_SUBMISSION_DETAILS.replace(/:id/g, submission.id);

                    history.push(url);
                  }}
                  type="button"
                >
                  Validate
                </button>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

CreditRequestDetailsPage.defaultProps = {};

CreditRequestDetailsPage.propTypes = {
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditRequestDetailsPage;
