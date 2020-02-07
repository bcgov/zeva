import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import history from '../../app/History';

const ActionBarNonGov = () => (
  <div className="action-bar">
    <span className="left-content" />
    <span className="right-content">
      <button
        className="button"
        type="button"
      >
        <FontAwesomeIcon icon="download" /> Download as Excel
      </button>

      <button
        className="button primary"
        onClick={() => {
          history.push('/vehicles/add');
        }}
        type="button"
      >
        <FontAwesomeIcon icon="plus" /> New Vehicle
      </button>
    </span>
  </div>
);
export default ActionBarNonGov;
