import PropTypes from 'prop-types';
import React, { useState } from 'react';
import moment from 'moment-timezone';
import Modal from '../../app/components/Modal';
import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import ROUTES_CREDITS from '../../app/routes/Credits';
import ModelListTable from './ModelListTable';
import ButtonBack from '../../app/components/ButtonBack';

const CreditRequestDetailsPage = (props) => {
  const {
    handleSubmit,
    submission,
    user,
    validatedOnly,
    previousDateCurrentTo,
    nonValidated,
  } = props;
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [comment, setComment] = useState('');
  let confirmLabel;
  let buttonClass;
  let modalText;
  let handle = () => {};
  if (modalType === 'approve') {
    confirmLabel = 'Recommend Issuance';
    handle = () => { handleSubmit('RECOMMEND_APPROVAL', comment); };
    buttonClass = 'button primary';
    modalText = 'Recommend issuance of credits?';
  } else if (modalType === 'return') {
    confirmLabel = 'Return to Analyst';
    handle = () => { handleSubmit('CHECKED', comment); };
    buttonClass = 'btn-outline-danger';
    modalText = 'Return submission to analyst?';
  } else {
    confirmLabel = 'Issue Credits';
    buttonClass = 'button primary';
    modalText = 'Issue credits to vehicle supplier?';
    handle = () => { handleSubmit('VALIDATED', ''); };
  }

  const modal = (
    <Modal
      confirmLabel={confirmLabel}
      handleCancel={() => { setShowModal(false); }}
      handleSubmit={handle}
      modalClass="w-75"
      showModal={showModal}
      confirmClass={buttonClass}
    >
      <div>
        <div><br /><br /></div>
        <h4 className="d-inline">{modalText}
        </h4>
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
      <div className="row">
        <div className="col-sm-12">
          <h1>
            {submission.organization && `${submission.organization.name} `}
            ZEV Sales Submission {submission.submissionDate}
          </h1>
        </div>
      </div>
      {analystAction
      && (
      <div className="row mt-1">
        <div className="col-sm-12">
          ICBC data current to: {previousDateCurrentTo}
        </div>
      </div>
      )}
      {(directorAction || analystAction)
      && (submission.salesSubmissionComment
      || submission.validationStatus === 'RECOMMEND_APPROVAL')
      && (
        <div className="row mt-1">
          <div className="col-sm-12">
            <div className="recommendation-comment">
              {submission.validationStatus === 'RECOMMEND_APPROVAL'
              && (
                <>
                  <h5 className="d-inline mr-2">
                    {submission.updateUser.displayName} recommended this submission be approved.
                  </h5>
                  <span>{nonValidated.length} VIN were rejected, see rejected vins.</span>
                </>
              )}
              {(['CHECKED', 'SUBMITTED'].indexOf(submission.validationStatus) >= 0) && submission.salesSubmissionComment
              && (
              <h5>
                {submission.updateUser.displayName} has returned this submission.
              </h5>
              )}
              {submission.salesSubmissionComment && (
                submission.salesSubmissionComment.map((each) => (
                  <div key={each.id}>
                    <h5 className="d-inline mr-2">
                      Comments from {each.createUser.displayName} {moment(each.createTimestamp).format('YYYY-MM-DD h[:]mm a')}:
                    </h5>
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
      <div className="row">
        <div className="col-sm-12">
          <div className="table">
            <ModelListTable
              items={submission.content}
              user={user}
              validatedOnly={validatedOnly}
              validationStatus={submission.validationStatus}
            />
          </div>
        </div>
      </div>
      {user.isGovernment
      && ((analystAction && validatedOnly) || directorAction)
      && (
        <div className="comment-area">
          <label htmlFor="comment">{analystAction ? 'Comment' : 'Comment to Analyst'}</label>
          <textarea name="comment" rows="4" onChange={(event) => { setComment(event.target.value); }} />
        </div>
      )}

      <div className="row mt-3">
        <div className="col-sm-12">
          <div className="action-bar">
            {analystAction && (
              <>
                <span className="left-content">
                  <ButtonBack />
                </span>
                <span className="right-content">
                  {validatedOnly
                      && (
                      <button
                        className="button"
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
                </span>
              </>
            )}
            {directorAction
              && (
                <>
                  <span className="left-content">
                    <ButtonBack />
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
                  </span>
                  <span className="right-content">
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
                  </span>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

CreditRequestDetailsPage.defaultProps = {
  validatedOnly: false,
};

CreditRequestDetailsPage.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  previousDateCurrentTo: PropTypes.string.isRequired,
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedOnly: PropTypes.bool,
  nonValidated: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default CreditRequestDetailsPage;
