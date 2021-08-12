import React from 'react';
import TextInput from '../../app/components/TextInput';

const SupplierInformation = (props) => {
  const { details, handleInputChange, newData } = props;
  return (
    <>
      <div className="text-blue">
        Make the required updates in the fields next to the original submitted values and provide an explanation in the comment box at the bottom of this form.
      </div>
      <div>
        <TextInput
          label="Legal Name"
          id="legalName"
          name="legalName"
          defaultValue={newData.legalName}
          handleInputChange={(event) => {
            handleInputChange(event);
          }}
          labelSize="d-inline-block col-sm-3"
          inputSize="d-inline-block align-middle col-sm-5"
          rowSize=""
        />
      </div>
    </>
  );
};

export default SupplierInformation;
