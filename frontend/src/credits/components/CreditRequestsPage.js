import PropTypes from 'prop-types';
import React from 'react';

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
      <div className="row">
        <div className="col-sm-12">
          <h1>Approve Credit Requests</h1>
          <h2>Active Credit Request Submissions</h2>
        </div>
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
