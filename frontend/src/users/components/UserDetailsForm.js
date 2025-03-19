import React from "react";
import PropTypes from "prop-types";

import Button from "../../app/components/Button";
import CustomPropTypes from "../../app/utilities/props";
import Loading from "../../app/components/Loading";
import TextInput from "../../app/components/TextInput";
import Tooltip from "../../app/components/Tooltip";

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

  const disableEditing = (permissions) => {
    let editPermission;
    if (permissions) {
      permissions.forEach((each) => {
        if (each.permissionCode === "EDIT_USERS") {
          editPermission = true;
        }
      });
    } else if (
      !permissions &&
      typeof user.hasPermission === "function" &&
      user.hasPermission("EDIT_USERS")
    ) {
      editPermission = true;
    } else {
      editPermission = false;
    }

    if (
      editPermission &&
      details.username === user.username &&
      !user.isGovernment
    ) {
      return true;
    }
    return false;
  };

  const checked = (role) => {
    if (!details || !details.roles) {
      return false;
    }

    return (
      details.roles.filter((detailRole) => detailRole.id === role.id).length > 0
    );
  };

  const rolesCheckboxes = roles
    .filter(
      (role) => role.isGovernmentRole === details.organization.isGovernment,
    )
    .map((role) => (
      <ul key={role.id}>
        <input
          type="checkbox"
          id={role.id}
          onChange={handleInputChange}
          name="roles-manager"
          defaultChecked={checked(role)}
          disabled={disableEditing(role.permissions)}
        />{" "}
        {role.roleCode}{" "}
        <Tooltip
          tooltipId={`role-${role.id}`}
          tooltipText={role.description}
          infoCircle
        />
      </ul>
    ));

  const accountType = details.organization.isGovernment ? "IDIR" : "BCeID";

  const activationText = details.isMapped
    ? "User account is mapped."
    : "User account has not been mapped.";

  return (
    <div id="form" className="page">
      <div className="row mb-2">
        <div className="col-md-12">
          <h2 className="mb-2">{details.organization.name} User Management</h2>
          <h3>{`${details && details.id ? "Edit" : "New"} User`}</h3>
        </div>
      </div>
      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row">
          <div className="col-lg-12 col-xl-10">
            <fieldset>
              <div className="form-layout row">
                <span className="col-md-8">
                  <TextInput
                    defaultValue={details.firstName || ""}
                    errorMessage={
                      "firstName" in errorFields && errorFields.firstName
                    }
                    handleInputChange={handleInputChange}
                    id="firstName"
                    label="First Name"
                    mandatory
                    name="firstName"
                  />
                  <TextInput
                    defaultValue={details.lastName || ""}
                    errorMessage={
                      "lastName" in errorFields && errorFields.lastName
                    }
                    handleInputChange={handleInputChange}
                    id="lastName"
                    label="Last Name"
                    mandatory
                    name="lastName"
                  />
                  <TextInput
                    defaultValue={details.title || ""}
                    errorMessage={"title" in errorFields && errorFields.title}
                    handleInputChange={handleInputChange}
                    id="jobTitle"
                    label="Job Title"
                    mandatory
                    name="title"
                  />
                  <TextInput
                    defaultValue={details.username || ""}
                    errorMessage={
                      "username" in errorFields && errorFields.username
                    }
                    handleInputChange={handleInputChange}
                    id="username"
                    label={`${accountType} User Id`}
                    mandatory
                    name="username"
                  />
                  <TextInput
                    defaultValue={details.keycloakEmail || ""}
                    details={
                      accountType === "BCeID"
                        ? `the email associated with the ${accountType} account`
                        : ""
                    }
                    errorMessage={
                      "keycloakEmail" in errorFields &&
                      errorFields.keycloakEmail
                    }
                    handleInputChange={handleInputChange}
                    id="email"
                    label={`${
                      accountType === "BCeID" ? accountType : ""
                    } Email`}
                    mandatory
                    name="keycloakEmail"
                  />
                  <TextInput
                    defaultValue={details.email || ""}
                    details="the email used to receive notifications, if different from above"
                    errorMessage={"email" in errorFields && errorFields.email}
                    handleInputChange={handleInputChange}
                    id="notificationsEmail"
                    key="notificationsEmail"
                    label="Notifications Email"
                    name="email"
                  />
                  {accountType === "BCeID" && (
                    <TextInput
                      defaultValue={details.phone || ""}
                      errorMessage={"phone" in errorFields && errorFields.phone}
                      handleInputChange={handleInputChange}
                      id="phone"
                      label="Phone"
                      name="phone"
                    />
                  )}
                </span>

                <span className="col-md-4">
                  {typeof user.hasPermission === "function" &&
                    user.hasPermission("EDIT_USERS") && (
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
                          <input
                            type="radio"
                            id="active"
                            onChange={handleInputChange}
                            name="isActive"
                            value="true"
                            defaultChecked={details.isActive}
                            disabled={disableEditing()}
                          />
                          Active, user can log in to ZEVA
                          <br />
                          <input
                            type="radio"
                            id="inactive"
                            onChange={handleInputChange}
                            name="isActive"
                            value="false"
                            defaultChecked={!details.isActive}
                            disabled={disableEditing()}
                          />
                          Inactive, user cannot log in to ZEVA
                        </div>
                      </div>
                    )}
                  {typeof user.hasPermission === "function" &&
                    (user.hasPermission("ASSIGN_BCEID_ROLES") ||
                      user.hasPermission("ASSIGN_IDIR_ROLES")) && (
                      <div className="form-group">
                        <label
                          className="col-sm-4 col-form-label"
                          htmlFor="rolesRadio"
                        >
                          Roles
                        </label>
                        <div className="col-sm-8">{rolesCheckboxes}</div>
                      </div>
                    )}
                  <div className="form-group">
                    <label className="col-sm-4 col-form-label">Account</label>
                    <div className="col-sm-8">{activationText}</div>
                  </div>
                </span>
              </div>
            </fieldset>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="action-bar form-group">
              <span className="left-content">
                <Button buttonType="back" />
              </span>

              <span className="right-content">
                <Button
                  buttonType="save"
                  optionalClassname="button primary"
                  action={handleSubmit}
                />
              </span>
            </div>
          </div>
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
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isActive: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
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
