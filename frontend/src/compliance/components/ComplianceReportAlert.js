import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Alert from '../../app/components/Alert';

const ComplianceReportAlert = (props) => {
  const {
    report,
    type,
  } = props;

  const {
    history, validationStatus,
  } = report;

  let message = '';
  let title;
  let classname;
  const icon = 'exclamation-circle';

  const statusFilter = (transferStatus) => history
    .filter((each) => each.validationStatus === transferStatus)
    .reverse()[0];
  const date = moment(statusFilter(validationStatus).createTimestamp).format('MMM D, YYYY');
  const userName = statusFilter(validationStatus).createUser.displayName;

  switch (validationStatus) {
    case 'DRAFT':
      title = 'Draft';
      message = `${type} confirmed ${date} by ${userName}. Model Year Report pending submission to Government of B.C.`;
      classname = 'alert-warning';
      break;

    default:
      title = '';
  }

  return (
    <Alert title={title} icon={icon} classname={classname} message={message} />
  );
};

ComplianceReportAlert.defaultProps = {
};

ComplianceReportAlert.propTypes = {
  report: PropTypes.shape().isRequired,
  type: PropTypes.string.isRequired,
};

export default ComplianceReportAlert;
