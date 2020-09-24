import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import History from '../../app/History';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ActionBarGov from '../../vehicles/components/ActionBarGov';
import VehicleListTable from '../../vehicles/components/VehicleListTable';

const VehicleSupplierZEVListPage = (props) => {
  const {
    filtered, handleClear, loading, setFiltered, user, vehicles,
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
    </div>
  );
};

VehicleSupplierZEVListPage.defaultProps = {
  vehicles: [],
};

VehicleSupplierZEVListPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleClear: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setFiltered: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape({})),
};

export default VehicleSupplierZEVListPage;
