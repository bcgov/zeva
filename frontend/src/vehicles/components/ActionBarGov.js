import PropTypes from 'prop-types';
import React from 'react';

const ActionBarGov = (props) => {
  const {
    vehicles, handleClear, filtered, setFiltered,
  } = props;

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

  const handleChange = (event) => {
    const { id, value } = event.target;
    let newFiltered = [...filtered];
    newFiltered = newFiltered.filter((each) => (each.id !== id));
    setFiltered([...newFiltered, { id, value }]);
  };
  return (
    <div className="action-bar">
      <span className="left-content" />
      <span className="right-content">
        <label htmlFor="supplier">Select a different model year/supplier</label>
        <select className="form-control" id="col-my" onChange={handleChange}>
          <option value=""> </option>
          {getOptions(vehicles, 'modelYear')}
        </select>

        <select className="form-control" id="col-supplier" onChange={handleChange}>
          <option value=""> </option>
          {getOptions(vehicles, 'organization')}
        </select>
        <button
          className="button"
          onClick={handleClear}
          type="button"
        >
          Clear Filters
        </button>
      </span>
    </div>
  );
};

ActionBarGov.propTypes = {
  handleClear: PropTypes.func.isRequired,
  filtered: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFiltered: PropTypes.func.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default ActionBarGov;
