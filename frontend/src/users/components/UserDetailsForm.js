import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CustomPropTypes from '../../app/utilities/props';
import Loading from '../../app/components/Loading';
import TextInput from '../../app/components/TextInput';
import History from '../../app/History';

const UserDetailsForm = (props) => {
  const {
    details,
    errorFields,
    loading,
    user,
    handleInputChange,
    handleSubmit,
    roles,
  } = props;

  if (loading) {
    return <Loading />;
  }

  const checked = (role) => {
    if (!details || !details.roles) {
      return false;
    }

    return details.roles.filter((detailRole) => detailRole.id === role.id).length > 0;
  };

  const rolesCheckboxes = roles.filter(
    (role) => role.isGovernmentRole === details.organization.isGovernment
  ).map((role) => (
    <ul key={role.id}>
      <input type="checkbox" id={role.id} onChange={handleInputChange} name="roles-manager" defaultChecked={checked(role)} /> {role.description} <FontAwesomeIcon icon="info-circle" />
    </ul>
  ));

  return (
    <div id="form" className="page">
      <div className="row">
        <div className="col-md-12">
          <h1>{details.organization.name} User Management</h1>
          <h5>New/Edit User</h5>
        </div>
      </div>
      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row align-items-center">
          <fieldset className="col-lg-12 col-xl-8">
            <div className="form-layout row">
              <span className="col-md-8">
                <TextInput
                  defaultValue={details.firstName}
                  errorMessage={'firstName' in errorFields && errorFields.firstName}
                  handleInputChange={handleInputChange}
                  id="firstName"
                  label="First Name"
                  mandatory
                  name="firstName"
                />
                <TextInput
                  defaultValue={details.lastName}
                  errorMessage={'lastName' in errorFields && errorFields.lastName}
                  handleInputChange={handleInputChange}
                  id="lastName"
                  label="Last Name"
                  mandatory
                  name="lastName"
                />
                <TextInput
                  defaultValue={details.title}
                  errorMessage={'title' in errorFields && errorFields.title}
                  handleInputChange={handleInputChange}
                  id="jobTitle"
                  label="Job Title"
                  mandatory
                  name="title"
                />
                <TextInput
                  defaultValue={details.username}
                  errorMessage={'username' in errorFields && errorFields.username}
                  handleInputChange={handleInputChange}
                  id="username"
                  label="BCeID User Name"
                  mandatory
                  name="username"
                />
                <TextInput
                  defaultValue={details.keycloakEmail}
                  details="the email associated with the BCeID account"
                  errorMessage={'keycloakEmail' in errorFields && errorFields.keycloakEmail}
                  handleInputChange={handleInputChange}
                  id="email"
                  label="BCeID Email"
                  mandatory
                  name="keycloakEmail"
                />
                <TextInput
                  defaultValue={details.email}
                  details="the email used to receive notifications, if different from above"
                  errorMessage={'email' in errorFields && errorFields.email}
                  handleInputChange={handleInputChange}
                  id="notificationsEmail"
                  label="Notifications Email"
                  name="email"
                />
                <TextInput
                  defaultValue={details.phone}
                  errorMessage={'phone' in errorFields && errorFields.phone}
                  handleInputChange={handleInputChange}
                  id="phone"
                  label="Phone"
                  mandatory
                  name="phone"
                />
              </span>
              <span className="col-md-4">
                {user.hasPermission('EDIT_USERS') && (
                  <div className="form-group">
                    <div className="col-sm-4">
                      <label
                        className="col-form-label"
                        htmlFor="statusRadio"
                      >
                        Status
                      </label>
                    </div>
                    <div className="col-sm-12">
                      <input type="radio" id="active" onChange={handleInputChange} name="isActive" value="true" defaultChecked={details.isActive} />
                      Active, user can log in to ZERO<br />
                      <input type="radio" id="inactive" onChange={handleInputChange} name="isActive" value="false" defaultChecked={!details.isActive} />
                      Inactive, user cannot log in to ZERO
                    </div>

                  </div>
                )}
                {(user.hasPermission('ASSIGN_BCEID_ROLES') || user.hasPermission('ASSIGN_IDIR_ROLES')) && (
                <div className="form-group">
                  <label
                    className="col-sm-4 col-form-label"
                    htmlFor="rolesRadio"
                  >
                      Roles
                  </label>
                  <div className="col-sm-8">
                    {rolesCheckboxes}
                  </div>
                </div>
                )}
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

UserDetailsForm.defaultProps = {
  errorFields: {},
};

UserDetailsForm.propTypes = {
  details: PropTypes.shape({
    email: PropTypes.string,
    firstName: PropTypes.string,
    isActive: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string,
    ]),
    keycloakEmail: PropTypes.string,
    lastName: PropTypes.string,
    organization: PropTypes.shape({
      isGovernment: PropTypes.bool,
      name: PropTypes.string,
    }),
    phone: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.shape()),
    title: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  errorFields: PropTypes.shape(),
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
      id: PropTypes.number,
    }),
  ).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default UserDetailsForm;
