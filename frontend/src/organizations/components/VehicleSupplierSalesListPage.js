import React from 'react';
import PropTypes from 'prop-types';

import CustomPropTypes from '../../app/utilities/props';
import Loading from '../../app/components/Loading';
import SubmissionListTable from '../../credits/components/SubmissionListTable';

const VehicleSupplierSalesListPage = (props) => {
  const {
    loading, sales, user, filtered, setFiltered,
  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="row mt-3 mb-2">
        <div className="col-12">
          <h2>Credit Transactions</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <SubmissionListTable
            filtered={filtered}
            items={sales}
            setFiltered={setFiltered}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

VehicleSupplierSalesListPage.defaultProps = {
  sales: [],
};

VehicleSupplierSalesListPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  sales: PropTypes.arrayOf(PropTypes.shape({})),
  setFiltered: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default VehicleSupplierSalesListPage;
