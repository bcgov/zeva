import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CONFIG from '../config';
import CustomPropTypes from '../utilities/props';
import ROUTES_CREDITS from '../routes/Credits';
import ROUTES_CREDIT_REQUESTS from '../routes/CreditRequests';
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

  componentDidMount() {
    window.addEventListener('click', (e) => {
      if (!document.getElementById('navbarDropdown').contains(e.target)) {
        const { userMenuCollapsed } = this.state;

        if (!userMenuCollapsed) {
          this.setState({
            userMenuCollapsed: true,
          });
        }
      }
    });
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
            <a href="http://www.gov.bc.ca">
              <div className="brand-logo" />
            </a>
            <h1>Zero-Emission Vehicles Reporting System</h1>
          </div>

          <div className="col-lg-3">
            <div className="logged-in-info">
              <div>
                <h5 className="organization-name">{user.organization ? user.organization.name : ''}</h5>
                {!user.isGovernment && user.organization && (
                <Link className="credit-balance" to={ROUTES_CREDITS.LIST}>Credit Balance: {user.organization.balance.A}-A/ {user.organization.balance.B}-B</Link>
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
                  <NavLink
                  activeClassName="active"
                  exact
                  to="/notifications"
                >
                  <span className="ml-2 icon text-black" style={{color: "black"}}>
                      <FontAwesomeIcon icon="envelope" />
                    </span>
                  <span className="ml-3" style={{color: "black"}}>Email Notifications</span>
                </NavLink> 
                </div>
                {/* <div className="dropdown-item">
                  <button type="button">
                    <span className="icon">
                      <FontAwesomeIcon icon="user-cog" />
                    </span>
                    <span>Settings</span>
                  </button>
                </div> */}
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
            {/* <li>
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
            </li> */}
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
              {CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED && (
              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  to="/model-year-report"
                >
                  <span>Model Year Report</span>
                </NavLink>
              </li>
              )}

              {CONFIG.FEATURES.CREDIT_TRANSACTIONS.ENABLED
              && typeof user.hasPermission === 'function'
              && user.hasPermission('VIEW_SALES')
              && (
              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  isActive={(match, location) => {
                    if (location.pathname.toLowerCase().includes('credit-transactions')
                    && !location.pathname.toLowerCase().includes('organizations')) {
                      return true;
                    }

                    if (location.pathname.toLowerCase().includes('sales')) {
                      return true;
                    }

                    if (!match) {
                      return false;
                    }

                    return true;
                  }}
                  to={user.isGovernment ? ROUTES_CREDIT_REQUESTS.LIST : ROUTES_CREDITS.LIST}
                >
                  <span>Credit Transactions</span>
                </NavLink>
              </li>
              )}

              {typeof user.hasPermission === 'function'
              && user.hasPermission('VIEW_ZEV')
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

              {typeof user.hasPermission === 'function'
              && user.hasPermission('VIEW_ORGANIZATIONS')
              && user.isGovernment
              && (
                <li className="nav-item">
                  <NavLink
                    activeClassName="active"
                    isActive={(match, location) => {
                      if (!match) {
                        return false;
                      }

                      if (location.pathname.includes('/organizations/mine')) {
                        return false;
                      }

                      return true;
                    }}
                    to={ROUTES_ORGANIZATIONS.LIST}
                  >
                    <span>Vehicle Suppliers</span>
                  </NavLink>
                </li>
              )}
              {typeof user.hasPermission === 'function'
              && (user.hasPermission('EDIT_ORGANIZATIONS') || user.hasPermission('EDIT_ORGANIZATION_INFORMATION'))
              && (
                <li className="nav-item">
                  <NavLink
                    activeClassName="active"
                    isActive={(match, location) => {
                      if (location.pathname.toLowerCase().includes('users')
                      && !location.pathname.toLowerCase().includes('organizations/')) {
                        return true;
                      }

                      if (location.pathname.toLowerCase().includes('sales')) {
                        return true;
                      }

                      if (!match) {
                        return false;
                      }

                      return true;
                    }}
                    to={ROUTES_ORGANIZATIONS.MINE}
                  >
                    <span>Administration</span>
                  </NavLink>
                </li>
              )}

              {CONFIG.FEATURES.ROLES.ENABLED
              && typeof user.hasPermission === 'function'
              && user.hasPermission('VIEW_ROLES_AND_PERMISSIONS')
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
