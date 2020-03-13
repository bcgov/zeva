import axios from 'axios';
import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Credits from './components/Credits';
import ROUTES_CREDITS from '../app/routes/Credits';
import Loading from '../app/components/Loading';

const CreditsContainer = (props) => {
  const { loading } = props;
  const [selection, setSelection] = useState(null);

  const handleClicked = function (selected) {
    setSelection(selected);
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <div id="credit-box">
      <div id="credits-navbar">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <NavLink
              exact
              to="/"
              className="nav-item"

              onClick={() => { handleClicked('Credit Transactions'); }}
            >
              <span>
            Credit Transactions
              </span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="/"
              className="nav-item"
              onClick={() => { handleClicked('Credit Requests'); }}
            >
              <span>Credit Requests</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="/"
              className="nav-item"
              onClick={() => { handleClicked('Credit Transfers'); }}
            >
              <span>Credit Transfers</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="/"
              className="nav-item"
              onClick={() => { handleClicked('Initiative Agreements'); }}
            >
              <span>Initiative agreements</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              exact
              to="/"
              className="nav-item"
              onClick={() => { handleClicked('Purchase Requests'); }}
            >
              <span>Purchase Requests</span>
            </NavLink>
          </li>
        </ul>
      </div>
      <article>
        <Credits title={selection} />
      </article>
    </div>
  );
};


export default CreditsContainer;
