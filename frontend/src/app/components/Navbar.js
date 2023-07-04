import React, { Component } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import formatNumeric from '../utilities/formatNumeric'
import CONFIG from '../config'
import CustomPropTypes from '../utilities/props'
import ROUTES_CREDITS from '../routes/Credits'
import ROUTES_CREDIT_REQUESTS from '../routes/CreditRequests'
import ROUTES_ORGANIZATIONS from '../routes/Organizations'
import ROUTES_ROLES from '../routes/Roles'
import ROUTES_VEHICLES from '../routes/Vehicles'
import ROUTES_COMPLIANCE from '../routes/Compliance'

class Navbar extends Component {
  constructor (props) {
    super(props)

    this.state = {
      collapsed: true,
      userMenuCollapsed: true
    }

    this.collapseNavBar = this.collapseNavBar.bind(this)
    this.collapseUserMenu = this.collapseUserMenu.bind(this)
  }

  componentDidMount () {
    window.addEventListener('click', (e) => {
      if (!document.getElementById('navbarDropdown').contains(e.target)) {
        const { userMenuCollapsed } = this.state

        if (!userMenuCollapsed) {
          this.setState({
            userMenuCollapsed: true
          })
        }
      }
    })
  }

  collapseNavBar () {
    let { collapsed } = this.state

    collapsed = !collapsed

    this.setState({
      collapsed
    })
  }

  collapseUserMenu () {
    let { userMenuCollapsed } = this.state

    userMenuCollapsed = !userMenuCollapsed

    this.setState({
      userMenuCollapsed
    })
  }

  render () {
    const { user, logout } = this.props
    const { collapsed, userMenuCollapsed } = this.state

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
                <h5 className="organization-name">
                  {user.organization ? user.organization.name : ''}
                </h5>
                {!user.isGovernment && user.organization && (
                  <Link
                    className="credit-balance d-print-none"
                    to={ROUTES_CREDITS.LIST}
                  >
                    See Credit Balance &gt;
                  </Link>
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
                {CONFIG.FEATURES.NOTIFICATIONS.ENABLED && (
                  <div className="dropdown-item">
                    <NavLink
                      activeClassName="active"
                      className="notifications"
                      exact
                      to="/notifications"
                    >
                      <span className="icon">
                        <FontAwesomeIcon icon="envelope" />
                      </span>

                      <span>Email Notifications</span>
                    </NavLink>
                  </div>
                )}
                <div className="dropdown-item">
                  <button
                    onClick={() =>
                      logout()
                    }
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
          </ul>

          <div
            className={`collapse navbar-collapse ${
              collapsed === false ? 'show' : ''
            }`}
          >
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <NavLink activeClassName="active" exact to="/">
                  <span>Home</span>
                </NavLink>
              </li>
              {CONFIG.FEATURES.COMPLIANCE_REPORT.ENABLED &&
                ((!user.isGovernment && user.hasPermission('EDIT_SALES')) ||
                  (user.isGovernment && user.hasPermission('VIEW_SALES'))) && (
                  <li className="nav-item">
                    <NavLink
                      activeClassName="active"
                      isActive={(match, location) => {
                        if (
                          location.pathname
                            .toLowerCase()
                            .indexOf('compliance') === 1
                        ) {
                          return true
                        }

                        if (!match) {
                          return false
                        }

                        return true
                      }}
                      to={
                        CONFIG.FEATURES.MODEL_YEAR_REPORT.ENABLED
                          ? ROUTES_COMPLIANCE.REPORTS
                          : ROUTES_COMPLIANCE.RATIOS
                      }
                    >
                      <span>Compliance Reporting</span>
                    </NavLink>
                  </li>
              )}
              {CONFIG.FEATURES.CREDIT_TRANSACTIONS.ENABLED &&
                typeof user.hasPermission === 'function' &&
                ((!user.isGovernment && user.hasPermission('EDIT_SALES')) ||
                  (user.isGovernment && user.hasPermission('VIEW_SALES'))) && (
                  <li className="nav-item">
                    <NavLink
                      activeClassName="active"
                      isActive={(match, location) => {
                        if (
                          location.pathname.toLowerCase().indexOf('credit-') ===
                          1
                        ) {
                          return true
                        }

                        if (!match) {
                          return false
                        }

                        return true
                      }}
                      to={
                        user.isGovernment
                          ? ROUTES_CREDIT_REQUESTS.LIST
                          : ROUTES_CREDITS.LIST
                      }
                    >
                      <span>Credit Transactions</span>
                    </NavLink>
                  </li>
              )}

              {typeof user.hasPermission === 'function' &&
                user.hasPermission('VIEW_ZEV') && (
                  <li className="nav-item">
                    <NavLink activeClassName="active" to={ROUTES_VEHICLES.LIST}>
                      <span>ZEV Models</span>
                    </NavLink>
                  </li>
              )}

              {typeof user.hasPermission === 'function' &&
                user.hasPermission('VIEW_ORGANIZATIONS') &&
                user.isGovernment && (
                  <li className="nav-item">
                    <NavLink
                      activeClassName="active"
                      isActive={(match, location) => {
                        if (!match) {
                          return false
                        }

                        if (location.pathname.includes('/organizations/mine')) {
                          return false
                        }

                        return true
                      }}
                      to={ROUTES_ORGANIZATIONS.LIST}
                    >
                      <span>Vehicle Suppliers</span>
                    </NavLink>
                  </li>
              )}
              {typeof user.hasPermission === 'function' &&
                (user.hasPermission('EDIT_ORGANIZATIONS') ||
                  user.hasPermission('EDIT_ORGANIZATION_INFORMATION')) && (
                  <li className="nav-item">
                    <NavLink
                      activeClassName="active"
                      isActive={(match, location) => {
                        if (
                          location.pathname.toLowerCase().includes('users') &&
                          !location.pathname
                            .toLowerCase()
                            .includes('organizations/')
                        ) {
                          return true
                        }

                        if (location.pathname.toLowerCase().includes('sales')) {
                          return true
                        }

                        if (!match) {
                          return false
                        }

                        return true
                      }}
                      to={ROUTES_ORGANIZATIONS.MINE}
                    >
                      <span>Administration</span>
                    </NavLink>
                  </li>
              )}

              {CONFIG.FEATURES.ROLES.ENABLED &&
                typeof user.hasPermission === 'function' &&
                user.hasPermission('VIEW_ROLES_AND_PERMISSIONS') && (
                  <li className="nav-item">
                    <NavLink activeClassName="active" to={ROUTES_ROLES.LIST}>
                      <span>Roles</span>
                    </NavLink>
                  </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

Navbar.defaultProps = {}

Navbar.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired
}

export default Navbar
