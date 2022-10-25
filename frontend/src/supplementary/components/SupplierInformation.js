import PropTypes from 'prop-types';
import React from 'react';

import CustomPropTypes from '../../app/utilities/props';

const SupplierInformation = (props) => {
  const { details, handleInputChange, newData, user, isEditable } = props;
  const { assessmentData } = details;
  const { supplierInfo } = newData;

  const servAddress = () => {
    let serviceAddress = '';
    assessmentData.reportAddress.map((address) => {
      if (address.addressType.addressType === 'Service') {
        serviceAddress = `${
          address.representativeName ? `${address.representativeName} ` : ' '
        }${address.addressLine1}${', '}${
          address.addressLine2 ? `${address.addressLine2}, ` : ''
        }${address.city}${', '}${address.state}${', '}${
          address.country
        }${', '}${address.postalCode}`;
        return serviceAddress;
      }
    });
    return serviceAddress;
  };

  const recAddress = () => {
    let recordAddress = '';
    assessmentData.reportAddress.map((address) => {
      if (address.addressType.addressType === 'Records') {
        recordAddress = `${
          address.representativeName ? `${address.representativeName} ` : ' '
        }${address.addressLine1}${', '}${
          address.addressLine2 ? `${address.addressLine2}, ` : ''
        }${address.city}${', '}${address.state}${', '}${
          address.country
        }${', '}${address.postalCode}`;
        return recordAddress;
      }
    });
    return recordAddress;
  };

  const checkAddressChanges = (
    data,
    addressType,
    supplierAddress,
    reconciledAddress
  ) => {
    let returnClassName = '';

    if (supplierAddress && reconciledAddress) {
      if (supplierAddress !== reconciledAddress) {
        returnClassName = 'highlight';
      }
    } else if (
      data &&
      data.reportAddress &&
      data.reportAddress &&
      supplierAddress
    ) {
      data.reportAddress.forEach((address) => {
        if (
          address &&
          address.addressType &&
          address.addressType.addressType === addressType
        ) {
          const compareAddress = `${
            address.representativeName ? `${address.representativeName} ` : ' '
          }${address.addressLine1}${', '}${
            address.addressLine2 ? `${address.addressLine2}, ` : ''
          }${address.city}${', '}${address.state}${', '}${
            address.country
          }${', '}${address.postalCode}`;

          if (compareAddress !== supplierAddress) {
            returnClassName = 'highlight';
          }
        }
      });
    }

    return returnClassName;
  };

  const checkMakesChanges = (data, ldvMakes) => {
    if (ldvMakes && data.makes.join('\n') !== ldvMakes) {
      return ' highlight ';
    }

    return '';
  };

  return (
    <>
      {!user.isGovernment && (
        <div className="text-blue mb-4">
          Make the required updates in the fields next to the original submitted
          values and provide an explanation in the comment box at the bottom of
          this form.
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
            className={`form-control ${
              supplierInfo.legalName &&
              supplierInfo.legalName !== assessmentData.legalName
                ? 'highlight'
                : ''
            }`}
            id="legalName"
            name="supplierInfo"
            onChange={handleInputChange}
            defaultValue={
              supplierInfo.legalName
                ? supplierInfo.legalName
                : assessmentData.legalName
            }
            readOnly={!isEditable}
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
            {assessmentData && assessmentData.reconciledServiceAddress
              ? assessmentData.reconciledServiceAddress
              : assessmentData &&
                assessmentData.reportAddress &&
                assessmentData.reportAddress.map(
                  (address) =>
                    address.addressType.addressType === 'Service' && (
                      <div className="p-0" key={address.id}>
                        {address.representativeName && (
                          <div> {address.representativeName} </div>
                        )}
                        {address.addressLine1} {address.addressLine2} <br />
                        {address.city} {address.state} {address.country}{' '}
                        {address.postalCode}
                      </div>
                    )
                )}
          </div>
        </div>
        <textarea
          className={`form-control d-inline-block align-top mt-4 col-sm-5 ${checkAddressChanges(
            assessmentData,
            'Service',
            supplierInfo.serviceAddress,
            assessmentData.reconciledServiceAddress
          )}`}
          defaultValue={
            supplierInfo.serviceAddress
              ? supplierInfo.serviceAddress
              : assessmentData && assessmentData.reconciledServiceAddress
              ? assessmentData.reconciledServiceAddress
              : servAddress()
          }
          id="serviceAddress"
          min="0"
          name="supplierInfo"
          onChange={handleInputChange}
          readOnly={!isEditable}
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
            {assessmentData && assessmentData.reconciledRecordsAddress
              ? assessmentData.reconciledRecordsAddress
              : assessmentData &&
                assessmentData.reportAddress &&
                assessmentData.reportAddress.map(
                  (address) =>
                    address.addressType.addressType === 'Records' && (
                      <div className="p-0" key={address.id}>
                        {address.representativeName && (
                          <div> {address.representativeName} </div>
                        )}
                        {address.addressLine1} {address.addressLine2} <br />
                        {address.city} {address.state} {address.country}{' '}
                        {address.postalCode}
                      </div>
                    )
                )}
          </div>
        </div>
        <textarea
          className={`form-control d-inline-block align-top mt-4 col-sm-5 ${checkAddressChanges(
            assessmentData,
            'Records',
            supplierInfo.recordsAddress,
            assessmentData.reconciledRecordsAddress
          )}`}
          defaultValue={
            supplierInfo.recordsAddress
              ? supplierInfo.recordsAddress
              : assessmentData && assessmentData.reconciledRecordsAddress
              ? assessmentData.reconciledRecordsAddress
              : recAddress()
          }
          id="recordsAddress"
          min="0"
          name="supplierInfo"
          onChange={handleInputChange}
          readOnly={!isEditable}
          rows="4"
        />
      </div>
      <div className="my-4">
        <div className="d-inline-block col-sm-4">
          <label className="text-blue font-weight-bold" htmlFor="ldvMakes">
            Light Duty Vehicle Makes
          </label>
          <div className="w-75">
            {assessmentData &&
              assessmentData.makes &&
              assessmentData.makes.map((make) => (
                <div className="p-0" key={make}>
                  {make}
                </div>
              ))}
          </div>
        </div>
        <textarea
          className={`form-control d-inline-block align-top mt-4 col-sm-5 ${checkMakesChanges(
            assessmentData,
            supplierInfo.ldvMakes
          )}`}
          defaultValue={
            supplierInfo.ldvMakes
              ? supplierInfo.ldvMakes
              : assessmentData.makes.join('\n')
          }
          id="ldvMakes"
          min="0"
          name="supplierInfo"
          onChange={handleInputChange}
          readOnly={!isEditable}
        />
      </div>
      <div className="my-4">
        <div className="d-inline-block col-sm-4">
          <label className="text-blue font-weight-bold" htmlFor="supplierClass">
            Vehicle Supplier Class
          </label>
          <div className="w-75">
            {assessmentData && assessmentData.supplierClass}
          </div>
        </div>
        <input
          className={`form-control d-inline-block align-top mt-4 col-sm-5 ${
            supplierInfo.supplierClass &&
            supplierInfo.supplierClass !== assessmentData.supplierClass
              ? 'highlight'
              : ''
          }`}
          defaultValue={
            supplierInfo.supplierClass
              ? supplierInfo.supplierClass
              : assessmentData.supplierClass
          }
          id="supplierClass"
          min="0"
          name="supplierInfo"
          onChange={handleInputChange}
          readOnly={!isEditable}
        />
      </div>
    </>
  );
};

SupplierInformation.propTypes = {
  details: PropTypes.shape().isRequired,
  handleInputChange: PropTypes.func.isRequired,
  newData: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
};

export default SupplierInformation;
