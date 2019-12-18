import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Actions = () => (
  <div className="dashboard-fieldset">
    <h1>Actions</h1>

    <div className="content">
      <div className="value">
        3
      </div>

      <div className="text">
        <div>
          <button type="button">Credit transfer(s) in progress</button>
          <span className="divider">|</span>
          <button type="button">View all transactions</button>
        </div>

        <FontAwesomeIcon icon={['fas', 'play']} />
        <button type="button"> Start a new credit transfer proposal</button>
      </div>
    </div>

    <div className="content">
      <div className="value">
        1
      </div>

      <div className="text">
        <div>
          <button type="button">Compliance report(s) in progress</button>
          <span className="divider">|</span>
          <button type="button">View all reports</button>
        </div>

        <FontAwesomeIcon icon={['fas', 'play']} />
        <button type="button"> Start a new compliance report</button>
      </div>
    </div>

    <div className="content">
      <div className="value">
        <div className="icon">
          <FontAwesomeIcon icon="lock" className="icon-secure" />
          <FontAwesomeIcon icon="upload" className="icon-upload" />
        </div>
      </div>

      <div className="text">
        <div>
          <button
            type="button"
          >
            Submit/Upload a file for an Initiative Agreement
          </button>
        </div>

        <FontAwesomeIcon icon={['fas', 'play']} />
        <button type="button"> Initiative Agreement application information</button>
      </div>
    </div>

    <div className="content">
      <div className="text">
        <button type="button">
          Enter sales data
        </button>
      </div>
    </div>

    <div className="content">
      <div className="text">
        <button type="button">
          Manage ZEV model lineup
        </button>
      </div>
    </div>
  </div>
);

Actions.defaultProps = {
};

Actions.propTypes = {
};

export default Actions;
