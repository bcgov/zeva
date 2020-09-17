import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import history from '../../app/History';
import ROUTES_SALES from '../../app/routes/Sales';
import CustomPropTypes from '../../app/utilities/props';
import SalesSubmissionsListTable from './SalesSubmissionsListTable';

const SalesSubmissionPage = (props) => {
  const {
    submissions,
    user,
    filtered,
    setFiltered,
  } = props;

  return (
    <div id="sales-edit" className="page">
      <div className="row mb-3">
        <div className="col-9">
          <h2 className="d-inline">Application for Credits for Consumer Sales</h2>
        </div>
        <div className="col-3 text-right">
          <button
            className="button primary"
            onClick={() => {
              history.push(ROUTES_SALES.NEW_UPLOAD);
            }}
            type="button"
          >
            <FontAwesomeIcon icon="plus" /> New Credit Application
          </button>
        </div>
      </div>
      <SalesSubmissionsListTable
        items={submissions}
        user={user}
        filtered={filtered}
        setFiltered={setFiltered}
      />
    </div>
  );
};

SalesSubmissionPage.defaultProps = {};

SalesSubmissionPage.propTypes = {
  submissions: PropTypes.arrayOf(PropTypes.shape).isRequired,
  user: CustomPropTypes.user.isRequired,
  filtered: PropTypes.arrayOf(PropTypes.shape).isRequired,
  setFiltered: PropTypes.func.isRequired,
};

export default SalesSubmissionPage;
