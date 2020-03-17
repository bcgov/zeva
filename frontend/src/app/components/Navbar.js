import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CONFIG from '../config';
import CustomPropTypes from '../utilities/props';
import ROUTES_ORGANIZATIONS from '../routes/Organizations';
import ROUTES_ROLES from '../routes/Roles';
import ROUTES_VEHICLES from '../routes/Vehicles';

class Navbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: true,
      userMenuCollapsed: true,
    };

    this.collapseNavBar = this.collapseNavBar.bind(this);
    this.collapseUserMenu = this.collapseUserMenu.bind(this);
  }

  collapseNavBar() {
    let { collapsed } = this.state;

    collapsed = !collapsed;

    this.setState({
      collapsed,
    });
  }

  collapseUserMenu() {
    let { userMenuCollapsed } = this.state;

    userMenuCollapsed = !userMenuCollapsed;

    this.setState({
      userMenuCollapsed,
    });
  }

  render() {
    const { user, keycloak } = this.props;
    const { collapsed, userMenuCollapsed } = this.state;

    return (
      <div id="navbar">
        <div className="row header">
          <div className="col-lg-9">
            <div className="brand-logo" />

            <h1>Zero Emission Vehicle Reporting System</h1>
          </div>

          <div className="col-lg-3">
            <div className="logged-in-info">
              <div>
                <h5 className="organization-name">{user.organization.name}</h5>
                {!user.isGovernment && (
                  <span className="credit-balance">Credit Balance: 23,456-A / 12,345-B</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="navbar navbar-expand-lg">
          <button
            aria-controls="navbar-content"
            aria-expanded="false"
            aria-label="Toggle navigation"
            className="navbar-toggler"
            data-target="#navbar-content"
            data-toggle="collapse"
            onClick={this.collapseNavBar}
            type="button"
          >
            <FontAwesomeIcon icon="bars" />
          </button>

          <ul className="user-control-panel">
            <li>
              <button
                aria-expanded="false"
                aria-haspopup="true"
                className="display-name dropdown-toggle"
                data-toggle="dropdown"
                id="navbarDropdown"
                onClick={this.collapseUserMenu}
                type="button"
              >
                <span>{user.displayName}</span>
              </button>
              <div
                aria-labelledby="navbarDropdown"
                className={`dropdown-menu ${userMenuCollapsed ? 'd-none' : ''}`}
              >
                <div className="dropdown-item">
                  <button type="button">
                    <span className="icon">
                      <FontAwesomeIcon icon="user-cog" />
                    </span>
                    <span>Settings</span>
                  </button>
                </div>
                <div className="dropdown-item">
                  <button
                    onClick={() => keycloak.logout({
                      redirectUri: CONFIG.KEYCLOAK.LOGOUT_URL,
                    })}
                    type="button"
                  >
                    <span className="icon">
                      <FontAwesomeIcon icon="sign-out-alt" />
                    </span>

                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </li>
            <li>
              <NavLink
                activeClassName="active"
                className="notifications"
                to="/notifications"
              >
                <span><FontAwesomeIcon icon="bell" /></span>
              </NavLink>
            </li>
            <li>
              <NavLink
                activeClassName="active"
                className="help"
                to="/help"
              >
                <span><FontAwesomeIcon icon={['far', 'question-circle']} /></span>
              </NavLink>
            </li>
          </ul>

          <div className={`collapse navbar-collapse ${collapsed === false ? 'show' : ''}`}>
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  exact
                  to="/"
                >
                  <span>Home</span>
                </NavLink>
              </li>

              {keycloak.hasRealmRole('View ZEV')
              && (
                <li className="nav-item">
                  <NavLink
                    activeClassName="active"
                    to={ROUTES_VEHICLES.LIST}
                  >
                    <span>ZEV Models</span>
                  </NavLink>
                </li>
              )}

              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  to="/model-year-report"
                >
                  <span>Model Year Report</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  to="/sales"
                >
                  <span>Credit Transactions</span>
                </NavLink>
              </li>

              {keycloak.hasRealmRole('View Organization Information')
              && keycloak.hasRealmRole('Vehicle Supplier')
              && (
                <li className="nav-item">
                  <NavLink
                    activeClassName="active"
                    to={ROUTES_ORGANIZATIONS.MINE}
                  >
                    <span>Organization Details</span>
                  </NavLink>
                </li>
              )}

              {keycloak.hasRealmRole('View Roles and Permissions')
              && (
                <li className="nav-item">
                  <NavLink
                    activeClassName="active"
                    to={ROUTES_ROLES.LIST}
                  >
                    <span>Roles</span>
                  </NavLink>
                </li>
              )}

              {keycloak.hasRealmRole('View Organization Information')
              && keycloak.hasRealmRole('Government')
              && (
                <li className="nav-item">
                  <NavLink
                    activeClassName="active"
                    to={ROUTES_ORGANIZATIONS.LIST}
                  >
                    <span>Organizations</span>
                  </NavLink>
                </li>
              )}

            </ul>
          </div>
        </div>
      </div>
    );
  }
}

Navbar.defaultProps = {};

Navbar.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default Navbar;
