import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const ButtonDelete = (props) => {
  const { action, buttonText } = props;
  return (
    <button className="button text-danger" type="button" onClick={action}>
      <FontAwesomeIcon className="button-icon" icon="trash" /> {buttonText}
    </button>
  );
};

export default ButtonDelete;

ButtonDelete.defaultProps = {
  buttonText: 'Delete',
};
ButtonDelete.propTypes = {
  action: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};
