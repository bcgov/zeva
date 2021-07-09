import PropTypes from 'prop-types';
import React from 'react';
import getOptions from '../../app/utilities/getOptions';
import handleFilterChange from '../../app/utilities/handleFilterChange';

const ActionBarGov = (props) => {
  const {
    vehicles, handleClear, filtered, setFiltered, showOrganization,
  } = props;

  const handleChange = (event) => {
    setFiltered(handleFilterChange(event, filtered));
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
          disabled={filtered.length === 0}
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
