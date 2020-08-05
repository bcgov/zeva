import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import history from '../../app/History';
import ROUTES_SALES from '../../app/routes/Sales';
import SalesSubmissionSignaturesModal from './SalesSubmissionSignaturesModal';
import SalesSubmissionContentTable from './SalesSubmissionContentTable';

import CustomPropTypes from '../../app/utilities/props';


const SalesSubmissionContentPage = (props) => {
  const {
    content,
    setShowModal,
    showModal,
    sign,
    submission,
    user,
  } = props;

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <button
              className="button"
              onClick={() => {
                history.push(ROUTES_SALES.LIST);
              }}
              type="button"
            >
              <FontAwesomeIcon icon="arrow-left" /> Back
            </button>
          </span>
          <span className="right-content">
            {submission.validationStatus === 'NEW' && (
            <button
              className="button primary"
              onClick={() => {
                setShowModal(true);
              }}
              type="button"
            >
              <FontAwesomeIcon icon="arrow-right" /> Proceed to Signature
            </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );

  const modal = (
    <SalesSubmissionSignaturesModal
      handleCancel={() => {
        setShowModal(false);
      }}
      handleSubmit={() => {
        sign(submission.id);
      }}
      showModal={showModal}
      user={user}
    />
  );

  return (
    <div id="sales-validate" className="page">

      <div className="row">
        <div className="col-sm-12">
          <h1>{user.organization.name} Sales Submission</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <SalesSubmissionContentTable data={content} />
        </div>
      </div>
      {actionbar}
      {modal}
    </div>
  );
};

SalesSubmissionContentPage.defaultProps = {};

SalesSubmissionContentPage.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setShowModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  sign: PropTypes.func.isRequired,
  submission: PropTypes.shape({
    id: PropTypes.number,
    validationStatus: PropTypes.string,
  }).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesSubmissionContentPage;
