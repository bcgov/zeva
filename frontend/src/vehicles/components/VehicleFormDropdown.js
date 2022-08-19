import React from 'react';
import PropTypes from 'prop-types';

const VehicleFormDropdown = (props) => {
  const {
    accessor,
    className,
    dropdownData,
    dropdownName,
    errorMessage,
    fieldName,
    handleInputChange,
    selectedOption
  } = props;

  const selectionList = dropdownData.map((obj) => (
    <option key={accessor(obj)} value={accessor(obj)}>
      {obj.name || obj.description}
    </option>
  ));
  return (
    <div className={`form-group row ${className}`}>
      <label className="col-sm-4 col-form-label" htmlFor={dropdownName}>
        {dropdownName}
      </label>
      <div className="col-sm-8">
        <select
          className="form-control"
          id={dropdownName}
          name={fieldName}
          onChange={handleInputChange}
          value={selectedOption}
        >
          {selectedOption === '--' && (
            <option value="--" disabled>
              --
            </option>
          )}
          {selectionList}
        </select>
        <small className="form-text text-danger">{errorMessage}</small>
      </div>
    </div>
  );
};

VehicleFormDropdown.defaultProps = {
  accessor: (obj) => obj.id,
  className: '',
  errorMessage: ''
};

VehicleFormDropdown.propTypes = {
  accessor: PropTypes.func,
  className: PropTypes.string,
  dropdownData: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string
    })
  ).isRequired,
  dropdownName: PropTypes.string.isRequired,
  errorMessage: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  fieldName: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  selectedOption: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired
};
export default VehicleFormDropdown;
