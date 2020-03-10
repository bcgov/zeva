import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import CustomPropTypes from '../../app/utilities/props';

// @todo format numeric all numbers

const SalesSubmissionSignaturesPage = (props) => {
  const {
    user, details, backToValidationPage, sign,
  } = props;

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
              Step 3 of 3
          </span>
          <span className="right-content">
            <button
              className="button"
              onClick={() => backToValidationPage()}
              type="button"
            >
              <FontAwesomeIcon icon="arrow-left" /> Previous Page
            </button>
            <button
              className="button primary"
              onClick={() => sign()}
              type="button"
            >
              <FontAwesomeIcon icon="signature" /> Sign and Submit
            </button>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div id="sales-sign" className="page">

      <div className="row">
        <div className="col-sm-12">
          <h1>{user.organization.name} Sales Submission {details.submissionID}</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <h2>Signing Authority Declaration</h2>
          <strong>I, {user.displayName}, senior Signing Officer, {user.organization.name}:</strong>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <fieldset>
            <div>
              <input type="checkbox" id="sd-1" />
              <label htmlFor="sd-1"> confirm that records
                evincing each matter
                reported under section 11.11 (2) of the Regulation
                are available on request.
              </label>
            </div>
            <div>
              <input type="checkbox" id="sd-2" />
              <label htmlFor="sd-2"> confirm that I am an
                officer or employee of
                the vehicle supplier, and that records evidencing my authority to
                submit this proposal are available on
                request.
              </label>
            </div>
            <div>
              <input type="checkbox" id="sd-3" />
              <label htmlFor="sd-3"> certify that the
                information in this report
                is true and complete to the best of my knowledge and I
                understand that the Director may require records
                evidencing the truth of that information
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      {actionbar}
    </div>
  );
};

SalesSubmissionSignaturesPage.defaultProps = {};

SalesSubmissionSignaturesPage.propTypes = {
  sign: PropTypes.func.isRequired,
  backToValidationPage: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
  details: PropTypes.shape({
    submissionID: PropTypes.string.isRequired,
    entries: PropTypes.arrayOf(PropTypes.object),
    validation_problems: PropTypes.arrayOf(PropTypes.any),
  }).isRequired,
};

export default SalesSubmissionSignaturesPage;
