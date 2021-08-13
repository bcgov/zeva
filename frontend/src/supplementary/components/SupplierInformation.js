import React from 'react';
import TextInput from '../../app/components/TextInput';

const SupplierInformation = (props) => {
  const { details, handleInputChange, newData, loading } = props;
  return (
    <>
      <div className="text-blue mb-4">
        Make the required updates in the fields next to the original submitted values and provide an explanation in the comment box at the bottom of this form.
      </div>
      <div className="my-4">
        <div className="d-inline-block col-sm-4">
          <label
            className=" text-blue font-weight-bold"
            htmlFor="serviceAddress"
          >
            Legal Name
          </label>
          <div className="w-75">
            {details.assessmentData && details.assessmentData.legalName}
          </div>
        </div>
        <div className="d-inline-block align-top mt-4 col-sm-5 p-0">
          <input
            className="form-control"
            id="legalName"
            name="supplierInfo"
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="my-4">
        <div className="d-inline-block col-sm-4">
          <label
            className="text-blue font-weight-bold"
            htmlFor="serviceAddress"
          >
            Service Address
          </label>
          <div className="w-75">
            {details.assessmentData && details.assessmentData.reportAddress  && details.assessmentData.reportAddress.map(
              (address) => address.addressType.addressType === 'Service' && (
              <div className="p-0" key={address.id}>
                {address.representativeName && (
                <div> {address.representativeName} </div>
                )}
                {address.addressLine1} {' '}
                {address.addressLine2} {' '}
                <br />
                {address.city}{' '} 
                {address.state}{' '}
                {address.country}{' '}
                {address.postalCode}
              </div>
              ),
            )}
          </div>
        </div>
        <textarea
          rows="4"
          className="form-control d-inline-block align-top mt-4 col-sm-5"
          id="serviceAddress"
          name="supplierInfo"
          value={newData.serviceAddress}
          onChange={handleInputChange}
          min="0"
        />
      </div>
      <div className="my-4">
        <div className="d-inline-block col-sm-4">
          <label
            className="text-blue font-weight-bold"
            htmlFor="recordsAddress"
          >
            Records Address
          </label>
          <div className="w-75">
            {details.assessmentData && details.assessmentData.reportAddress && details.assessmentData.reportAddress.map(
              (address) => address.addressType.addressType === 'Records' && (
              <div className="p-0" key={address.id}>
                {address.representativeName && (
                <div> {address.representativeName} </div>
                )}
                {address.addressLine1} {' '}
                {address.addressLine2} {' '}
                <br />
                {address.city}{' '}
                {address.state}{' '}
                {address.country}{' '}
                {address.postalCode}
              </div>
              ),
            )}
          </div>
        </div>
        <textarea
          rows="4"
          className="form-control d-inline-block align-top mt-4 col-sm-5"
          id="recordsAddress"
          name="supplierInfo"
          value={newData.recordsAddress}
          onChange={handleInputChange}
          min="0"
        />
      </div>
      <div className="my-4">
        <div className="d-inline-block col-sm-4">
          <label
            className="text-blue font-weight-bold"
            htmlFor="ldvMakes"
          >
            Light Duty Vehicle Makes
          </label>
          <div className="w-75">
            {details.assessmentData && details.assessmentData.makes && details.assessmentData.makes.map((make) => <div className="p-0" key={make}>{make}</div>)}
          </div>
        </div>
        <textarea
          className="form-control d-inline-block align-top mt-4 col-sm-5"
          id="ldvMakes"
          name="supplierInfo"
            // type={type}
          value={newData.ldvMakes}
          onChange={handleInputChange}
          min="0"
        />
      </div>
      <div className="my-4">
        <div className="d-inline-block col-sm-4">
          <label
            className="text-blue font-weight-bold"
            htmlFor="supplierClass"
          >
            Vehicle Supplier Class
          </label>
          <div className="w-75">
              {details.assessmentData && details.assessmentData.supplierClass}
          </div>
        </div>
        <input
          className="form-control d-inline-block align-top mt-4 col-sm-5"
          id="supplierClass"
          name="supplierInfo"
            // type={type}
          value={newData.supplierClass}
          onChange={handleInputChange}
          min="0"
        />
      </div>
    </>
  );
};

export default SupplierInformation;
