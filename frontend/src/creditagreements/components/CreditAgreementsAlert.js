import React from 'react';
import PropTypes from 'prop-types';
import Alert from '../../app/components/Alert';

const CreditAgreementsAlert = (props) => {
  const {
    status,
    date,
    user,
    isGovernment,
    id,
    transactionType,
  } = props;

  let message = '';
  let title;
  let classname;
  let icon = 'exclamation-circle';
  let transaction = '';

  if (transactionType === 'Automatic Administrative Penalty') {
    transaction = 'AP';
  } else if (transactionType === 'Purchase Agreement') {
    transaction = 'PA';
  } else if (transactionType === 'Administrative Credit Allocation') {
    transaction = 'AA';
  } else if (transactionType === 'Administrative Credit Reduction') {
    transaction = 'AR';
  } else {
    transaction = 'IA';
  }


  switch (status) {
    case 'DRAFT':
      title = 'Draft';
      message = `saved, ${date} by ${user}.`;
      classname = 'alert-warning';
      break;

    case 'RECOMMENDED':
      title = 'Recommended';
      message = `recommended for issuance, ${date} by ${user}.`;
      classname = 'alert-primary';
      break;

    case 'ISSUED':
      title = 'Issued';
      classname = 'alert-success';
      icon = 'check-circle';
      if (isGovernment) {
        message = `${transaction}-${id} issued ${date} by the Director`;
      } else {
        message = `${transaction}-${id} issued ${date} by the Government of B.C.`;
      }
      break;

    default:
      title = '';
  }

  return (
    <Alert title={title} icon={icon} classname={classname} message={message} />
  );
};

CreditAgreementsAlert.defaultProps = {
  isGovernment: false,
};

CreditAgreementsAlert.propTypes = {
  date: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  transactionType: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isGovernment: PropTypes.bool,
};

export default CreditAgreementsAlert;
