import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import history from '../../app/History';

const ActionBarGov = (props) => {
  const { handleSubmit } = props;
  return (
    <div className="action-bar">
      <span className="left-content">
        <button className="button" type="button">
          <FontAwesomeIcon icon="arrow-left" /> Back
        </button>
      </span>
      <span className="right-content">
        <label htmlFor="supplier">Select a different model year/supplier</label>
        <select className="form-control" id="year">
          <option value="Optimus Autoworks">2017</option>
          <option value="Optimus Autoworks">2018</option>
          <option value="Optimus Autoworks">2019</option>
        </select>

        <select className="form-control" id="supplier">
          <option value="Optimus Autoworks">Optimus Autoworks</option>
          <option value="Optimus Autoworks">Nintendo</option>
          <option value="Optimus Autoworks">DK Racing</option>
        </select>
        <button
          className="button primary"
          onClick={handleSubmit}
          type="button"
        >
          Save
        </button>
      </span>
    </div>
  );
};
export default ActionBarGov;
