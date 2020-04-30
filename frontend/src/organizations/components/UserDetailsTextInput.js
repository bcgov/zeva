import React, { useState } from 'react';


const UserDetailsTextInput = (props) => {
  const [validationErrors, setValidationErrors] = useState('');
  const [rowClass, setRowClass] = useState('form-group row');
  const {
    defaultValue,
    handleInputChange,
    label,
    name,
    id,
    details,
    mandatory,
  } = props;


  const handleOnBlur = (event) => {
    const { value, name } = event.target;
    if (value === '' && mandatory === true) {
      setValidationErrors(`${name} cannot be left blank`);
      setRowClass('form-group row error');
    }
    if (value !== '' || !mandatory) {
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
        {details && (<small className="form-text text-muted">{details}</small>) }
        <input
          className="form-control"
          id={id}
          name={name}
          type="text"
          defaultValue={defaultValue}
          onChange={handleInputChange}
          onBlur={handleOnBlur}
        />
        <small className="form-text text-danger">{ validationErrors }</small>
      </div>
    </div>
  );
};
export default UserDetailsTextInput;
