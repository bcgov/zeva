import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomPropTypes from '../../app/utilities/props';
import UserDetailsTextInput from './UserDetailsTextInput';
import Loading from '../../app/components/Loading';
import History from '../../app/History';

const UserDetailsForm = (props) => {
  const {
    details,
    loading,
    user,
    handleInputChange,
    handleSubmit,
    rolesList,
    roles,
  } = props;

  if (loading) {
    return <Loading />;
  }
  const checked = (role) => !!roles.includes(role);
  const rolesCheckboxes = rolesList.map((role) => (
    <ul key={role}>
      <input type="checkbox" id={role} onChange={handleInputChange} name="roles-manager" defaultChecked={checked(role)} />{role}<FontAwesomeIcon icon="info-circle" />
    </ul>
  ));
  return (
    <div id="user-form" className="page">
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
                <UserDetailsTextInput
                  label="First Name"
                  id="firstName"
                  name="First name"
                  defaultValue={details.firstName}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Last Name"
                  id="lastName"
                  name="Last name"
                  defaultValue={details.lastName}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Job Title"
                  id="jobTitle"
                  name="Job title"
                  defaultValue={details.jobTitle}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="BCeID User Name"
                  id="BCeIDUserName"
                  name="BCeID user name"
                  defaultValue={details.username}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  details="the email associated with the BCeID account"
                  label="BCeID Email"
                  id="BCeIDEmail"
                  name="BCeID email"
                  defaultValue={details.email}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  details="the email used to receive notifications, if different from above"
                  label="Notifications Email"
                  id="notificationsEmail"
                  name="Notifications email"
                  defaultValue=""
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Phone"
                  id="phone"
                  name="Phone"
                  defaultValue={details.phone}
                  handleInputChange={handleInputChange}
                />
              </span>
              <span className="col-xs-4">
                {!user.isGovernment && (
                  <div className="form-group">
                    <label
                      className="col-sm-4 col-form-label"
                      htmlFor="statusRadio"
                    >
                      Status
                    </label>
                    <div className="col-sm-8">
                      <input type="radio" id="active" onChange={handleInputChange} name="active-bool-idir" value="active" defaultChecked={details.isActive} />
                      Active, user can log in to ZERO<br />
                      <input type="radio" id="inactive"  onChange={handleInputChange} name="active-bool-idir" value="inactive" defaultChecked={!details.isActive} />
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
  user: CustomPropTypes.user.isRequired,
};

export default UserDetailsForm;
