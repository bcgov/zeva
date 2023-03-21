import React from 'react'
import PropTypes from 'prop-types'

const FormDropdown = (props) => {
  const {
    dropdownData,
    dropdownName,
    handleInputChange,
    fieldName,
    accessor,
    selectedOption,
    labelClassname,
    inputClassname,
    rowClassname
  } = props

  const selectionList = dropdownData.map((obj) => (
    <option key={accessor(obj)} value={accessor(obj)}>
      {obj.name || obj.description || obj.modelYear}
    </option>
  ))
  return (
    <div className={rowClassname}>
      <label className={labelClassname} htmlFor={dropdownName}>
        {dropdownName}
      </label>
      <div className={inputClassname}>
        <select
          className="form-control"
          id={dropdownName}
          name={fieldName}
          onChange={handleInputChange}
          value={selectedOption}
        >
          {selectedOption === '--' && <option disabled>--</option>}
          {selectionList}
        </select>
      </div>
    </div>
  )
}

FormDropdown.defaultProps = {
  accessor: (obj) => obj.id,
  labelClassname: 'col-sm-3 col-form-label',
  inputClassname: 'col-sm-8',
  rowClassname: 'form-group row'
}

FormDropdown.propTypes = {
  accessor: PropTypes.func,
  dropdownData: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      id: PropTypes.any,
      name: PropTypes.string,
      modelYear: PropTypes.string
    })
  ).isRequired,
  dropdownName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  selectedOption: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  labelClassname: PropTypes.string,
  inputClassname: PropTypes.string,
  rowClassname: PropTypes.string
}
export default FormDropdown
