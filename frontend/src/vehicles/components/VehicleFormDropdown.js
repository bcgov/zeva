import React from 'react';
import PropTypes from 'prop-types';

const VehicleFormDropdown = (props) => {
  const {
    accessor,
    className,
    dropdownData,
    dropdownName,
    fieldName,
    handleInputChange,
    selectedOption,
  } = props;

  const selectionList = dropdownData.map((obj) => (
    <option key={accessor(obj)} value={accessor(obj)}>{obj.name || obj.description}</option>
  ));
  return (
    <div className={`form-group row ${className}`}>
      <label
        className="col-sm-4 col-form-label"
        htmlFor={dropdownName}
      >
        {dropdownName}
      </label>
      <div className="col-sm-8">
        <select
          className="form-control"
          id={dropdownName}
          name={fieldName}
          onChange={handleInputChange}
          defaultValue={selectedOption}
        >
          {selectedOption === '--' && <option disabled>--</option>}
          {selectionList}
        </select>
      </div>
    </div>
  );
};

VehicleFormDropdown.defaultProps = {
  accessor: (obj) => obj.id,
  className: '',
};

VehicleFormDropdown.propTypes = {
  accessor: PropTypes.func,
  className: PropTypes.string,
  dropdownData: PropTypes.arrayOf(PropTypes.shape({
    description: PropTypes.string,
    id: PropTypes.any,
    name: PropTypes.string,
  })).isRequired,
  dropdownName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  selectedOption: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
};
export default VehicleFormDropdown;
