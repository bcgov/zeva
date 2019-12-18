import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Balance = () => (
  <div className="dashboard-card">
    <div className="content">
      <h2>Optimus Autoworks</h2>
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

Balance.defaultProps = {
};

Balance.propTypes = {
};

export default Balance;
