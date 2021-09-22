import PropTypes from 'prop-types';
import React from 'react';

import CustomPropTypes from '../../app/utilities/props';

const SupplierInformation = (props) => {
  const {
    details,
    handleInputChange,
    newData,
    user,
  } = props;
  const { assessmentData } = details;
  const { supplierInfo } = newData;
  const currentStatus = details.actualStatus ? details.actualStatus : details.status;

  return (
    <>
      {!user.isGovernment
      && (
      <div className="text-blue mb-4">
        Make the required updates in the fields next to the original submitted values and provide an explanation in the comment box at the bottom of this form.
      </div>
      )}
      <div className="my-4">
        <div className="d-inline-block col-sm-4">
          <label
            className=" text-blue font-weight-bold"
            htmlFor="serviceAddress"
          >
            Legal Name
          </label>
          <div className="w-75">
            {assessmentData && assessmentData.legalName}
          </div>
        </div>
        <div className="d-inline-block align-top mt-4 col-sm-5 p-0">
          <input
            className="form-control"
            id="legalName"
            name="supplierInfo"
            onChange={handleInputChange}
            defaultValue={supplierInfo.legalName}
            readOnly={currentStatus === 'ASSESSED'}
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
            {assessmentData && assessmentData.reportAddress && assessmentData.reportAddress.map(
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
          className="form-control d-inline-block align-top mt-4 col-sm-5"
          defaultValue={supplierInfo.serviceAddress}
          id="serviceAddress"
          min="0"
          name="supplierInfo"
          onChange={handleInputChange}
          readOnly={currentStatus === 'ASSESSED'}
          rows="4"
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
            {assessmentData && assessmentData.reportAddress && assessmentData.reportAddress.map(
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
          className="form-control d-inline-block align-top mt-4 col-sm-5"
          defaultValue={supplierInfo.recordsAddress}
          id="recordsAddress"
          min="0"
          name="supplierInfo"
          onChange={handleInputChange}
          readOnly={currentStatus === 'ASSESSED'}
          rows="4"
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
            {assessmentData && assessmentData.makes
            && assessmentData.makes.map((make) => <div className="p-0" key={make}>{make}</div>)}
          </div>
        </div>
        <textarea
          className="form-control d-inline-block align-top mt-4 col-sm-5"
          defaultValue={supplierInfo.ldvMakes}
          id="ldvMakes"
          min="0"
          name="supplierInfo"
          onChange={handleInputChange}
          readOnly={currentStatus === 'ASSESSED'}
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
            {assessmentData && assessmentData.supplierClass}
          </div>
        </div>
        <input
          className="form-control d-inline-block align-top mt-4 col-sm-5"
          defaultValue={supplierInfo.supplierClass}
          id="supplierClass"
          min="0"
          name="supplierInfo"
          onChange={handleInputChange}
          readOnly={currentStatus === 'ASSESSED'}
        />
      </div>
    </>
  );
};

SupplierInformation.propTypes = {
  details: PropTypes.shape().isRequired,
  handleInputChange: PropTypes.func.isRequired,
  newData: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SupplierInformation;
