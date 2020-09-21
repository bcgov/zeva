import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
      <div className="row mb-3">
        <div className="col-md-8">
          <h2 className="py-0">Light Duty Vehicle Credit Transfers</h2>
        </div>
        {!user.isGovernment && (
        <div className="col-md-4 text-right">
          <button
            className="button primary"
            onClick={() => {
              history.push('/credit-transactions/transfers/add');
            }}
            type="button"
          >
            <FontAwesomeIcon icon="plus" /> New Credit Transfer
          </button>
        </div>
        )}
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
