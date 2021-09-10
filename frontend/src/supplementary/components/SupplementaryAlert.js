import React from 'react';
import PropTypes from 'prop-types';
import Alert from '../../app/components/Alert';

const SupplementaryAlert = (props) => {
  const {
    status,
    date,
    user,
  } = props;

  let message = '';
  let title;
  let classname;
  const icon = 'exclamation-circle';

  switch (status) {
    case 'DRAFT':
      title = 'Draft';
      message = `saved, ${date} by ${user}.`;
      classname = 'alert-warning';
      break;

    case 'RECOMMENDED':
      title = 'Recommended';
      message = `recommended for reassessment, ${date} by ${user}.`;
      classname = 'alert-primary';
      break;

    case 'RETURNED':
      title = 'Returned';
      message = `Supplementary report returned ${date} by the Government of B.C.`;
      classname = 'alert-primary';
      break;

    case 'SUBMITTED':
      title = 'Submitted';
      classname = 'alert-warning';
      message = `Supplementary report signed and submitted ${date} by ${user}. Pending analyst review and Director reassessment.`;
      break;

    default:
      title = '';
  }

  return (
    <Alert title={title} icon={icon} classname={classname} message={message} />
  );
};

SupplementaryAlert.defaultProps = {};

SupplementaryAlert.propTypes = {
  date: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};

export default SupplementaryAlert;
