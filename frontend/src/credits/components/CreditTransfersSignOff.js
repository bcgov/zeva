import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const CreditTransferSignOff = (props) => {
  const { handleCheckboxClick, user } = props;
  return (
    <div id="transfer-sign-off">
      <div>
        <div className="d-inline-block align-middle my-2 ml-2 mr-1">
          <input type="checkbox" id="authority" onClick={(event) => { handleCheckboxClick(event); }} />
        </div>
        <label className="d-inline" htmlFor="authority" id="transfer-text">
          I confirm that I am an officer or employee of {user.organization.name},
          and that records evidencing my authority to submit this notice are available on request.
        </label>
      </div>
      <div>
        <div className="d-inline-block align-middle my-2 ml-2 mr-1">
          <input type="checkbox" id="accurate" onClick={(event) => { handleCheckboxClick(event); }} />
        </div>
        <label className="d-inline" htmlFor="accurate" id="transfer-text">
          {user.organization.name} certifies that the information provided in this notice is accurate and complete
        </label>
      </div>
      <div>
        <div className="d-inline-block align-middle my-2 ml-2 mr-1">
          <input type="checkbox" id="consent" onClick={(event) => { handleCheckboxClick(event); }} />
        </div>
        <label className="d-inline" htmlFor="consent" id="transfer-text">
          {user.organization.name} consents to the transfer of credits in this notice
        </label>
      </div>
    </div>
  );
};

export default CreditTransferSignOff;
