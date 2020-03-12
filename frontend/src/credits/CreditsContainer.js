import axios from 'axios';
import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import ROUTES_CREDITS from '../app/routes/Credits';


const CreditsContainer = (props) => {
  
  return (
    <div id="credit-box">
      <div id="credits-navbar">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <NavLink
              activeClassName="active"
              exact
              to={ROUTES_CREDITS}
            >
              <span>Credit Transactions</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              activeClassName="active"
              exact
              to="/"
            >
              <span>Credit Requests</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              activeClassName="active"
              exact
              to="/"
            >
              <span>Credit Transfers</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              activeClassName="active"
              exact
              to="/"
            >
              <span>Initiative agreements</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              activeClassName="active"
              exact
              to="/"
            >
              <span>Purchase Requests</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};


export default CreditsContainer;
