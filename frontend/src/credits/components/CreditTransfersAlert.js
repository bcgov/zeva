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
  const { history, status, debitFrom, creditTo, } = submission;
  let message = '';
  let title;
  let classname;
  let icon = 'exclamation-circle';
  const statusFilter = (status) => history
    .filter((each) => each.status === status)
    .reverse()[0];

  const date = moment(statusFilter(status).createTimestamp).format('MMM D, YYYY')
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
        title = 'Submitted to Transfer Partner'
        message = ` submitted ${date} by ${userName}, awaiting ${creditTo.name} acceptance.`
        classname = 'alert-warning'; // bceid initiator
      } else {
        title = 'Submitted by Transfer Partner'
        message = `submitted ${date} by ${debitFrom.name}, awaiting your signing authority acceptance.`
        classname = 'alert-danger'; // bceid receiver
      }
      break;
    case 'RESCIND_PRE_APPROVAL':
      title = 'Rescinded';
      message = `rescinded ${date} by ${statusOrg}`;
      classname = 'alert-danger';
      break;

    case 'APPROVED':
      title = 'Submitted to Government'
      if (user.isGovernment) {
        message = `submitted to the Government of B.C. ${date}, awaiting government analyst review and recommendation to the Director.`;
        classname = 'alert-warning';
      } else {
        message = `submitted to the Government of B.C. ${date}, awaiting government review.`;
        classname = 'alert-primary';
      }

      break;
    case 'REJECTED':
      classname = 'alert-danger';
      break;
    case 'RESCINDED':
      title = 'Rescinded';
      message = `rescinded ${date} by ${statusOrg}`;
      classname = 'alert-danger';
      break;
    case 'RECOMMEND_TRANSFER':

      break;
    case 'RECOMMEND_REJECTION':
      classname = 'alert-danger';
      break;
    case 'RECORDED':
      icon = 'check-circle';
      classname = 'alert-success';
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
};
export default CreditTransfersAlert;
