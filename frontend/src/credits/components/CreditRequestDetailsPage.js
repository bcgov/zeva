import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import moment from 'moment-timezone';

import ButtonDelete from '../../app/components/ButtonDelete';
import ButtonSubmit from '../../app/components/ButtonSubmit';
import Modal from '../../app/components/Modal';
import history from '../../app/History';
import ROUTES_CREDITS from '../../app/routes/Credits';
import ROUTES_SALES from '../../app/routes/Sales';
import download from '../../app/utilities/download';
import CustomPropTypes from '../../app/utilities/props';
import ModelListTable from './ModelListTable';

const CreditRequestDetailsPage = (props) => {
  const {
    handleSubmit,
    locationState,
    previousDateCurrentTo,
    submission,
    user,
    validatedOnly,
  } = props;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [comment, setComment] = useState('');

  const serviceAddress = user.organization.organizationAddress.find((address) => address.addressType.addressType === 'Service');
  const recordsAddress = user.organization.organizationAddress.find((address) => address.addressType.addressType === 'Records');

  let modalProps = {};
  switch (modalType) {
    case 'submit':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => { handleSubmit('SUBMITTED'); },
        buttonClass: 'button primary',
        modalText: 'Submit credit request to government?',
        icon: <FontAwesomeIcon icon="paper-plane" />,
      };
      break;
    case 'delete':
      modalProps = {
        confirmLabel: ' Delete',
        handleSubmit: () => { handleSubmit('DELETED'); },
        buttonClass: 'btn-outline-danger',
        modalText: 'Delete submission? WARNING: this action cannot be undone',
        icon: <FontAwesomeIcon icon="trash" />,
      };
      break;
    case 'approve':
      modalProps = {
        confirmLabel: 'Recommend Issuance',
        handleSubmit: () => { handleSubmit('RECOMMEND_APPROVAL', comment); },
        buttonClass: 'button primary',
        modalText: 'Recommend issuance of credits?',
      };
      break;
    case 'return':
      modalProps = {
        confirmLabel: 'Return to Analyst',
        handleSubmit: () => { handleSubmit('CHECKED', comment); },
        buttonClass: 'btn-outline-danger',
        modalText: 'Return submission to analyst?',
      };
      break;
    default:
      modalProps = {
        confirmLabel: 'Issue Credits',
        buttonClass: 'button primary',
        modalText: 'Issue credits to vehicle supplier?',
        handleSubmit: () => { handleSubmit('VALIDATED', ''); },
      };
  }

  const modal = (
    <Modal
      confirmLabel={modalProps.confirmLabel}
      handleCancel={() => { setShowModal(false); }}
      handleSubmit={modalProps.handleSubmit}
      modalClass="w-75"
      showModal={showModal}
      confirmClass={modalProps.buttonClass}
    >
      <div>
        <div><br /><br /></div>
        <h3 className="d-inline">{modalProps.modalText}
        </h3>
        <div><br />{comment && (
        <p>Comment: {comment}</p>
        )}<br />
        </div>
      </div>
    </Modal>
  );
  const directorAction = user.isGovernment
  && ['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION'].indexOf(submission.validationStatus) >= 0
  && user.hasPermission('SIGN_SALES');
  const analystAction = user.isGovernment
  && ['CHECKED', 'SUBMITTED'].indexOf(submission.validationStatus) >= 0
  && user.hasPermission('RECOMMEND_SALES');

  return (
    <div id="credit-request-details" className="page">
      {modal}
      <div className="row my-3">
        <div className="col-sm-12">
          <h2>Application for Credits for Consumer Sales</h2>
          <h3 className="mt-2">
            {submission.organization && `${submission.organization.name} `}
            ZEV Sales Submission {submission.submissionDate}
          </h3>
        </div>
      </div>
      {analystAction
      && (
      <div className="row mb-2">
        <div className="col-sm-12">
          ICBC data current to: {previousDateCurrentTo}
        </div>
      </div>
      )}
      {((
        (directorAction || analystAction) && submission.validationStatus === 'RECOMMEND_APPROVAL'
      ) || (user.isGovernment && ['SUBMITTES', 'CHECKED', 'VALIDATED'].indexOf(submission.validationStatus) >= 0))
      && submission.salesSubmissionComment && (
        <div className="row mb-2">
          <div className="col-sm-12">
            <div className="recommendation-comment p-2 m-0">
              {submission.validationStatus === 'RECOMMEND_APPROVAL'
              && (
                <h4 className="d-inline mr-2">
                  {submission.updateUser.displayName} recommended this submission be approved.
                </h4>
              )}
              {(['CHECKED', 'SUBMITTED'].indexOf(submission.validationStatus) >= 0) && submission.salesSubmissionComment
              && (
              <h4>
                {submission.updateUser.displayName} has returned this submission.
              </h4>
              )}
              {submission.salesSubmissionComment && (
                submission.salesSubmissionComment.map((each) => (
                  <div key={each.id}>
                    <h4 className="d-inline mr-2">
                      Comments from {each.createUser.displayName} {moment(each.createTimestamp).format('YYYY-MM-DD h[:]mm a')}:
                    </h4>
                    <span>
                      {each.comment}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {!user.isGovernment && (
        <div className="row mb-3">
          <div className="col-sm-12">
            <h4 className="d-inline-block sales-upload-grey">Service address: </h4>
            {serviceAddress && <h4 className="d-inline-block sales-upload-blue">{serviceAddress.addressLine1} {serviceAddress.city} {serviceAddress.state} {serviceAddress.postalCode}</h4>}
            <br />
            <h4 className="d-inline-block sales-upload-grey">Records address: </h4>
            {recordsAddress && <h4 className="d-inline-block sales-upload-blue">{recordsAddress.addressLine1} {recordsAddress.city} {recordsAddress.state} {recordsAddress.postalCode}</h4>}
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-sm-12">
          <ModelListTable
            items={submission.content}
            user={user}
            validatedOnly={validatedOnly}
            validationStatus={submission.validationStatus}
          />
        </div>
      </div>
      {user.isGovernment
      && ((analystAction && validatedOnly) || directorAction)
      && (
        <div className="comment-area">
          <label htmlFor="comment">{analystAction ? 'Comment' : 'Comment to analyst if returning submission'}</label>
          <textarea name="comment" rows="4" onChange={(event) => { setComment(event.target.value); }} />
        </div>
      )}

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  console.error(history);
                  history.push(ROUTES_CREDITS.CREDIT_REQUESTS, locationState);
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> Back
              </button>
              {submission.validationStatus === 'DRAFT' && (
                <ButtonDelete action={() => { setModalType('delete'); setShowModal(true); }} />
              )}
              {directorAction && (
                <button
                  className="button text-danger"
                  onClick={() => {
                    setModalType('return');
                    setShowModal(true);
                  }}
                  type="button"
                >
                  Return to Analyst
                </button>
              )}
            </span>
            <span className="right-content">
              {analystAction && (
                <>
                  <button
                    className={validatedOnly ? 'button' : 'button primary'}
                    onClick={() => {
                      const url = ROUTES_CREDITS.SALES_SUBMISSION_DETAILS.replace(/:id/g, submission.id);

                      history.push(url);
                    }}
                    type="button"
                  >
                    {validatedOnly ? 'Re-validate' : 'Validate'}
                  </button>
                  {validatedOnly && (
                  <button
                    className={validatedOnly ? 'button primary' : 'button'}
                    key="recommend-approval"
                    onClick={() => {
                      setModalType('approve');
                      setShowModal(true);
                    }}
                    type="button"
                  >
                    Recommend Issuance
                  </button>
                  )}
                </>
              )}
              {directorAction && (
                <button
                  className="button primary"
                  disabled={comment.length > 0}
                  onClick={() => {
                    setModalType('issue');
                    setShowModal(true);
                  }}
                  type="button"
                >
                  Issue Credits
                </button>
              )}

              {!user.isGovernment && (
                <>
                  {submission.validationStatus === 'VALIDATED' && submission.unselected > 0 && (
                    <button
                      className="button primary"
                      onClick={(e) => {
                        const element = e.target;
                        const original = element.innerHTML;

                        element.firstChild.textContent = ' Downloading...';

                        return download(ROUTES_SALES.DOWNLOAD_ERRORS.replace(':id', submission.id), {}).then(() => {
                          element.innerHTML = original;
                        });
                      }}
                      type="button"
                    >
                      <FontAwesomeIcon icon="download" /> Download Errors
                    </button>
                  )}
                  {submission.validationStatus === 'DRAFT' && (
                    <ButtonSubmit action={() => { setModalType('submit'); setShowModal(true); }} />
                  )}
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

CreditRequestDetailsPage.defaultProps = {
  locationState: undefined,
  validatedOnly: false,
};

CreditRequestDetailsPage.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
  previousDateCurrentTo: PropTypes.string.isRequired,
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedOnly: PropTypes.bool,
};

export default CreditRequestDetailsPage;
