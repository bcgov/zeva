import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Alert from '../../app/components/Alert';

const VehicleAlert = (props) => {
  const {
    date, optionalMessage, optionalClassname, user, status,
  } = props;
  let message = optionalMessage;
  let title;
  let classname;
  let icon = 'exclamation-circle';
  switch (status) {
    case 'CHANGES_REQUESTED':
      title = 'Changes Requested';
      message = `information or change requested by Government of B.C. ${date}, see comments. ${message}`;
      classname = 'alert-warning';
      break;
    case 'DRAFT':
      title = 'Draft';
      message = `saved ${date} by ${user}, awaiting submission to Government of B.C. ${message}`;
      classname = 'alert-warning';
      break;
    case 'SUBMITTED':
      message = `submitted to Government of B.C. ${date} by ${user}, awaiting validation by Government of B.C. ${message}`;
      title = 'Submitted';
      classname = 'alert-primary';
      break;
    case 'VALIDATED':
      title = 'Validated';
      message = `validated by Government of B.C. ${date}. Credits can be issued for eligible sales of this model`;
      classname = 'alert-success';
      icon = 'check-circle';
      break;
    case 'REJECTED':
      title = 'Rejected';
      message = `rejected by Government of B.C. ${date}. Credits cannot be issued for sales of this model.`;
      classname = 'alert-danger';
      break;
    default:
      title = '';
      message = optionalMessage;
      classname = optionalClassname;
  }

  return (
    <>
      <Alert title={title} icon={icon} classname={classname} message={message} />
    </>
  );
};

VehicleAlert.defaultProps = {
  date: '',
  user: '',
  status: '',
  optionalClassname: '',
  optionalMessage: '',

};
VehicleAlert.propTypes = {
  date: PropTypes.string,
  user: PropTypes.string,
  status: PropTypes.string,
  optionalClassname: PropTypes.string,
  optionalMessage: PropTypes.string,
};
export default VehicleAlert;
