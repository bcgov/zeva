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
  const statusFilter = (status) => history
    .filter((each) => each.status === status)
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
    case 'SUBMITTED':
      if (user.organization.id === debitFrom.id) {
        title = 'Submitted to Transfer Partner';
        message = ` submitted ${date} by ${userName}, awaiting ${creditTo.name} acceptance.`;
        classname = 'alert-warning'; // bceid initiator
      } else {
        title = 'Submitted by Transfer Partner';
        message = `submitted ${date} by ${debitFrom.name}, awaiting your signing authority acceptance.`;
        classname = 'alert-danger'; // bceid receiver
      }
      break;
    case 'RESCIND_PRE_APPROVAL':
      title = 'Rescinded';
      message = `rescinded ${date} by ${statusOrg}`;
      classname = 'alert-danger';
      break;

    case 'APPROVED':
      title = 'Submitted to Government';
      if (user.isGovernment) {
        classname = 'alert-warning';
        if (sufficientCredits) {
          message = `submitted to the Government of B.C. ${date}, awaiting government analyst review and recommendation to the Director.`;
        } else {
          classname = 'alert-danger';
          title = 'Error';
          message = `${debitFrom.name} has insufficient credits to fulfil (NUMBER OF PENDING) pending transfer(s).`;
        }
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
    case 'RESCINDED':
      title = 'Rescinded';
      message = `rescinded ${date} by ${statusOrg}`;
      classname = 'alert-danger';
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
      break;

    default:
      title = '';
  }
  if (errorMessage && user.isGovernment) {
    title = 'Error';
    message = errorMessage;
    classname = 'alert-danger';
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
};
export default CreditTransfersAlert;
