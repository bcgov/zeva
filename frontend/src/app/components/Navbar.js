import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Navbar extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <div id="navbar">
        <div className="row header">
          <div className="col-sm-9">
            <div className="brand-logo" />

            <h1>Zero Emission Vehicle Reporting System</h1>
          </div>

          <div className="col-sm-3">
            <div className="logged-in-info">
              <div>
                <h5>Optimus Autoworks</h5>
                <span>Credit Balance: 23,456-A / 12,345-B</span>
              </div>
            </div>
          </div>
        </div>

        <div className="row sub-header">
          <div className="col-sm-9 links">
            <NavLink
              activeClassName="active"
              to="/"
            >
              Home
            </NavLink>

            <NavLink
              activeClassName="active"
              to="/compliance-reports"
            >
              Compliance Reports
            </NavLink>

            <NavLink
              activeClassName="active"
              to="/initiative-agreements"
            >
              Initiative Agreements
            </NavLink>

            <NavLink
              activeClassName="active"
              to="/credit-transactions"
            >
              Credit Transactions
            </NavLink>

            <NavLink
              activeClassName="active"
              to="/sales"
            >
              Sales
            </NavLink>

            <NavLink
              activeClassName="active"
              to="/zev-models"
            >
              ZEV Models
            </NavLink>

            <NavLink
              activeClassName="active"
              to="/organization-details"
            >
              Organization Details
            </NavLink>
          </div>

          <div className="col-sm-3 user-control-panel">
            <div>
              Buzz Collins
            </div>
            <NavLink
              activeClassName="active"
              className="notifications"
              to="/notifications"
            >
              <FontAwesomeIcon icon="bell" />
            </NavLink>
            <NavLink
              activeClassName="active"
              className="help"
              to="/help"
            >
              <FontAwesomeIcon icon={['far', 'question-circle']} />
            </NavLink>
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
