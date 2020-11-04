import React from 'react';
import PropTypes from 'prop-types';

import ActionBarGov from '../../vehicles/components/ActionBarGov';
import Button from '../../app/components/Button';
import CustomPropTypes from '../../app/utilities/props';
import Loading from '../../app/components/Loading';
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations';
import VehicleListTable from '../../vehicles/components/VehicleListTable';

const VehicleSupplierZEVListPage = (props) => {
  const {
    filtered, handleClear, loading, locationState, setFiltered, user, vehicles,
  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="row mt-3 mb-2">
        <div className="col-lg-12 col-xl-4 d-flex align-items-end">
          <h2>ZEV Model Lineup</h2>
        </div>
        <div className="col-lg-12 col-xl-8 text-right">
          <ActionBarGov
            filtered={filtered}
            handleClear={handleClear}
            setFiltered={setFiltered}
            showOrganization={false}
            vehicles={vehicles}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <VehicleListTable
            filtered={filtered}
            items={vehicles}
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

VehicleSupplierZEVListPage.defaultProps = {
  locationState: undefined,
  vehicles: [],
};

VehicleSupplierZEVListPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleClear: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
  setFiltered: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape({})),
};

export default VehicleSupplierZEVListPage;
