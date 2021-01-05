import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

const Alert = (props) => {
  const {
    message, title, icon, classname, historyMessage,
  } = props;

  return (
    <div className={`${classname} status-alert`} role="alert">
      <span>
        <FontAwesomeIcon icon={icon} size="2x" />
      </span>
      <span>
        <b>
          STATUS: {title} &mdash;
        </b>
        {' '}{message}
        {historyMessage
        && (
        <>
          <br /> <br />
          <b>History - </b>
          {historyMessage}
        </>
        )}
      </span>
    </div>
  );
};

Alert.defaultProps = {
  title: '',
  classname: '',
  message: '',
  icon: 'exclamation-circle',
  historyMessage: '',

};
Alert.propTypes = {
  message: PropTypes.string,
  title: PropTypes.string,
  classname: PropTypes.string,
  icon: PropTypes.string,
  historyMessage: PropTypes.string,
};
export default Alert;
