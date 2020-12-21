import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import Button from '../../app/components/Button';
import Modal from '../../app/components/Modal';
import CustomPropTypes from '../../app/utilities/props';
import TransferFormRow from './TransferFormRow';
import FormDropdown from './FormDropdown';
import CreditTransferSignoff from './CreditTransfersSignOff';
import Comment from '../../app/components/Comment';

const CreditTransfersForm = (props) => {
  const {
    errorMessage,
    addRow,
    assertions,
    checkboxes,
    fields,
    handleCheckboxClick,
    handleInputChange,
    handleRowInputChange,
    handleSave,
    handleSubmit,
    hoverText,
    organizations,
    removeRow,
    rows,
    total,
    unfilledRow,
    user,
    years,
    transferComments,
  } = props;
  const [showModal, setShowModal] = useState(false);
  const submitTooltip = 'You must acknowledge the three confirmation checkboxes prior to submitting this transfer.';
  const modal = (
    <Modal
      confirmLabel=" Submit Notice"
      handleCancel={() => { setShowModal(false); }}
      handleSubmit={() => { handleSubmit(); }}
      modalClass="w-75"
      showModal={showModal}
      confirmClass="button primary"
      icon={<FontAwesomeIcon icon="paper-plane" />}
    >
      <div>
        <div><br /><br /></div>
        <h3 className="d-inline">Submit credit transfer notice to trade partner?
        </h3>
        <div><br /><br /></div>
      </div>
    </Modal>
  );
  const alert = (
    <div
      className="alert alert-danger"
      id="alert-warning"
      role="alert"
    >
      <FontAwesomeIcon icon="exclamation-circle" size="lg" />
      &nbsp;<b>STATUS: Error &mdash; &nbsp;</b>
      Insufficient credits, you can only transfer credits available in your current balance
    </div>
  );
  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <Button buttonType="back" locationRoute="/credit-transfers" />
          </span>
          <span className="right-content">
            {user.hasPermission('CREATE_CREDIT_TRANSFERS') && (
            <Button
              disabled={unfilledRow || fields.transferPartner === ''}
              buttonType="save"
              action={() => {
                handleSave();
              }}
            />
            )}
            {user.hasPermission('SUBMIT_CREDIT_TRANSFER_PROPOSAL') && (
            <Button
              buttonType="submit"
              action={() => {
                setShowModal(true);
              }}
              optionalText="Submit Notice"
              buttonTooltip={submitTooltip}
              disabled={checkboxes.length < assertions.length}
            />
            )}
          </span>
        </div>
      </div>
    </div>
  );
  return (
    <div id="credit-requests-list" className="page">
      <ReactTooltip />
      <div className="row mt-3 mb-2">
        <div className="col-sm-12">
          <h2>Light Duty Vehicle Credit Transfer</h2>
          <div className="text-blue">
            Transfer notices can only be initiated by the seller of credits.
            To submit a notice of credit transfer there must be sufficient credits in your balance
          </div>
        </div>
        {transferComments.length > 0 
      && (
      <div className="ml-3">
        <Comment commentArray={transferComments} />
      </div>
      )}
      </div>
      {errorMessage && alert}
      <div id="form">
        <form onSubmit={handleSave}>
          <div className="row">
            <div className="col-sm-12">
              <fieldset>
                <h3>{user.organization.name} submits notice of the following proposed credit transfer:</h3>
                <div className="form-group">
                  <div className="d-inline-block align-middle mr-2">
                    <h4>{user.organization.name} will transfer credits to</h4>
                  </div>
                  <FormDropdown
                    accessor={(organization) => organization.id}
                    dropdownName=" (select transfer partner)"
                    dropdownData={organizations}
                    fieldName="transferPartner"
                    handleInputChange={handleInputChange}
                    selectedOption={fields.transferPartner || '--'}
                    labelClassname="mr-2 d-inline-block"
                    inputClassname="d-inline-block"
                    rowClassname="mr-5 d-inline-block align-middle"
                  />
                </div>
                {rows.map((item, index) => (<TransferFormRow years={years} key={index} rows={rows} rowId={index} handleRowInputChange={handleRowInputChange} removeRow={removeRow} />))}
                <button type="button" className="transfer-add-line my-2" onClick={() => { addRow(); }}>
                  <h4><FontAwesomeIcon icon="plus" /> Add another line</h4>
                </button>
                <span className="transfer-total">Total CAD: ${total.toFixed(2)}</span>
                <CreditTransferSignoff
                  assertions={assertions}
                  checkboxes={checkboxes}
                  disableCheckboxes={unfilledRow}
                  handleCheckboxClick={handleCheckboxClick}
                  hoverText={hoverText}
                  user={user}
                />
                {actionbar}
              </fieldset>
            </div>
            {modal}
          </div>
        </form>
      </div>
    </div>
  );
};

CreditTransfersForm.defaultProps = {
  assertions: [],
  checkboxes: [],
  unfilledRow: true,
  hoverText: '',
  transferComments: [{}],
  errorMessage: '',
};

CreditTransfersForm.propTypes = {
  addRow: PropTypes.func.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()),
  checkboxes: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  fields: PropTypes.shape().isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleRowInputChange: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  hoverText: PropTypes.string,
  organizations: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  removeRow: PropTypes.func.isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  total: PropTypes.number.isRequired,
  unfilledRow: PropTypes.bool,
  user: CustomPropTypes.user.isRequired,
  years: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  transferComments: PropTypes.arrayOf(PropTypes.shape()),
  errorMessage: PropTypes.string,
};

export default CreditTransfersForm;
