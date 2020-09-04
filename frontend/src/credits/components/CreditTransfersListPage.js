import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../../app/components/Loading';
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
      <div className="row">
        <div className="col-md-6">
          <h1>Light Duty Vehicle Credit Transfers</h1>
        </div>
        <div className="col-md-6">
          <button type="button">New Credit Transfer</button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <CreditTransfersListTable
            items={creditTransfers}
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
};

export default CreditTransfersListPage;
