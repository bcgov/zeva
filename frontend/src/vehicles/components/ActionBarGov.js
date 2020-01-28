import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import history from '../../app/History';

const ActionBarGov = (props) => {
  const { handleSubmit, vehicles } = props;
  const getOptions = (inputObj, displayField) => {
    const uniqueArr = [...new Set(inputObj.map((eachVehicle) => (
      eachVehicle[displayField].name
    )))];
    return uniqueArr.map((each) => (
      <option key={each}>{each}</option>
    ));
  };

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
          {getOptions(vehicles, 'modelYear')}
        </select>

        <select className="form-control" id="supplier">
          {getOptions(vehicles, 'make')}
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
