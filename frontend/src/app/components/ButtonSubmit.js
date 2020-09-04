import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const ButtonSubmit = (props) => {
  const { action, buttonText } = props;
  return (
    <button
      className="button primary"
      onClick={action}
      type="button"
    >
      <FontAwesomeIcon icon="arrow-right" /> {buttonText}
    </button>
  );
};

export default ButtonSubmit;

ButtonSubmit.defaultProps = {
  buttonText: 'Submit',
};
ButtonSubmit.propTypes = {
  action: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};
