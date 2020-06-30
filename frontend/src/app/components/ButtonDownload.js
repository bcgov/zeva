import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const ButtonDownload = (props) => {
  const { action, buttonText } = props;
  return (
    <button className="button" type="button" onClick={action}>
      <FontAwesomeIcon className="button-icon" icon="download" /> {buttonText}
    </button>
  );
};

export default ButtonDownload;

ButtonDownload.defaultProps = {
  buttonText: 'Download',
};
ButtonDownload.propTypes = {
  action: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};
