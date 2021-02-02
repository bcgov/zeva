import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Alert from '../../app/components/Alert';

const ComplianceReportAlert = (props) => {
  const {
    report,
  } = props;

  const {
    history, status,
  } = report;

  let message = '';
  let title;
  let classname;
  const icon = 'exclamation-circle';

  const statusFilter = (transferStatus) => history
    .filter((each) => each.status === transferStatus)
    .reverse()[0];
  const date = moment(statusFilter(status).createTimestamp).format('MMM D, YYYY');
  const userName = statusFilter(status).createUser.displayName;

  switch (status) {
    case 'DRAFT':
      title = 'Draft';
      message = ` confirmed ${date} by ${userName}. Compliance report awaiting submission to Government of B.C.`;
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
};

export default ComplianceReportAlert;
