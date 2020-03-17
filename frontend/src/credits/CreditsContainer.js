import axios from 'axios';
import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import CreditTransactions from './components/CreditTransactions';
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
    <div id="credit-container">
      <div id="credits-navbar">
        <ul className="nav nav-tabs">
          <li>
            <NavLink
              className="nav-link"
              exact
              to="/"
              className="nav-link active"
              onClick={() => { handleClicked('Transactions'); }}
            >
              <span>
            Credit Transactions
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              className="nav-link"
              exact
              to="/"
              onClick={() => { handleClicked('Credit Requests'); }}
            >
              <span>Credit Requests</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              className="nav-link"
              exact
              to="/"
              onClick={() => { handleClicked('Credit Transfers'); }}
            >
              <span>Credit Transfers</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              className="nav-link"
              exact
              to="/"
              onClick={() => { handleClicked('Initiative Agreements'); }}
            >
              <span>Initiative agreements</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              className="nav-link"
              exact
              to="/"
              onClick={() => { handleClicked('Purchase Requests'); }}
            >
              <span>Purchase Requests</span>
            </NavLink>
          </li>
        </ul>
      </div>
      <article>
        {selection === 'Transactions' && <CreditTransactions title="Credit Transactions" />}
      </article>
    </div>
  );
};


export default CreditsContainer;
