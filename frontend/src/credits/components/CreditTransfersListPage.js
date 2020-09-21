import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import history from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import CreditTransfersListTable from './CreditTransfersListTable';
import ROUTES_CREDITS from '../../app/routes/Credits';

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
      <div className="row mb-3">
        <div className="col-9">
          <h2 className="d-inline">Light Duty Vehicle Credit Transfers</h2>
        </div>
        <div className="col-3 text-right">
          <button
            className="button primary"
            onClick={() => {
              history.push(ROUTES_CREDITS.CREDIT_TRANSFERS_ADD);
            }}
            type="button"
          >
            <FontAwesomeIcon icon="plus" /> New Credit Transfer
          </button>
        </div>
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

CreditTransfersListPage.defaultProps = {};

CreditTransfersListPage.propTypes = {
  creditTransfers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditTransfersListPage;
