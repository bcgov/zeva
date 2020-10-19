import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

const Alert = (props) => {
  const {
    alertType, date, optionalMessage, optionalClassname, invalidSubmission,
  } = props;
  let title;
  let icon = 'exclamation-circle';
  let classname;
  let message = 'ZEV credits cannot be issued until validated by government.';
  let historyMessage;
  if (alertType === 'vehicle') {
    const { user, status } = props;
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
        message = `submitted to government ${date} by ${user}, awaiting validation by government. ${message}`;
        title = 'Submitted';
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
  }
  if (alertType === 'credit') {
    const { isGovernment, submission, icbcDate } = props;
    const {
      validationStatus, history, unselected, filename,
    } = submission;
    const statusFilter = (status) => history.filter((each) => each.validationStatus === status)[0];
    // later we might put in a flag to check if submission has gone back and forth between
    // analyst and director and have a new alert type
    const excelUploadMessage = `Excel template ${filename} uploaded and auto-saved, ${moment(statusFilter('DRAFT').createTimestamp).format('MMM D, YYYY')} by ${statusFilter('DRAFT').createUser.displayName}`;
    switch (validationStatus) {
      case 'DRAFT':
        if (invalidSubmission) {
          title = 'Errors found';
          classname = 'alert-danger';
          message = `You cannot submit this application. ${unselected} records are not eligible for credits. Delete this application, correct the errors and re-upload the Excel file.`;
          break;
        }
        title = 'Draft';
        message = `${excelUploadMessage}, awaiting submission to government. `;
        classname = 'alert-warning';
        break;
      case 'SUBMITTED':
        message = `Application submitted to government ${moment(statusFilter('SUBMITTED').createTimestamp).format('MMM D, YYYY')}, by ${statusFilter('SUBMITTED').createUser.displayName}. Awaiting review by government.`;
        title = 'Submitted';
        if (isGovernment) {
          classname = 'alert-warning';
        } else {
          classname = 'alert-primary';
          historyMessage = `${excelUploadMessage}. `;
        }
        break;
      case 'VALIDATED':
        title = 'Issued';
        classname = 'alert-success';
        icon = 'check-circle';
        if (isGovernment) {
          message = `Credits issued ${moment(statusFilter('VALIDATED').createTimestamp).format('MMM D, YYYY')} by ${statusFilter('VALIDATED').createUser.displayName}.`;
        } else {
          message = `Credits issued ${moment(statusFilter('VALIDATED').createTimestamp).format('MMM D, YYYY')} by government.`;
          historyMessage = `${excelUploadMessage}. Application submitted to government ${moment(statusFilter('SUBMITTED').createTimestamp).format('MMM D, YYYY')} by ${statusFilter('SUBMITTED').createUser.displayName}`;
        }
        break;
      case 'RECOMMEND_APPROVAL':
        if (isGovernment) {
          title = 'Recommended';
          message = `Application reviewed and recommended to Director ${moment(statusFilter('RECOMMEND_APPROVAL').createTimestamp).format('MMM D, YYYY')} by ${statusFilter('RECOMMEND_APPROVAL').createUser.displayName}.  ICBC data used was current to ${icbcDate}.`;
          classname = 'alert-warning';
        }
        break;
      case 'CHECKED':
        title = 'Validated';
        message = `Sales checked against ICBC registration data ${moment(statusFilter('CHECKED').createTimestamp).format('MMM D, YYYY')} by ${statusFilter('CHECKED').createUser.displayName}. ICBC data used was current to ${icbcDate}.`;
        classname = 'alert-warning';
        break;
      default:
        title = '';
        message = optionalMessage;
        classname = optionalClassname;
    }
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
  date: '',
  user: '',
  status: '',
  optionalClassname: '',
  optionalMessage: '',
  alertType: '',
  icbcDate: '',
  invalidSubmission: false,
  submission: {
    history: [{
      createUser: { displayName: '' },
      createTimestamp: '',
      validationStatus: '',
    }],
  },
  isGovernment: false,
};
Alert.propTypes = {
  date: PropTypes.string,
  user: PropTypes.string,
  status: PropTypes.string,
  optionalClassname: PropTypes.string,
  optionalMessage: PropTypes.string,
  alertType: PropTypes.string,
  submission: PropTypes.shape(),
  icbcDate: PropTypes.string,
  invalidSubmission: PropTypes.bool,
  isGovernment: PropTypes.bool,
};
export default Alert;
