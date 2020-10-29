import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import ReactTable from '../../app/components/ReactTable';
import CreditTransferSignoff from './CreditTransfersSignOff';
import Button from '../../app/components/Button';
import Modal from '../../app/components/Modal';
import CustomPropTypes from '../../app/utilities/props';

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
  let modalProps = {};
  switch (modalType) {
    case 'submit':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => { handleSubmit('APPROVED'); },
        buttonClass: 'button primary',
        modalText: 'Submit transfer to government of B.C. Director?',
        icon: <FontAwesomeIcon icon="paper-plane" />,
      };
      break;
    case 'submit-partner':
      modalProps = {
        confirmLabel: ' Submit',
        handleSubmit: () => { handleSubmit('SUBMITTED'); },
        buttonClass: 'button primary',
        modalText: 'Submit credit transfer notice to trade partner?',
        icon: <FontAwesomeIcon icon="paper-plane" />,
      };
      break;
    case 'reject':
      modalProps = {
        confirmLabel: ' Reject',
        handleSubmit: () => { handleSubmit('REJECTED', comment); },
        buttonClass: 'btn-outline-danger',
        modalText: 'Reject notice?',
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

  useEffect(() => {
    if (checkboxes.authority && checkboxes.accurate && checkboxes.consent) {
      setAllChecked(true);
      setComment('');
    } else {
      setAllChecked(false);
    }
  });
  const columns = [{
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

  const actionBarNonTrade = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar" testid="action-bar-basic">
          <span className="left-content">
            <Button buttonType="back" locationRoute="/credit-transfers" />
          </span>
          <span className="right-content">
            {submission.status === 'DRAFT'
           && (
           <Button
             testid="submit-transfer"
             buttonType="submit"
             action={() => {
               setModalType('submit-partner');
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

  const actionbarTradePartner = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <Button buttonType="back" locationRoute="/credit-transfers" />
            <Button
              testid="reject-transfer"
              buttonType="reject"
              optionalText="Reject Notice"
              optionalClassname="button text-danger"
              disabled={comment.length === 0 || allChecked}
              action={() => {
                setModalType('reject');
                setShowModal(true);
              }}
            />
          </span>
          <span className="right-content">
            <Button
              testid="submit-transfer"
              buttonType="submit"
              action={() => {
                setModalType('submit');
                setShowModal(true);
              }}
              optionalText="Submit Notice"
              disabled={!checkboxes.authority || !checkboxes.accurate || !checkboxes.consent || comment.length > 0}
            />
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
                   columns={columns}
                   data={submission.creditTransferContent}
                 />
                 {user.organization.id === submission.debitFrom.id && submission.status === 'DRAFT'
                 && <CreditTransferSignoff handleCheckboxClick={handleCheckboxClick} user={user} />}
                 {(user.organization.id === submission.creditTo.id && submission.status === 'SUBMITTED')
                 && (
                 <div>
                   <div className="text-blue">
                     for a total value of ${submission.creditTransferContent.reduce((a, v) => a + v.dollarValue * v.creditValue, 0)} Canadian dollars.
                   </div>
                   <h4>
                     If you agree to this notice of transfer please confirm the following statements and click Submit Notice to send to the Government of B.C. Director for the transfer to be recorded.
                   </h4>
                   <CreditTransferSignoff handleCheckboxClick={handleCheckboxClick} user={user} />
                   <label htmlFor="transfer-comment">
                     <h4>
                       If you don&apos;t agree to this transfer enter a comment below to {submission.debitFrom.name} and click Reject Notice
                     </h4>
                   </label>
                   <textarea testid="transfer-comment" name="transfer-comment" className="col-sm-11" rows="3" onChange={(event) => { setComment(event.target.value); }} value={comment} disabled={allChecked} />
                 </div>
                 )}
                 {(user.organization.id === submission.creditTo.id && submission.status === 'SUBMITTED') ? actionbarTradePartner : actionBarNonTrade}
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
