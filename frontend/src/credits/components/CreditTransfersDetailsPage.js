import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import ReactTable from '../../app/components/ReactTable';
import CreditTransferSignoff from './CreditTransfersSignOff';
import Button from '../../app/components/Button';
import Modal from '../../app/components/Modal';

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
    case 'reject':
      modalProps = {
        confirmLabel: ' Reject',
        handleSubmit: () => { handleSubmit('REJECTED', comment); },
        buttonClass: 'btn-outline-danger',
        modalText: 'Reject notice?',
      };
      break;
    default:
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
  }, {
    Header: 'Model Year',
    accessor: (item) => (item.modelYear.name),
    id: 'model-year',
  }, {
    Header: 'ZEV Class',
    accessor: (item) => (item.creditClass.creditClass),
    id: 'zev-class',
  },
  {
    Header: 'Value Per Credit',
    accessor: (item) => (item.dollarValue),
    id: 'dollar-value',
    width: 150,
  }, {
    Header: 'Total',
    accessor: (item) => (`$${item.creditValue * item.dollarValue}`),
    id: 'total',
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

  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <Button buttonType="back" locationRoute="/credit-transactions/transfers" />
            <Button
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
                 <div className="text-blue">
                   for a total value of ${submission.creditTransferContent.reduce((a, v) => a + v.dollarValue * v.creditValue, 0)} Canadian dollars.
                 </div>
                 <h4>
                   If you agree to this notice of transfer please confirm the following statements and click Submit Notice to send to the Government of B.C. Director for the transfer to be recorded.
                 </h4>
                 <CreditTransferSignoff handleCheckboxClick={handleCheckboxClick} user={user} />
                 <h4 className="my-2">
                   If you don&apos;t agree to this transfer enter a comment below to {submission.debitFrom.name} and click Reject Notice
                 </h4>
                 <textarea name="transfer-comment" className="col-sm-11" rows="3" onChange={(event) => { setComment(event.target.value); }} value={comment} disabled={allChecked} />
                 {actionbar}
               </div>
               )}
          </div>
        </div>
      </div>
    </div>
  );
};

CreditTransfersDetailsPage.defaultProps = {

};

CreditTransfersDetailsPage.propTypes = {

};

export default CreditTransfersDetailsPage;
