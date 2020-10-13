import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

const Alert = (props) => {
  const {
    alertType, date, optionalMessage, optionalClassname, invalidSubmission,
  } = props;
  let title;
  let icon = 'exclamation-circle';
  let classname;
  let message = 'Sales credits cannot be issued until validated by government.';
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
      validationStatus, createUser, submissionDate, updateUser, unselected,
    } = submission;
    switch (validationStatus) {
      case 'DRAFT':
        if (invalidSubmission) {
          title = 'Errors found';
          classname = 'alert-danger';
          message = `You cannot submit this application. ${unselected} records are not eligible for credits. Delete this application, correct the errors and re-upload the Excel file.`;
          break;
        }
        title = 'Draft';
        message = `saved ${date} by ${createUser.displayName}, awaiting submission to government.`;
        classname = 'alert-warning';
        break;
      case 'SUBMITTED':
        message = `Application submitted to government ${date}, by ${createUser.displayName}. Awaiting review by government.`;
        title = 'Submitted';
        // add history when ready History - Excel template [insertname.ecl] uploaded Oct. 31st 2020, by Toni Carmaker.
        if (isGovernment) {
          classname = 'alert-warning';
        } else {
          classname = 'alert-primary';
        }
        break;
      case 'VALIDATED':
        title = 'Issued';
        classname = 'alert-success';
        icon = 'check-circle';
        if (isGovernment) {
          message = `Credits issued ${date} by ${updateUser.displayName}.`;
        } else {
          message = `Credits issued ${date} by government.`
          // add history when ready History - Excel template [insertname.ecl] uploaded Oct. 31st 2020, by Toni Carmaker. Application submitted to government Oct. 31st 2020, by Toni Carmaker.
        }
        break;
      case 'RECOMMEND_APPROVAL':
        if (isGovernment) {
          title = 'Recommended';
          message = `Application reviewed and recommended to Director ${date} by ${updateUser.displayName}. ICBC data used was current to ${icbcDate}.`;
          classname = 'alert-warning';
        }
        break;
      case 'CHECKED':
        title = 'Validated';
        message = `Sales checked against ICBC registration data ${date} by ${updateUser.displayName}. ICBC data used was current to ${icbcDate}.`;
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
  submission: undefined,
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
