import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';

import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import SubmissionListTable from './SubmissionListTable';

const CreditRequestsPage = (props) => {
  const {
    filtered,
    setFiltered,
    submissions,
    user,
  } = props;

  return (
    <div id="credit-requests-list" className="page">
      <div className="row mb-3">
        <div className="col-md-8">
          <h2 className="py-0">Application for Credits for Consumer Sales</h2>
        </div>
        {!user.isGovernment && (
        <div className="col-md-4 text-right">
          <button
            className="button primary"
            onClick={() => {
              history.push('/sales/new_upload');
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
          <SubmissionListTable
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
