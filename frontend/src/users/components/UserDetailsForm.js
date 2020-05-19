import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CustomPropTypes from '../../app/utilities/props';
import TextInput from '../../app/components/TextInput';
import Loading from '../../app/components/Loading';
import History from '../../app/History';

const UserDetailsForm = (props) => {
  const {
    details,
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

  const rolesCheckboxes = roles.filter((role) => role.isGovernmentRole === false).map((role) => (
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
          <fieldset>
            <div className="form-layout row">
              <span className="col-xs-8">
                <TextInput
                  label="First Name"
                  id="firstName"
                  name="firstName"
                  defaultValue={details.firstName}
                  handleInputChange={handleInputChange}
                  mandatory
                />
                <TextInput
                  label="Last Name"
                  id="lastName"
                  name="lastName"
                  defaultValue={details.lastName}
                  handleInputChange={handleInputChange}
                  mandatory
                />
                <TextInput
                  label="Job Title"
                  id="jobTitle"
                  name="title"
                  defaultValue={details.title}
                  handleInputChange={handleInputChange}
                  mandatory
                />
                <TextInput
                  label="BCeID User Name"
                  id="username"
                  name="username"
                  defaultValue={details.username}
                  handleInputChange={handleInputChange}
                  mandatory
                />
                <TextInput
                  details="the email associated with the BCeID account"
                  label="BCeID Email"
                  id="email"
                  name="keycloakEmail"
                  defaultValue={details.keycloakEmail}
                  handleInputChange={handleInputChange}
                  mandatory
                />
                <TextInput
                  details="the email used to receive notifications, if different from above"
                  label="Notifications Email"
                  id="notificationsEmail"
                  name="email"
                  defaultValue={details.email}
                  handleInputChange={handleInputChange}
                />
                <TextInput
                  label="Phone"
                  id="phone"
                  name="phone"
                  defaultValue={details.phone}
                  handleInputChange={handleInputChange}
                  mandatory
                />
              </span>
              <span className="col-xs-4">
                {user.isGovernment && (
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
UserDetailsForm.propTypes = {
  details: PropTypes.shape({
    email: PropTypes.string,
    firstName: PropTypes.string,
    keycloakEmail: PropTypes.string,
    lastName: PropTypes.string,
    organization: PropTypes.shape({
      name: PropTypes.string,
    }),
    phone: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.shape()),
    title: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
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
