import React from 'react'
import PropTypes from 'prop-types'

const SelectInput = ({
  className = 'form-control',
  disabled = false,
  handleChange,
  id,
  inputSize = 'col-sm-8',
  label,
  labelSize = 'col-sm-4 col-form-label',
  name,
  options,
  rowSize = 'form-group row',
  value
}) => {
  const optionElements = options.map((option) => {
    return <option key={option} value={option}>{option}</option>
  })

  return (
    <div className={rowSize}>
      <label className={labelSize} htmlFor={id}>
        {label}
      </label>
      <div className={inputSize}>
        <select
          className={className}
          disabled={disabled}
          name={name}
          onChange={handleChange}
          value={value}
        >
          {optionElements}
        </select>
      </div>
    </div>
  )
}

SelectInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  handleChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  labelSize: PropTypes.string,
  inputSize: PropTypes.string,
  rowSize: PropTypes.string,
  disabled: PropTypes.bool,
  options: PropTypes.array.isRequired
}

export default SelectInput
