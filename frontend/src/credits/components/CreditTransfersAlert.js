import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Alert from '../../app/components/Alert';

const CreditTransfersAlert = (props) => {
  const {
    errorMessage,
    user,
    submission,
  } = props;
  const {
    history, status, debitFrom, creditTo, sufficientCredits,
  } = submission;
  let message = '';
  let title;
  let classname;
  let icon = 'exclamation-circle';
  const statusFilter = (transferStatus) => history
    .filter((each) => each.status === transferStatus)
    .reverse()[0];
  const date = moment(statusFilter(status).createTimestamp).format('MMM D, YYYY');
  const statusOrg = statusFilter(status).createUser.organization.name;
  const userName = statusFilter(status).createUser.displayName;

  switch (status) {
    case 'DRAFT':
      title = 'Draft';
      message = `saved ${date} by ${userName}, awaiting submission to  ${creditTo.name} by your signing authority.`;
      classname = 'alert-warning';
      if (errorMessage) {
        title = 'Error';
        message = ' insufficient credits, you can only transfer credits available in your current balance.';
        classname = 'alert-danger';
      }
      break;
    case 'RESCINDED':
      title = 'Rescinded';
      message = `rescinded ${date} by ${statusOrg}`;
      classname = 'alert-danger';
      break;
    case 'RESCIND_PRE_APPROVAL':
      title = 'Rescinded';
      message = `rescinded ${date} by ${statusOrg}`;
      classname = 'alert-danger';
      break;
    case 'SUBMITTED':
      if (user.organization.id === debitFrom.id) { // bceid initiator
        title = 'Submitted to Transfer Partner';
        message = `submitted ${date} by ${userName}, awaiting ${creditTo.name} acceptance.`;
        classname = 'alert-warning';
      } else { // bceid receiver
        title = 'Submitted by Transfer Partner';
        message = `submitted ${date} by ${debitFrom.name}, awaiting your signing authority acceptance.`;
        classname = 'alert-danger';
      }
      break;

    case 'APPROVED':
      title = 'Submitted to Government';
      if (user.isGovernment) {
        classname = 'alert-warning';
        message = `submitted to the Government of B.C. ${date}, awaiting government analyst review and recommendation to the Director.`;
      } else {
        message = `submitted to the Government of B.C. ${date}, awaiting government review.`;
        classname = 'alert-primary';
      }

      break;
    case 'DISAPPROVED':
      title = 'Rejected';
      message = ` rejected ${date} by ${statusOrg}.`;
      classname = 'alert-danger';
      break;
    case 'REJECTED':
      title = 'Rejected';
      classname = 'alert-danger';
      if (user.isGovernment) {
        message = `rejected ${date} by the Director.`;
      } else {
        message = `rejected ${date} by the Government of B.C.`;
      }
      break;

    case 'RECOMMEND_APPROVAL':
      if (user.isGovernment) {
        title = 'Recommend Transfer';
        message = `recommended recording of transfer ${date} by ${userName}, awaiting Director action.`;
        classname = 'alert-primary';
      }
      break;
    case 'RECOMMEND_REJECTION':
      if (user.isGovernment) {
        title = 'Recommend Rejection';
        message = `recommended rejection of transfer ${date} by ${userName}, awaiting Director action.`;
        classname = 'alert-danger';
      }
      break;
    case 'RECORDED':
      icon = 'check-circle';
      classname = 'alert-success';
      if (user.isGovernment) {
        message = `recorded ${date} by the Director, credit balances have been adjusted.`;
      } else {
        message = `recorded ${date} by the Government of B.C, credit balances have been adjusted.`;
      }
      break;

    default:
      title = '';
  }

  return (
    <>
      <Alert title={title} icon={icon} classname={classname} message={message} />
    </>
  );
};

CreditTransfersAlert.defaultProps = {
};
CreditTransfersAlert.propTypes = {
  submission: PropTypes.shape().isRequired,
  user: PropTypes.shape().isRequired,
  errorMessage: PropTypes.string,
};
export default CreditTransfersAlert;
