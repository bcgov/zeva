import React from 'react';
import PropTypes from 'prop-types';

const VehicleFormDropdown = (props) => {
  const { dropdownData, dropdownName } = props;
  const selectionList = dropdownData.map((obj) => (
    <option key={obj.id}>{obj.name || obj.description}</option>
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
        <select className="form-control" id={dropdownName}>
          {selectionList}
        </select>
      </div>
    </div>
  );
};

VehicleFormDropdown.defaultProps = {
};

VehicleFormDropdown.propTypes = {
  dropdownData: PropTypes.arrayOf(PropTypes.shape({
    description: PropTypes.string,
    id: PropTypes.any,
    name: PropTypes.string,
  })).isRequired,
  dropdownName: PropTypes.string.isRequired,
};
export default VehicleFormDropdown;
