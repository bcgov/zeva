import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';

const Balance = (props) => {
  const { organization } = props;

  return (
    <div className="dashboard-card">
      <div className="content">
        <h2>{organization.name}</h2>
        has a balance of
        <div className="value">45,000</div>
        <div className="label">validated credits</div>
      </div>

      <div className="content">
        <a className="pdf-link" href="/" rel="noopener noreferrer" target="_blank">
          <span>Credit Market Report </span>
          <FontAwesomeIcon icon={['far', 'file-pdf']} />
        </a>
      </div>
    </div>
  );
};

Balance.defaultProps = {
};

Balance.propTypes = {
  organization: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
};

export default Balance;
