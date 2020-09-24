import PropTypes from 'prop-types';
import React from 'react';

const ActionBarGov = (props) => {
  const {
    vehicles, handleClear, filtered, setFiltered, showOrganization,
  } = props;

  const getOptions = (inputObj, displayField) => {
    const uniqueArr = [...new Set(inputObj.map((eachVehicle) => {
      if (typeof eachVehicle[displayField] === 'string') {
        return eachVehicle[displayField];
      }

      return eachVehicle[displayField].shortName || eachVehicle[displayField].name;
    }))];

    return uniqueArr.sort().map((each) => (
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
    <div className="action-bar no-bg p-0 m-0 justify-content-end">
      <span className="right-content d-block d-md-flex d-lg-flex d-xl-flex">
        <label className="my-0" htmlFor="supplier">Select a different model year/supplier</label>
        <select
          className="form-control"
          id="col-my"
          onChange={handleChange}
          value={filtered.length > 0 && filtered.findIndex((arr) => (arr.id === 'col-my')) >= 0 ? filtered[filtered.findIndex((arr) => (arr.id === 'col-my'))].value : ''}
        >
          <option value=""> </option>
          {getOptions(vehicles, 'modelYear')}
        </select>

        {showOrganization && (
        <select
          className="form-control"
          id="col-supplier"
          onChange={handleChange}
          value={filtered.length > 0 && filtered.findIndex((arr) => (arr.id === 'col-supplier')) >= 0 ? filtered[filtered.findIndex((arr) => (arr.id === 'col-supplier'))].value : ''}
        >
          <option value=""> </option>
          {getOptions(vehicles, 'organization')}
        </select>
        )}
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

ActionBarGov.defaultProps = {
  showOrganization: true,
};

ActionBarGov.propTypes = {
  handleClear: PropTypes.func.isRequired,
  filtered: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFiltered: PropTypes.func.isRequired,
  showOrganization: PropTypes.bool,
  vehicles: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default ActionBarGov;
