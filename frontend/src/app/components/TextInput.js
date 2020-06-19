import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TextInput = (props) => {
  const {
    defaultValue,
    errorMessage,
    handleInputChange,
    label,
    name,
    id,
    details,
    mandatory,
    num,
    maxnum,
  } = props;

  let type;
  if (!num) {
    type = 'text';
  } else {
    type = 'number';
  }

  const [validationErrors, setValidationErrors] = useState('');
  const [rowClass, setRowClass] = useState('form-group row');

  const handleOnBlur = (event) => {
    const { value } = event.target;
    if (value === '' && mandatory === true) {
      setValidationErrors(`${label} cannot be left blank`);
      setRowClass('form-group row error');
    }

    if (value !== '' || !mandatory) {
      setValidationErrors('');
      setRowClass('form-group row');
    }
    if (num && maxnum && value > maxnum) {
      setValidationErrors(`Cannot be greater than ${maxnum} kg`);
      setRowClass('form-group row error');
    }
  };

  return (
    <div className={rowClass}>
      <label
        className="col-sm-4 col-form-label"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="col-sm-8">
        {details && (<small className="form-text text-muted">{details}</small>) }
        <input
          className="form-control"
          id={id}
          name={name}
          type={type}
          defaultValue={defaultValue}
          onChange={handleInputChange}
          onBlur={handleOnBlur}
        />
        <small className="form-text text-danger">{errorMessage || validationErrors}</small>
      </div>
    </div>
  );
};

TextInput.defaultProps = {
  defaultValue: '',
  details: '',
  errorMessage: '',
  mandatory: false,
  num: false,
  maxnum: 0,
};

TextInput.propTypes = {
  defaultValue: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  details: PropTypes.string,
  errorMessage: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
  ]),
  handleInputChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  mandatory: PropTypes.bool,
  name: PropTypes.string.isRequired,
  num: PropTypes.bool,
  maxnum: PropTypes.number,
};

export default TextInput;
