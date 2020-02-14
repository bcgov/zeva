import React from 'react';


const UserDetailsTextInput = (props) => {
  const { defaultValue, handleInputChange, label, id } = props;
  return (
    <div className="form-group row">
      <label
        className="col-sm-2 col-form-label"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="col-sm-10">
        <input
          className="form-control"
          id={id}
          name={id}
          type="text"
          defaultValue={defaultValue}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};
export default UserDetailsTextInput;
