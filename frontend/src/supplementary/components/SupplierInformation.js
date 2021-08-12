import React from 'react';
import TextInput from '../../app/components/TextInput';

const SupplierInformation = (props) => {
  const { details, handleInputChange, newData } = props;
  return (
    <>
      <div className="text-blue mb-4">
        Make the required updates in the fields next to the original submitted values and provide an explanation in the comment box at the bottom of this form.
      </div>
      <div className="my-4">
        <label
          className="d-inline-block col-sm-4 text-blue font-weight-bold"
          htmlFor="serviceAddress"
        >
          Legal Name
        </label>
        <div className="d-inline-block align-middle col-sm-5 p-0">
          <input
            className="form-control"
            id="legalName"
            name="legalName"
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="my-4">
        <label
          className="d-inline-block col-sm-4 text-blue font-weight-bold"
          htmlFor="serviceAddress"
        >
          Service Address
        </label>
        <textarea
          className="form-control d-inline-block align-middle col-sm-5"
          id="serviceAddress"
          name="serviceAddress"
            // type={type}
          value={newData.serviceAddress}
          onChange={handleInputChange}
          min="0"
        />
      </div>
      <div className="my-4">
        <label
          className="d-inline-block col-sm-4 text-blue font-weight-bold"
          htmlFor="recordsAddress"
        >
          Records Address
        </label>
        <textarea
          className="form-control d-inline-block align-middle col-sm-5"
          id="recordsAddress"
          name="recordsAddress"
            // type={type}
          value={newData.recordsAddress}
          onChange={handleInputChange}
          min="0"
        />
      </div>
      <div className="my-4">
        <label
          className="d-inline-block col-sm-4 text-blue font-weight-bold"
          htmlFor="lightDutyMakes"
        >
          Light Duty Vehicle Makes
        </label>
        <textarea
          className="form-control d-inline-block align-middle col-sm-5"
          id="lightDutyMakes"
          name="lightDutyMakes"
            // type={type}
          value={newData.lightDutyMakes}
          onChange={handleInputChange}
          min="0"
        />
      </div>
    </>
  );
};

export default SupplierInformation;
