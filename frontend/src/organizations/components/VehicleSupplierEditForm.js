import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomPropTypes from '../../app/utilities/props';
import UserDetailsTextInput from './UserDetailsTextInput';
import Loading from '../../app/components/Loading';
import History from '../../app/History';

const VehicleSupplierEditForm = (props) => {
  const {
    details,
    loading,
    user,
    handleInputChange,
    handleSubmit,
    setEditForm,

  } = props;
  console.log(details);

  if (loading) {
    return <Loading />;
  }
  return (
    <div id="supplier-detail-form" className="page">
      <div className="row">
        <div className="col-md-12">
          <h5>Edit Supplier</h5>
          <h6>{details.name} {details.shortName && '(' + details.shortName + ')'}</h6>
        </div>
      </div>
      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row align-items-center">
          <fieldset>
            <div className="form-layout row">
              <span>
                <UserDetailsTextInput
                  label="Legal Organization Name"
                  id="LegalOrganizationName"
                  name="Legal Organization Name"
                  defaultValue={details.name}
                  handleInputChange={handleInputChange}
                  mandatory
                />
                <UserDetailsTextInput
                  label="Common Name"
                  id="CommonName"
                  name="Common Name"
                  defaultValue={details.shortName}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Street Address/PO Box"
                  id="StreetAddress"
                  name="Street Address"
                  defaultValue={details.organizationAddress? details.organizationAddress.addressLine1 : ''}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Address Other (optional)"
                  id="AddressOther"
                  name="Address Other"
                  defaultValue={details.organizationAddress? details.organizationAddress.addressLine2: ''}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="City"
                  id="City"
                  name="City"
                  defaultValue={details.organizationAddress? details.organizationAddress.city: ''}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Province/State/Region"
                  id="Province"
                  name="Province"
                  defaultValue={details.organizationAddress? details.organizationAddress.state: ''}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Country"
                  id="Country"
                  name="Country"
                  defaultValue={details.organizationAddress? details.organizationAddress.country: ''}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Postal/ZIP Code"
                  id="PostalCode"
                  name="Postal Code"
                  defaultValue={details.organizationAddress? details.organizationAddress.postalCode: ''}
                  handleInputChange={handleInputChange}
                />

              </span>
            </div>
            <div className="action-bar form-group row">
              <span className="left-content">
                <button
                  className="button"
                  type="button"
                  onClick={() => {
                    setEditForm(false);
                    History.goBack();
                  }}
                >
                  <FontAwesomeIcon icon="arrow-left" /> Back
                </button>
                <button type="button" className="delete-button"> Delete
                </button>
              </span>

              <span className="right-content">
                <button className="button primary" type="button" onClick={handleSubmit}>
                  <FontAwesomeIcon icon="save" /> Save
                </button>
              </span>
            </div>
          </fieldset>
        </div>
      </form>
    </div>
  );
};
// VehicleSupplierEditForm.propTypes = {
//   user: CustomPropTypes.user.isRequired,
// };

export default VehicleSupplierEditForm;
