import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import UserDetailsTextInput from './UserDetailsTextInput';
import Loading from '../../app/components/Loading';
import history from '../../app/History';

const UserDetailsForm = (props) => {
  const {
    details,
    loading,
    user,
    keycloak
  } = props;
  const handleSubmit = () => {
    console.log('Submit!');
  };
  const handleInputChange = () => {
    console.log('change input');
  };
  if (loading) {
    return <Loading />;
  }
  const keycloakRoles = keycloak.realmAccess.roles;
  console.log(keycloakRoles);

  return (
    <div id="user-form" className="page">
      <div className="row">
        <div className="col-md-12">
          <h1>{details.organization.name} User Management</h1>
          <h4>New/Edit User</h4>
        </div>
      </div>
      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row align-items-center">
          <fieldset>
            <div className="form-layout">
              <span className="left-form">
                <UserDetailsTextInput
                  label="First Name"
                  id="firstName"
                  defaultValue={details.firstName}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Last Name"
                  id="lastName"
                  defaultValue={details.lastName}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Job Title"
                  id="jobTitle"
                  defaultValue={details.jobTitle}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="BCeID User Name"
                  id="BCeIDUserName"
                  defaultValue={details.username}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="BCeID Email"
                  id="BCeIDEmail"
                  defaultValue={details.email}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Notifications Email"
                  id="notificationsEmail"
                  defaultValue=""
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Phone"
                  id="phone"
                  defaultValue={details.phone}
                  handleInputChange={handleInputChange}
                />
              </span>
              <span className="right-form">
                {!user.isGovernment && (
                  <div className="form-group">
                    <label
                      className="col-sm-2 col-form-label"
                      htmlFor="statusRadio"
                    >
                      Status
                    </label>
                    <div className="col-sm-10">
                      <input type="radio" id="active" name="active-bool-idir" value="active" defaultChecked={details.isActive} />
                      Active, user can log in to ZERO<br />
                      <input type="radio" id="inactive" name="active-bool-idir" value="inactive" defaultChecked={!details.isActive} />
                      Inactive, user cannot log in to ZERO
                    </div>

                  </div>
                )}
                <div className="form-group">
                  <label
                    className="col-sm-2 col-form-label"
                    htmlFor="rolesRadio"
                  >
                      Roles
                  </label>
                  <div className="col-sm-10">
                    <input type="checkbox" id="guest" name="roles-manager" value="guest" />Guest <FontAwesomeIcon icon="info-circle" /><br />
                    <input type="checkbox" id="creditTransfer" name="roles-manager" value="creditTransfer" />Credit Transfer <FontAwesomeIcon icon="info-circle" /><br />
                    <input type="checkbox" id="initiativeAgreements" name="roles-manager" value="initiativeAgreements" />Initiative Agreements <FontAwesomeIcon icon="info-circle" /><br />
                    <input type="checkbox" id="complianceReporting" name="roles-manager" value="complianceReporting" />Compliance Reporting <FontAwesomeIcon icon="info-circle" /><br />
                    <input type="checkbox" id="signingAuthority" name="roles-manager" value="signingAuthority" />Signing Authority <FontAwesomeIcon icon="info-circle" /><br />
                    <input type="checkbox" id="managingUser" name="roles-manager" value="managingUser" />Managing User <FontAwesomeIcon icon="info-circle" /><br />
                  </div>
                </div>
              </span>
            </div>
            <div className="action-bar form-group row">
              <span className="left-content">
                <button
                  className="button"
                  type="button"
                  onClick={() => {
                    History.goBack();
                  }}
                >
                  <FontAwesomeIcon icon="arrow-left" /> Back
                </button>
                <button type="button" className="delete-button"> Delete
                </button>
              </span>

              <span className="right-content">
                <button className="button primary" type="submit">
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

export default UserDetailsForm;
