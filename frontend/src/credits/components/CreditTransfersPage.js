import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Modal from '../../app/components/Modal';
import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import TransferFormRow from './TransferFormRow';
import FormDropdown from './FormDropdown';

const CreditTransfersPage = (props) => {
  const {
    user,
    organizations,
    handleInputChange,
    handleSubmit,
    years,
    handleSave,
    removeRow,
    addRow,
    handleRowInputChange,
    total,
    rows,
    fields,
  } = props;
  const [showModal, setShowModal] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    authority: false, accurate: false, consent: false,
  });
  const handleCheckboxClick = (event) => {
    const { checked } = event.target;
    setCheckboxes({ ...checkboxes, [event.target.id]: checked });
  };
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
        <h4 className="d-inline">Submit credit transfer notice to trade partner?
        </h4>
        <div><br /><br /></div>
      </div>
    </Modal>
  );
  const actionbar = (
    <div className="row">
      <div className="col-sm-12">
        <div className="action-bar">
          <span className="left-content">
            <button
              className="button"
              onClick={() => {
                history.push('/credit-transactions/transfers');
              }}
              type="button"
            >
              Back
            </button>
          </span>
          <span className="right-content">
            <button
              className="button"
              onClick={() => {
                handleSave();
              }}
              type="button"
            >
              Save
            </button>
            <button
              className="button primary ml-2"
              disabled={!checkboxes.authority || !checkboxes.accurate || !checkboxes.consent}
              onClick={() => {
                setShowModal(true);
              }}
              type="button"
            >
              <FontAwesomeIcon icon="paper-plane" />  Submit Notice
            </button>
          </span>
        </div>
      </div>
    </div>
  );
  return (
    <div id="credit-requests-list" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Light Duty Vehicle Credit Transfer</h1>
        </div>
      </div>
      <div id="form">
        <form onSubmit={handleSave}>
          <div className="row">
            <div className="col-sm-12">
              <fieldset>
                <h5>{user.organization.name} submits notice of the following proposed credit transfer:</h5>
                <div className="form-group">
                  <div className="d-inline-block align-middle mr-5">
                    <input type="radio" id="transfer-to" name="transferType" value="transfer to" onChange={handleInputChange} />
                    <label htmlFor="transfer-to">transfer to</label>
                    <br />
                    <input type="radio" id="transfer-from" name="transferType" value="receive from" onChange={handleInputChange} />
                    <label htmlFor="transfer-from">receive from</label>
                  </div>
                  <FormDropdown
                    accessor={(organization) => organization.id}
                    dropdownName="select transfer partner"
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
                <button type="button" className="transfer-add-line" onClick={() => { addRow(); }}>
                  <h5><FontAwesomeIcon icon="plus" /> Add another line</h5>
                </button>
                <span className="transfer-total">Total CAD: ${total}</span>
                <div>
                  <div className="d-inline-block align-middle my-2 mr-2">
                    <input type="checkbox" id="authority" onClick={(event) => { handleCheckboxClick(event); }} />
                  </div>
                  <label className="d-inline" htmlFor="transfer-authority" id="transfer-text">
                    I confirm that I am an officer or employee of {user.organization.name},
                    and that records evidencing my authority to submit this notice are available on request.
                  </label>
                </div>
                <div>
                  <div className="d-inline-block align-middle my-2 mr-2">
                    <input type="checkbox" id="accurate" onClick={(event) => { handleCheckboxClick(event); }} />
                  </div>
                  <label className="d-inline" htmlFor="transfer-accurate" id="transfer-text">
                    {user.organization.name} certifies that the information provided in this notice is accurate and complete
                  </label>
                </div>
                <div>
                  <div className="d-inline-block align-middle my-2 mr-2">
                    <input type="checkbox" id="consent" onClick={(event) => { handleCheckboxClick(event); }} />
                  </div>
                  <label className="d-inline" htmlFor="transfer-consent" id="transfer-text">
                    {user.organization.name} consents to the transfer of credits in this notice
                  </label>
                </div>
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

CreditTransfersPage.defaultProps = {};

CreditTransfersPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
  organizations: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  years: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleSave: PropTypes.func.isRequired,
  removeRow: PropTypes.func.isRequired,
  addRow: PropTypes.func.isRequired,
  handleRowInputChange: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default CreditTransfersPage;
