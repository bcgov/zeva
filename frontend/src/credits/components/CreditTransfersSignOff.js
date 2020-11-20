import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import CustomPropTypes from '../../app/utilities/props';

const CreditTransferSignOff = (props) => {
  const {
    assertions,
    checkboxes,
    disableCheckboxes,
    handleCheckboxClick,
    hoverText,
    user,
  } = props;

  return (
    <div id="transfer-sign-off">
      <ReactTooltip />
      {assertions.map((assertion) => (
        <div key={assertion.id}>
          <div className="d-inline-block align-middle my-2 ml-2 mr-1" data-tip={hoverText}>
            <input
              checked={checkboxes.findIndex((checkbox) => (parseInt(checkbox, 10) === parseInt(assertion.id, 10))) >= 0}
              disabled={disableCheckboxes}
              id={assertion.id}
              name="terms"
              onClick={(event) => { handleCheckboxClick(event); }}
              type="checkbox"
            />
          </div>
          <label className="d-inline" htmlFor={assertion.id} id="transfer-text">
            {assertion.description.replace(/{user.organization.name}/g, user.organization.name)}
          </label>
        </div>
      ))}
    </div>
  );
};

CreditTransferSignOff.defaultProps = {
  checkboxes: [],
  disableCheckboxes: false,
  hoverText: '',
};
CreditTransferSignOff.propTypes = {
  user: CustomPropTypes.user.isRequired,
  checkboxes: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  disableCheckboxes: PropTypes.bool,
  hoverText: PropTypes.string,
  handleCheckboxClick: PropTypes.func.isRequired,
};

export default CreditTransferSignOff;
