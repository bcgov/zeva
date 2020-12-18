import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import CreditTransfersListTable from './CreditTransfersListTable';
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers';

const CreditTransfersListPage = (props) => {
  const {
    creditTransfers,
    loading,
    user,
    filtered,
    setFiltered,
  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>Light Duty Vehicle Credit Transfers</h2>
        </div>
        {!user.isGovernment
        && typeof user.hasPermission === 'function'
        && user.hasPermission('CREATE_CREDIT_TRANSFERS')
        && (
        <div className="col-md-4 text-right">
          <button
            className="button primary"
            onClick={() => {
              history.push(ROUTES_CREDIT_TRANSFERS.NEW);
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
            filtered={filtered}
            setFiltered={setFiltered}
          />
        </div>
      </div>
    </div>
  );
};

CreditTransfersListPage.defaultProps = {
  filtered: undefined,
  setFiltered: undefined,
};

CreditTransfersListPage.propTypes = {
  creditTransfers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  filtered: PropTypes.arrayOf(PropTypes.shape()),
  loading: PropTypes.bool.isRequired,
  setFiltered: PropTypes.func,
  user: CustomPropTypes.user.isRequired,
};

export default CreditTransfersListPage;
