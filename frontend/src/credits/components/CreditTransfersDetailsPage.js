import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import CreditTransferSignoff from './CreditTransfersSignOff';
import CreditTransfersDetailsActionBar
  from './CreditTransfersDetailsActionBar';
import Modal from '../../app/components/Modal';
import CustomPropTypes from '../../app/utilities/props';
import CreditTransfersDetailsTable from './CreditTransfersDetailsTable';
import CreditTransfersDetailsSupplierTable from './CreditTransfersDetailsSupplierTable';
import Comment from '../../app/components/Comment';

const CreditTransfersDetailsPage = (props) => {
  const {
    assertions,
    checkboxes,
    handleCheckboxClick,
    handleSubmit,
    sufficientCredit,
    submission,
    user,
  } = props;
  const [comment, setComment] = useState('');
  const [allChecked, setAllChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const transferRole = {
    rescindable: (user.organization.id === submission.debitFrom.id
      && ['SUBMITTED', 'APPROVED', 'RECOMMEND_REJECTION', 'RECOMMEND_APPROVAL'].indexOf(submission.status) >= 0)
      || (user.organization.id === submission.creditTo.id && ['APPROVED', 'RECOMMEND_REJECTION', 'RECOMMEND_APPROVAL'].indexOf(submission.status) >= 0),
    initiatingSupplier: user.organization.id === submission.debitFrom.id && ['DRAFT', 'RESCINDED'].indexOf(submission.status) >= 0,
    tradePartner: user.organization.id === submission.creditTo.id && submission.status === 'SUBMITTED',
    governmentAnalyst: user.hasPermission('RECOMMEND_CREDIT_TRANSFER')
      && user.isGovernment && submission.status === 'APPROVED',
    governmentDirector: user.hasPermission('SIGN_CREDIT_TRANSFERS') && user.isGovernment
      && (submission.status === 'RECOMMEND_APPROVAL' || submission.status === 'RECOMMEND_REJECTION'),
  };

  useEffect(() => {
    if (checkboxes.length >= assertions.length) {
      setAllChecked(true);
      setComment('');
    } else {
      setAllChecked(false);
    }
  });

  let modalProps = {};
  switch (modalType) {
    case 'initiating-submit':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => { handleSubmit('SUBMITTED'); },
        buttonClass: 'button primary',
        modalText: 'Submit credit transfer notice to trade partner?',
        icon: <FontAwesomeIcon icon="paper-plane" />,
      };
      break;

    case 'partner-reject':
      modalProps = {
        confirmLabel: ' Reject',
        handleSubmit: () => { handleSubmit('DISAPPROVED', comment); },
        buttonClass: 'btn-outline-danger',
        modalText: 'Reject notice?',
      };
      break;
    case 'partner-accept':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => { handleSubmit('APPROVED'); },
        buttonClass: 'button primary',
        modalText: 'Submit transfer to government of B.C. Director?',
        icon: <FontAwesomeIcon icon="paper-plane" />,
      };
      break;
    case 'rescind':
      modalProps = {
        confirmLabel: ' Rescind',
        handleSubmit: () => { handleSubmit('RESCINDED', comment); },
        buttonClass: 'button primary',
        modalText: 'Rescind notice?',
      };
      break;
    case 'recommend-reject':
      modalProps = {
        confirmLabel: ' Recommend Rejection',
        handleSubmit: () => { handleSubmit('RECOMMEND_REJECTION', comment); },
        buttonClass: 'btn-outline-danger',
        modalText: 'Recommend the Director reject the transfer?',
      };
      break;
    case 'recommend-transfer':
      modalProps = {
        confirmLabel: ' Recommend Transfer',
        handleSubmit: () => { handleSubmit('RECOMMEND_APPROVAL', comment); },
        buttonClass: 'button primary',
        modalText: 'Recommend the Director record the Transfer?',
      };
      break;
    case 'director-record':
      modalProps = {
        confirmLabel: ' Record Transfer',
        handleSubmit: () => { handleSubmit('VALIDATED', comment); },
        buttonClass: 'button primary',
        modalText: 'Record the transfer?',
      };
      break;
    case 'director-reject':
      modalProps = {
        confirmLabel: ' Reject Transfer',
        handleSubmit: () => { handleSubmit('REJECTED', comment); },
        buttonClass: 'btn-outline-danger',
        modalText: 'Reject the transfer?',
      };
      break;
    default:
      modalProps = {
        confirmLabel: '',
        handleSubmit: () => {},
        buttonClass: '',
        modalText: '',
      };
      break;
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

  const rescindComment = (
    <>
      <label htmlFor="transfer-rescind-comment">
        <h4>
          If you need to rescind this transfer notice
          please enter a reason to your transfer partner.
        </h4>
      </label>
      <textarea name="transfer-rescind-comment" className="col-sm-11" rows="3" onChange={(event) => { setComment(event.target.value); }} value={comment} />
    </>
  );
  const transferValue = (
    <div className="text-blue">
      for a total value of ${submission.creditTransferContent.reduce(
      (a, v) => a + v.dollarValue * v.creditValue, 0,
    )} Canadian dollars.
    </div>
  );

  let latestRescind = false;
  let latestSubmit = false;
  let latestApprove = false;
  let showSubmissionConfirmation = true;
  let showApproveConfirmation = true;
  submission.history.forEach((history) => {
    if (history.status === 'RESCINDED') {
      latestRescind = history;
    }
    if (history.status === 'SUBMITTED') {
      latestSubmit = history;
    }
    if (history.status === 'APPROVED') {
      latestApprove = history;
    }
  });
  if (latestRescind && latestSubmit) {
    if (latestRescind.createTimestamp > latestSubmit.createTimestamp) {
      showSubmissionConfirmation = false;
      showApproveConfirmation = false;
    }
    if (latestApprove) {
      if (latestSubmit.createTimestamp > latestApprove.createTimestamp) {
        showApproveConfirmation = false;
      }
    }
  }
  if (!latestApprove) {
    showApproveConfirmation = false;
  }

  const signedSubmittedInfo = (
    <>
      {showSubmissionConfirmation
      && (
      <>
        <div className="text-blue mb-0" data-testid="submit-signature">
          Signed and submitted by {latestSubmit.createUser.displayName} of&nbsp;
          {latestSubmit.createUser.organization.name}&nbsp;
          {moment(latestSubmit.createTimestamp).tz('America/Vancouver').format('YYYY-MM-DD hh:mm:ss z')}
        </div>
        {showApproveConfirmation && (
          <div className="text-blue mt-0" data-testid="approve-signature">
            Signed and submitted by {latestApprove.createUser.displayName} of&nbsp;
            {latestApprove.createUser.organization.name}&nbsp;
            {moment(latestApprove.createTimestamp).tz('America/Vancouver').format('YYYY-MM-DD hh:mm:ss z')}
          </div>
        )}
      </>
      )}
    </>
  );
  const analystSignoff = (
    <div>
      {signedSubmittedInfo}
      <label htmlFor="transfer-comment">comment to director</label>
      <textarea testid="transfer-comment-analyst" name="transfer-comment" className="col-sm-11" rows="3" onChange={(event) => { setComment(event.target.value); }} value={comment} />
    </div>
  );
  const tradePartnerSignoff = (
    <div>
      <h4>
        If you agree to this notice of transfer please confirm the following statements and click
        Submit Notice to send to the Government of B.C. Director for the transfer to be recorded.
      </h4>
      <CreditTransferSignoff
        assertions={assertions}
        checkboxes={checkboxes}
        handleCheckboxClick={handleCheckboxClick}
        user={user}
      />
      <label htmlFor="transfer-comment">
        <h4>
          If you don&apos;t agree to this transfer enter a comment below to
          &nbsp;{submission.debitFrom.name} and click Reject Notice
        </h4>
      </label>
      <textarea testid="transfer-comment" name="transfer-comment" className="col-sm-11" rows="3" onChange={(event) => { setComment(event.target.value); }} value={comment} disabled={allChecked} />
    </div>
  );

  return (
    <div id="credit-transfers-details" className="page">
      {modal}
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Light Duty Vehicle Credit Transfer</h2>
        </div>
        {transferRole.governmentDirector && submission.creditTransferComment
      && (
      <div className="ml-3">
        <Comment commentArray={submission.creditTransferComment} />
      </div>
      )}
      </div>
      {transferRole.governmentAnalyst && !sufficientCredit
      && (
        <div
          className="alert alert-danger"
          id="alert-warning"
          role="alert"
        >
          <FontAwesomeIcon icon="exclamation-circle" size="lg" />
          &nbsp;<b>WARNING:&nbsp;</b> Supplier has insufficient credits to fulfill all pending transfers.
        </div>
      )}
      {transferRole.governmentAnalyst
      && (
      <CreditTransfersDetailsSupplierTable submission={submission} tableType="supplierBalance" />
      )}
      <div className="row">
        <div className="col-sm-11">
          <div className="form p-2">
            {submission.debitFrom
            && (
              <div className="my-2 px-2 pb-2">
                <CreditTransfersDetailsTable submission={submission} tableType="submissionSummary" />
                {transferValue}
                {transferRole.tradePartner
                && tradePartnerSignoff}
                {transferRole.rescindable
                && (
                <>
                  {signedSubmittedInfo}
                  {rescindComment}
                </>
                )}
                {transferRole.governmentAnalyst
                && analystSignoff}
                <CreditTransfersDetailsActionBar
                  allChecked={allChecked}
                  assertions={assertions}
                  checkboxes={checkboxes}
                  comment={comment}
                  transferRole={transferRole}
                  setModalType={setModalType}
                  setShowModal={setShowModal}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

CreditTransfersDetailsPage.propTypes = {
  assertions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  checkboxes: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])).isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  sufficientCredit: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
  submission: PropTypes.shape().isRequired,
};

export default CreditTransfersDetailsPage;
