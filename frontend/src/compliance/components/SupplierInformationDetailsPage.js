/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportAlert from './ComplianceReportAlert';
import ComplianceReportSignOff from './ComplianceReportSignOff';

const SupplierInformationDetailsPage = (props) => {
  const {
    details,
    handleChangeMake,
    handleDeleteMake,
    handleSubmit,
    handleSubmitMake,
    loading,
    make,
    makes,
    user,
    assertions,
    checkboxes,
    confirmed,
    disabledCheckboxes,
    handleCheckboxClick,
    modelYear,
  } = props;
  if (loading) {
    return <Loading />;
  }

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{modelYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {details && details.supplierInformation && details.supplierInformation.history && (
            <ComplianceReportAlert report={details.supplierInformation} type="Supplier Information" />
          )}
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
                Enter all the LDV makes {details.organization.name} supplied in British Columbia in the {modelYear} compliance period ending September 30, {modelYear + 1}.
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
          <ComplianceReportSignOff
            assertions={assertions}
            checkboxes={checkboxes}
            handleCheckboxClick={handleCheckboxClick}
            user={user}
            disabledCheckboxes={disabledCheckboxes}
          />
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
  details: PropTypes.shape({
    organization: PropTypes.shape(),
    supplierInformation: PropTypes.shape(),
  }).isRequired,
  handleChangeMake: PropTypes.func.isRequired,
  handleDeleteMake: PropTypes.func.isRequired,
  handleSubmitMake: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  make: PropTypes.string.isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: CustomPropTypes.user.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ).isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  disabledCheckboxes: PropTypes.string.isRequired,
  modelYear: PropTypes.number.isRequired,
};
export default SupplierInformationDetailsPage;
