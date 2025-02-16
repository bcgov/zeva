import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";

import CustomPropTypes from "../../app/utilities/props";

const UserSettings = (props) => {
  const { details } = props;
  return (
    <div id="user-settings" className="dashboard-fieldset">
      <h1>Welcome</h1>

      <div className="content">
        <div className="text">
          <h5>{details.displayName}</h5>
          <dd>{details.title}</dd>
        </div>
      </div>

      <div className="content">
        <div className="text">
          <h5>{details.organization.name}</h5>
          {details.organization.organizationAddress &&
            details.organization.organizationAddress.map(
              (address) =>
                address.addressType.addressType === "Records" && (
                  <dl key={address.id}>
                    <dd>{address.addressLine1}</dd>
                    <dd>{address.addressLine2}</dd>
                    <dt />
                    <dd>
                      <span> {address.city} </span>
                      <span> {address.state} </span>
                      <span> {address.country} </span>
                    </dd>
                    <dt />
                    <dd>{address.postalCode}</dd>
                  </dl>
                ),
            )}
        </div>
      </div>
      <div className="tutorials">
        {details && !details.isGovernment && (
          <>
            <div className="mt-1">
              <FontAwesomeIcon icon="play" className="play-video" />
              <a
                className="ml-2"
                href="https://youtube.com/playlist?list=PLQ9IQMQB72Nw9jBLO5HtdNFTZOsAjTFOt"
              >
                Video Tutorials
              </a>
            </div>
            <div className="mt-1">
              <FontAwesomeIcon icon="play" className="play-video" />
              <a
                className="ml-2"
                href="https://www2.gov.bc.ca/gov/content/industry/electricity-alternative-energy/transportation-energies/clean-transportation-policies-programs/zero-emission-vehicles-act"
              >
                Zero-Emission Vehicles Act
              </a>
            </div>
          </>
        )}
        <div className="mt-1">
          <NavLink
            activeClassName="active"
            className="notifications"
            exact
            to="/notifications"
          >
            <span className="play-video">
              <FontAwesomeIcon icon="play" />
            </span>
            <span className="ml-2">Configure email notifications</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

UserSettings.defaultProps = {};

UserSettings.propTypes = {
  details: CustomPropTypes.user.isRequired,
};

export default UserSettings;
