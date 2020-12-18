import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';

import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';
import CreditRequestListTable from './CreditRequestListTable';

const CreditRequestsPage = (props) => {
  const {
    filtered,
    setFiltered,
    submissions,
    user,
  } = props;

  return (
    <div id="credit-requests-list" className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>Application for Credits for Consumer Sales</h2>
        </div>
        {!user.isGovernment
        && user.hasPermission === 'function'
        && user.hasPermission('CREATE_SALES')
        && (
        <div className="col-md-4 text-right">
          <button
            className="button primary"
            onClick={() => {
              history.push(ROUTES_CREDIT_REQUESTS.NEW);
            }}
            type="button"
          >
            <FontAwesomeIcon icon="plus" /> New Credit Application
          </button>
        </div>
        )}
      </div>
      <div className="row">
        <div className="col-sm-12">
          <CreditRequestListTable
            filtered={filtered}
            items={submissions}
            user={user}
            setFiltered={setFiltered}
          />
        </div>
      </div>
    </div>
  );
};

CreditRequestsPage.defaultProps = {};

CreditRequestsPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  setFiltered: PropTypes.func.isRequired,
  submissions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditRequestsPage;
