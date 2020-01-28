import React from 'react';
import PropTypes from 'prop-types';

const VehicleFormDropdown = (props) => {
  const {
    dropdownData,
    dropdownName,
    handleInputChange,
    fieldName,
    accessor,
  } = props;
  const selectionList = dropdownData.map((obj) => (
    <option key={accessor(obj)} value={accessor(obj)}>{obj.name || obj.description}</option>
  ));
  return (
    <div className="form-group row">
      <label
        className="col-sm-2 col-form-label"
        htmlFor={dropdownName}
      >
        {dropdownName}
      </label>
      <div className="col-sm-10">
        <select
          className="form-control"
          id={dropdownName}
          name={fieldName}
          onChange={handleInputChange}
        >
          <option selected value>--</option>
          {selectionList}
        </select>
      </div>
    </div>
  );
};

VehicleFormDropdown.defaultProps = {
  accessor: (obj) => obj.id,
};

VehicleFormDropdown.propTypes = {
  dropdownData: PropTypes.arrayOf(PropTypes.shape({
    description: PropTypes.string,
    id: PropTypes.any,
    name: PropTypes.string,
  })).isRequired,
  dropdownName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  accessor: PropTypes.func,
};
export default VehicleFormDropdown;
