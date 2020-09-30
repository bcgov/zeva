import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const Alert = (props) => {
  const { status, date, user, optionalMessage, optionalClassname } = props;
  let title;
  let icon = 'exclamation-circle';
  let classname;
  let message = 'Sales credits cannot be issued for this model until validated by government.';
  switch (status) {
    case 'CHANGES_REQUESTED':
      title = 'Changes Requested';
      message = `information or change requested by government ${date}, see comments. ${message}`;
      classname = 'alert-warning';
      break;
    case 'DRAFT':
      title = 'Draft';
      message = `saved ${date} by ${user}, awaiting submission to government. ${message}`;
      classname = 'alert-warning';
      break;
    case 'SUBMITTED':
      title = 'Submitted';
      message = `submitted to government ${date} by ${user}, awaiting validation by government. ${message}`;
      classname = 'alert-primary';
      break;
    case 'VALIDATED':
      title = 'Validated';
      message = `validated by government ${date}. Credits can be issued for eligible sales of this model`;
      classname = 'alert-success';
      icon = 'check-circle';
      break;
    case 'REJECTED':
      title = 'Rejected';
      message = `rejected by government ${date}. Credits cannot be issued for sales of this model.`;
      classname = 'alert-danger';
      break;
    default:
      title = '';
      message = optionalMessage;
      classname = optionalClassname;
  }

  return (
    <div className={`${classname} status-alert`} role="alert">
      <span>
        <FontAwesomeIcon icon={icon} size="2x" />
      </span>
      <span>
        <b>
          STATUS: {title} &mdash;
        </b>
        {message}
      </span>
    </div>
  );
};

Alert.defaultProps = {
  date: '',
  user: '',
  status: '',
  optionalClassname: '',
};
Alert.propTypes = {
  date: PropTypes.string,
  user: PropTypes.string,
  status: PropTypes.string,
  optionalClassname: PropTypes.string,
};
export default Alert;
