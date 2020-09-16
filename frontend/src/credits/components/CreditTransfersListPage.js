import React from 'react';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import CreditTransfersListTable from './CreditTransfersListTable';

const CreditTransfersListPage = (props) => {
  const {
    creditTransfers,
    loading,
    user,
  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="action-bar">
        <span className="left-content">
          <h3>Light Duty Vehicle Credit Transfers</h3>
        </span>
        <span className="right-content">
          {!user.isGovernment && (
            <button
              className="button primary"
              onClick={() => {
                history.push('/credit-transactions/transfers/add');
              }}
              type="button"
            >
              New Credit Transfer
            </button>
          )}
        </span>
      </div>

      <div className="row">
        <div className="col-md-12">
          <CreditTransfersListTable
            items={creditTransfers}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

CreditTransfersListPage.defaultProps = {};

CreditTransfersListPage.propTypes = {
  creditTransfers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditTransfersListPage;
