import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const ButtonSave = (props) => {
  const { action, buttonText } = props;
  return (
    <button className="button primary" type="button" onClick={action}>
      <FontAwesomeIcon className="button-icon" icon="save" /> {buttonText}
    </button>
  );
};

export default ButtonSave;

ButtonSave.defaultProps = {
  buttonText: 'Save',
};
ButtonSave.propTypes = {
  action: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};
