import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import CustomPropTypes from '../../app/utilities/props';

const CreditTransferSignOff = (props) => {
  const {
    checkboxes, handleCheckboxClick, user, disableCheckboxes, hoverText,
  } = props;

  return (
    <div id="transfer-sign-off">
      <div>
        <ReactTooltip />
        <div className="d-inline-block align-middle my-2 ml-2 mr-1" data-tip={hoverText}>
          <input type="checkbox" id="authority" disabled={disableCheckboxes} checked={checkboxes.authority} onClick={(event) => { handleCheckboxClick(event); }} />
        </div>
        <label className="d-inline" htmlFor="authority" id="transfer-text">
          I confirm that I am an officer or employee of {user.organization.name},
          and that records evidencing my authority to submit this notice are available on request.
        </label>
      </div>
      <div>
        <div className="d-inline-block align-middle my-2 ml-2 mr-1" data-tip={hoverText}>
          <input type="checkbox" id="accurate" disabled={disableCheckboxes} checked={checkboxes.accurate} onClick={(event) => { handleCheckboxClick(event); }} />
        </div>
        <label className="d-inline" htmlFor="accurate" id="transfer-text">
          {user.organization.name} certifies that the information provided in this notice is accurate and complete
        </label>
      </div>
      <div>
        <div className="d-inline-block align-middle my-2 ml-2 mr-1" data-tip={hoverText}>
          <input type="checkbox" id="consent" disabled={disableCheckboxes} checked={checkboxes.consent} onClick={(event) => { handleCheckboxClick(event); }} />
        </div>
        <label className="d-inline" htmlFor="consent" id="transfer-text">
          {user.organization.name} consents to the transfer of credits in this notice
        </label>
      </div>
    </div>
  );
};

CreditTransferSignOff.defaultProps = {
  checkboxes: {},
  disableCheckboxes: false,
  hoverText: '',
};
CreditTransferSignOff.propTypes = {
  user: CustomPropTypes.user.isRequired,
  checkboxes: PropTypes.shape(),
  disableCheckboxes: PropTypes.bool,
  hoverText: PropTypes.string,
  handleCheckboxClick: PropTypes.func.isRequired,
};

export default CreditTransferSignOff;
