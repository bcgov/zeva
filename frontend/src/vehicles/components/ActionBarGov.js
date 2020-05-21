import PropTypes from 'prop-types';
import React from 'react';

const ActionBarGov = (props) => {
  const { handleSubmit, vehicles } = props;
  const getOptions = (inputObj, displayField) => {
    let uniqueArr = [...new Set(inputObj.map((eachVehicle) => {
      if (typeof eachVehicle[displayField] === 'string') {
        return eachVehicle[displayField];
      }

      return eachVehicle[displayField].name;
    }))];

    if (displayField === 'make') {
      uniqueArr = uniqueArr.sort();
    }

    return uniqueArr.map((each) => (
      <option key={each}>{each}</option>
    ));
  };

  return (
    <div className="action-bar">
      <span className="left-content" />
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

ActionBarGov.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default ActionBarGov;
