import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    };

    this.collapseNavBar = this.collapseNavBar.bind(this);
  }

  collapseNavBar() {
    let { collapsed } = this.state;

    collapsed = !collapsed;

    this.setState({
      collapsed,
    });
  }

  render() {
    const { collapsed } = this.state;

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
                <h5 className="organization-name">Optimus Autoworks</h5>
                <span className="credit-balance">Credit Balance: 23,456-A / 12,345-B</span>
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
              <div className="display-name">
                <span>Buzz Collins</span>
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

              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  to="/compliance-reports"
                >
                  <span>Compliance Reports</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  to="/initiative-agreements"
                >
                  <span>Initiative Agreements</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  to="/credit-transactions"
                >
                  <span>Credit Transactions</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  to="/sales"
                >
                  <span>Sales</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  to="/zev-models"
                >
                  <span>ZEV Models</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  activeClassName="active"
                  to="/organization-details"
                >
                  <span>Organization Details</span>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

Navbar.defaultProps = {
};

Navbar.propTypes = {
};

export default Navbar;
