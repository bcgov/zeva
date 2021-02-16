/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { now } from 'moment';

import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportAlert from './ComplianceReportAlert';

const SupplierInformationDetailsPage = (props) => {
  const {
    handleChangeMake,
    handleDeleteMake,
    handleSubmit,
    handleSubmitMake,
    loading,
    make,
    makes,
    user,
  } = props;

  const details = {
    supplierInformation: {
      history: [{
        status: 'DRAFT',
        createTimestamp: now(),
        createUser: user,
      }],
      status: 'DRAFT',
    },
    organization: user.organization,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>2020 Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <ComplianceReportAlert report={details.supplierInformation} type="Supplier Information" />
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <div className="p-3 supplier-information">
            <h3>Supplier Information</h3>
            <div className="mt-3">
              <h4 className="d-inline">Legal Name: </h4>
              <span> {details.organization.name} </span>
            </div>
            <div className="mt-3">
              <h4 className="d-inline">Vehicle Supplier Class: </h4>
              <span> Large Volume Supplier </span>
            </div>
            <div>
              <div className="d-inline-block mr-5 mt-3">
                <h4>Service Address</h4>
                {details.organization.organizationAddress
                && details.organization.organizationAddress.map((address) => (
                  address.addressType.addressType === 'Service' && (
                    <div key={address.id}>
                      {address.representativeName && (
                        <div> {address.representativeName} </div>
                      )}
                      <div> {address.addressLine1} </div>
                      <div> {address.city} {address.state} {address.country} </div>
                      <div> {address.postalCode} </div>
                    </div>
                  )
                ))}
              </div>
              <div className="d-inline-block mt-3">
                <h4>Records Address</h4>
                {details.organization.organizationAddress
                && details.organization.organizationAddress.map((address) => (
                  address.addressType.addressType === 'Records' && (
                    <div key={address.id}>
                      {address.representativeName && (
                        <div> {address.representativeName} </div>
                      )}
                      <div> {address.addressLine1} </div>
                      <div> {address.city} {address.state} {address.country} </div>
                      <div> {address.postalCode} </div>
                    </div>
                  )
                ))}
              </div>
              <div className="d-block mt-3">
                If there is an error in any of the information above, please contact: <a href="mailto:ZEVRegulation@gov.bc.ca">ZEVRegulation@gov.bc.ca</a>
              </div>
            </div>
            <div className="mt-4">
              <h4>Light Duty Vehicle Makes</h4>
              <div className="mt-1 mb-2">
                Enter all the LDV makes {details.organization.name} supplied in British Columbia in the 2020 compliance period ending September 30, 2021.
              </div>
              <div className="ldv-makes p-3">
                <form onSubmit={handleSubmitMake}>
                  <div className="form-row">
                    <div className="col-sm-8 col-xs-12">
                      <input className="form-control mr-3" onChange={handleChangeMake} type="text" value={make} />
                    </div>
                    <div className="col">
                      <button className="btn btn-primary" type="submit">Add Make</button>
                    </div>
                  </div>
                </form>

                {(makes.length > 0) && (
                  <div className="list mt-3 p-2">
                    {makes.map((item, index) => (
                      <div className="form-row my-2" key={index}>
                        <div className="col-11">{item}</div>
                        <div className="col-1 delete">
                          <button
                            onClick={() => {
                              handleDeleteMake(index);
                            }}
                            type="button"
                          >x
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 my-3">
          <div className="px-3">
            <input id="confirm" name="confirm" type="checkbox" /> <label htmlFor="confirm">I confirm the legal name, address for service, records address, the supplier classification and vehicle makes supplier are correct.</label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              <Button buttonType="back" locationRoute="/compliance/reports" />
            </span>
            <span className="right-content">
              <Button
                buttonType="save"
                optionalClassname="button primary"
                action={(event) => {
                  handleSubmit(event);
                }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

SupplierInformationDetailsPage.defaultProps = {
};

SupplierInformationDetailsPage.propTypes = {
  handleChangeMake: PropTypes.func.isRequired,
  handleDeleteMake: PropTypes.func.isRequired,
  handleSubmitMake: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  make: PropTypes.string.isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: CustomPropTypes.user.isRequired,
};
export default SupplierInformationDetailsPage;
