import PropTypes from 'prop-types';
import React from 'react';

import CustomPropTypes from '../../app/utilities/props';
import SubmissionListTable from './SubmissionListTable';

const CreditRequestsPage = (props) => {
  const {
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
            items={submissions}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

CreditRequestsPage.defaultProps = {};

CreditRequestsPage.propTypes = {
  submissions: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditRequestsPage;
