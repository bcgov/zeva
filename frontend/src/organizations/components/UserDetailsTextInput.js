import React, { useState } from 'react';


const UserDetailsTextInput = (props) => {
  const [validationErrors, setValidationErrors] = useState('');
  const [rowClass, setRowClass] = useState('form-group row');
  const {
    defaultValue,
    handleInputChange,
    label,
    id,
    details,
  } = props;
  const handleOnBlur = (event) => {
    const { value } = event.target;
    if (value === '') {
      setValidationErrors(`${label} cannot be left blank`);
      setRowClass('form-group row error');
    }
    if (value !== '') {
      setValidationErrors('');
      setRowClass('form-group row');
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
        <small className="form-text text-danger">{ validationErrors }</small>
        {details && (<small className="form-text text-muted">{details}</small>) }
        <input
          className="form-control"
          id={id}
          name={id}
          type="text"
          defaultValue={defaultValue}
          onChange={handleInputChange}
          onBlur={handleOnBlur}
        />
      </div>
    </div>
  );
};
export default UserDetailsTextInput;
