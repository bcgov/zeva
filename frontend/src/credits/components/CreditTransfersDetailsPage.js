import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import ReactTable from '../../app/components/ReactTable';
import CreditTransferSignoff from './CreditTransfersSignOff';
import Button from '../../app/components/Button';
import Modal from '../../app/components/Modal';
import CustomPropTypes from '../../app/utilities/props';
import getSupplierSummary from '../../app/utilities/getSupplierSummary';
import moment from 'moment-timezone';

const CreditTransfersDetailsPage = (props) => {
  const { submission, user, handleSubmit } = props;
  const [comment, setComment] = useState('');
  const [checkboxes, setCheckboxes] = useState({
    authority: false, accurate: false, consent: false,
  });
  const [allChecked, setAllChecked] = useState(false);
  const handleCheckboxClick = (event) => {
    const { checked } = event.target;
    setCheckboxes({ ...checkboxes, [event.target.id]: checked });
  };
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const initiatingSupplier = (user.organization.id === submission.debitFrom.id && submission.status === 'DRAFT');
  const tradePartner = (user.organization.id === submission.creditTo.id && submission.status === 'SUBMITTED');
  const governmentAnalyst = (user.hasPermission('RECOMMEND_CREDIT_TRANSFER') && user.isGovernment && submission.status === 'APPROVED');
  const governmentDirector = (user.hasPermission('SIGN_CREDIT_TRANSFERS') && user.isGovernment && (submission.status === 'RECOMMEND_APPROVAL' || submission.status === 'RECOMMEND_REJECTION'));

  useEffect(() => {
    if (checkboxes.authority && checkboxes.accurate && checkboxes.consent) {
      setAllChecked(true);
      setComment('');
    } else {
      setAllChecked(false);
    }
  });
  const supplierBalanceData = getSupplierSummary(submission);
  const supplierBalanceColumns = [{
    Header: 'Supplier',
    headerClassName: 'text-right',
    columns: [{
      id: 'supplier',
      accessor: (item) => (item.supplierLabel),
      className: 'text-right',
      width: 250,
    }],

  }, {
    Header: 'Current Balance',
    id: 'current-balance',
    headerClassName: 'font-weight-bold',
    className: 'text-center',
    columns: [{
      headerClassName: 'd-none',
      id: 'current-balance-a',
      accessor: (item) => (`${item.currentBalanceA}-A`),
      className: 'text-right',
      width: 125,
    },
    {
      headerClassName: 'd-none',
      id: 'current-balance-b',
      accessor: (item) => (`${item.currentBalanceB}-B`),
      className: 'text-right',
      width: 125,
    }],
  }, {
    Header: 'New Balance',
    headerClassName: 'font-weight-bold',
    id: 'new-balance',
    className: 'text-center',
    columns: [{
      headerClassName: 'd-none',
      id: 'new-balance-a',
      accessor: (item) => (`${item.newBalanceA}-A`),
      className: 'text-right',
      width: 125,
    },
    {
      headerClassName: 'd-none',
      id: 'new-balance-b',
      accessor: (item) => (`${item.newBalanceB}-B`),
      className: 'text-right',
      width: 125,
    }],
  }];

  const newBalanceTable = (
    <div className="row mb-4">
      <div className="col-sm-11">
        <div className="form p-2">
          <div className="my-2 px-2 pb-2">
            <div className="text-blue">
              Issuing this transfer will result in the following credit balance change to each supplier.
            </div>
            <ReactTable
              className="transfer-summary-table"
              columns={supplierBalanceColumns}
              data={supplierBalanceData}
              filterable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const submissionProposalColumns = [{
    Header: 'Quantity',
    accessor: (item) => (Math.ceil(item.creditValue)),
    id: 'credit-quantity',
    className: 'text-right',
  }, {
    Header: 'Model Year',
    accessor: (item) => (item.modelYear.name),
    id: 'model-year',
    className: 'text-center',
  }, {
    Header: 'ZEV Class',
    accessor: (item) => (item.creditClass.creditClass),
    id: 'zev-class',
    className: 'text-center',
  },
  {
    Header: 'Value Per Credit',
    accessor: (item) => (item.dollarValue),
    id: 'dollar-value',
    width: 150,
    className: 'text-right',
  }, {
    Header: 'Total',
    accessor: (item) => (`$${item.creditValue * item.dollarValue}`),
    id: 'total',
    className: 'text-right',
  },
  ];

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
        handleSubmit: () => { handleSubmit('REJECTED', comment); },
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

  const transferValue = (
    <div className="text-blue">
      for a total value of ${submission.creditTransferContent.reduce(
      (a, v) => a + v.dollarValue * v.creditValue, 0,
    )} Canadian dollars.
    </div>
  );
  const initiatingInformation = submission.history.find((each) => each.status === 'SUBMITTED');
  const transferPartnerInformation = submission.history.find((each) => each.status === 'APPROVED');


  const analystSignoff = (
    <div>
      {transferValue}
      <div className="text-blue">
        Signed and submitted by {initiatingInformation.createUser.displayName} of {initiatingInformation.createUser.organization.name} {moment(initiatingInformation.createTimestamp).tz('America/Vancouver').format('YYYY-MM-DD hh:mm:ss z')}
        <br />
        Signed and submitted by {transferPartnerInformation.createUser.displayName} of {transferPartnerInformation.createUser.organization.name} {moment(transferPartnerInformation.createTimestamp).tz('America/Vancouver').format('YYYY-MM-DD hh:mm:ss z')}
      </div>
      <label htmlFor="transfer-comment">comment to director</label>
      <textarea testid="transfer-comment-analyst" name="transfer-comment" className="col-sm-11" rows="3" onChange={(event) => { setComment(event.target.value); }} value={comment} />
    </div>
  );
  const tradePartnerSignoff = (
    <div>
      {transferValue}
      <h4>
        If you agree to this notice of transfer please confirm the following statements and click
        Submit Notice to send to the Government of B.C. Director for the transfer to be recorded.
      </h4>
      <CreditTransferSignoff handleCheckboxClick={handleCheckboxClick} user={user} />
      <label htmlFor="transfer-comment">
        <h4>
          If you don&apos;t agree to this transfer enter a comment below to
          {submission.debitFrom.name} and click Reject Notice
        </h4>
      </label>
      <textarea testid="transfer-comment" name="transfer-comment" className="col-sm-11" rows="3" onChange={(event) => { setComment(event.target.value); }} value={comment} disabled={allChecked} />
    </div>
  );

  const actionBar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <Button buttonType="back" locationRoute="/credit-transfers" />
            {tradePartner
            && (
            <Button
              testid="reject-transfer"
              buttonType="reject"
              optionalText="Reject Notice"
              optionalClassname="button text-danger"
              disabled={comment.length === 0 || allChecked}
              action={() => {
                setModalType('partner-reject');
                setShowModal(true);
              }}
            />
            )}
            {governmentAnalyst
            && (
            <Button
              testid="recommend-reject-transfer"
              buttonType="reject"
              optionalText="Recommend Rejection"
              optionalClassname="button text-danger"
              action={() => {
                setModalType('recommend-reject');
                setShowModal(true);
              }}
            />
            )}

          </span>
          <span className="right-content">
            { initiatingSupplier
           && (
           <Button
             testid="submit-transfer"
             buttonType="submit"
             action={() => {
               setModalType('initiating-submit');
               setShowModal(true);
             }}
             optionalText="Submit Notice"
             disabled={!checkboxes.authority || !checkboxes.accurate || !checkboxes.consent || comment.length > 0}
           />
           )}
            {governmentAnalyst
            && (
            <Button
              testid="recommend-approve-transfer"
              buttonType="approve"
              optionalText="Recommend transfer"
              optionalClassname="button primary"
              action={() => {
                setModalType('recommend-transfer');
                setShowModal(true);
              }}
            />
            )}
            {tradePartner
            && (
            <Button
              testid="submit-transfer"
              buttonType="submit"
              action={() => {
                setModalType('partner-accept');
                setShowModal(true);
              }}
              optionalText="Submit Notice"
              disabled={!checkboxes.authority || !checkboxes.accurate || !checkboxes.consent || comment.length > 0}
            />
            )}
          </span>

        </div>
      </div>
    </div>
  );
  return (
    <div id="credit-transfers-details" className="page">
      {modal}
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Light Duty Vehicle Credit Transfer</h2>
        </div>
      </div>
      {governmentAnalyst && newBalanceTable}
      <div className="row">
        <div className="col-sm-11">
          <div className="form p-2">
            {submission.debitFrom
               && (
               <div className="my-2 px-2 pb-2">
                 <h3 className="mt-2">
                   {submission.debitFrom.name} submits notice of the following proposed credit transfer
                 </h3>
                 <div className="text-blue">
                   {submission.debitFrom.name} will transfer to {submission.creditTo.name}:
                 </div>
                 <ReactTable
                   className="transfer-summary-table"
                   columns={submissionProposalColumns}
                   data={submission.creditTransferContent}
                 />
                 {tradePartner
                 && tradePartnerSignoff}
                 {governmentAnalyst
                 && analystSignoff}
                 {actionBar}
               </div>
               )}
          </div>
        </div>
      </div>
    </div>
  );
};

CreditTransfersDetailsPage.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
  submission: PropTypes.shape().isRequired,

};

export default CreditTransfersDetailsPage;
