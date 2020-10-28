import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../app/components/Button';
import CustomPropTypes from '../../app/utilities/props';
import Loading from '../../app/components/Loading';
import CreditRequestListTable from '../../credits/components/CreditRequestListTable';
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations';

const VehicleSupplierSalesListPage = (props) => {
  const {
    loading, locationState, sales, user, filtered, setFiltered,
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
          <CreditRequestListTable
            filtered={filtered}
            items={sales}
            setFiltered={setFiltered}
            user={user}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_ORGANIZATIONS.LIST}
                locationState={locationState}
              />
            </span>
            <span className="right-content" />
          </div>
        </div>
      </div>
    </div>
  );
};

VehicleSupplierSalesListPage.defaultProps = {
  locationState: undefined,
  sales: [],
};

VehicleSupplierSalesListPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
  sales: PropTypes.arrayOf(PropTypes.shape({})),
  setFiltered: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default VehicleSupplierSalesListPage;
