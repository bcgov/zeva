import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Balance = () => (
  <div className="dashboard-card">
    <h2>Optimus Autoworks</h2>
    <div>has a balance of</div>
    <div className="value">45,000</div>
    <div className="label">validated credits</div>

    <div>
      <a href="/">
        Credit Market Report
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
