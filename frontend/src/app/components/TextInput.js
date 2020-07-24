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
    labelSize,
    inputSize,
    rowSize,
    showCurrency,
  } = props;

  let type;
  if (!num) {
    type = 'text';
  } else {
    type = 'number';
  }

  const [validationErrors, setValidationErrors] = useState('');
  const [rowClass, setRowClass] = useState(rowSize);

  const handleOnBlur = (event) => {
    const { value } = event.target;
    if (value === '' && mandatory === true) {
      setValidationErrors(`${label} cannot be left blank`);
      setRowClass(`${rowSize} error`);
    }

    if (value !== '' || !mandatory) {
      setValidationErrors('');
      setRowClass(rowSize);
    }
    if (num && maxnum && value > maxnum) {
      setValidationErrors(`Cannot be greater than ${maxnum}`);
      setRowClass(`${rowSize} error`);
    }
  };

  return (
    <div className={rowClass}>
      <label
        className={labelSize}
        htmlFor={id}
      >
        {label}
      </label>
      <div className={inputSize}>
        {details && (<small className="form-text text-muted">{details}</small>) }
        <div className={showCurrency ? 'has-currency' : ''}>
          {showCurrency && (
          <span className="currency-symbol">
            <span>
              $
            </span>
          </span>
          )}
          <input
            data-testid="input-test"
            className="form-control"
            id={id}
            name={name}
            type={type}
            value={defaultValue}
            onChange={handleInputChange}
            onBlur={handleOnBlur}
          />
        </div>
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
  labelSize: 'col-sm-4 col-form-label',
  inputSize: 'col-sm-8',
  rowSize: 'form-group row',
  showCurrency: false,
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
  labelSize: PropTypes.string,
  inputSize: PropTypes.string,
  rowSize: PropTypes.string,
  showCurrency: PropTypes.bool,
};

export default TextInput;
