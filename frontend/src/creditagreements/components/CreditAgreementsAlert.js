import React from 'react';
import PropTypes from 'prop-types';
import Alert from '../../app/components/Alert';

const CreditAgreementsAlert = (props) => {
  const {
    status,
    date,
    user,
    isGovernment
  } = props;

  let message = '';
  let title;
  let classname;
  let icon = 'exclamation-circle';


  switch (status) {
    case 'DRAFT':
      title = 'Draft';
      message = `saved, ${date} by ${user}.`;
      classname = 'alert-warning';
      break;

    case 'RECOMMENDED':
      title = 'Recommended';
      message = `${type} recommended to Director, ${date} by ${user}.`;
      classname = 'alert-warning';
      break;

    case 'ISSUED':
      title = 'Issued';
      classname = 'alert-success';
      icon = 'check-circle';
      if (isGovernment) {
        message = `IA-41 issued ${date} by the Director`;
      } else {
        message = `IA-41 issued ${date} by the Government of B.C.`;
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
};

CreditAgreementsAlert.propTypes = {
  date: PropTypes.string,
  user: PropTypes.string,
  status: PropTypes.string,
};

export default CreditAgreementsAlert;
