import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Loading from '../../app/components/Loading';
import history from '../../app/History';
import ActionBarGov from './ActionBarGov';
import ActionBarNonGov from './ActionBarNonGov';
import VehicleListTable from './VehicleListTable';

const VehicleList = (props) => {
  const {
    loading,
    vehicles,
    user,
    filtered,
    setFiltered,
    handleClear,

  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="vehicle-list" className="page">
      <div className="row mb-2">
        <div className="col-lg-12 col-xl-4 d-flex align-items-end">
          <h2>ZEV Models</h2>
        </div>
        <div className="col-lg-12 col-xl-8 text-right">
          {!user.isGovernment && (
            <ActionBarNonGov
              filtered={filtered}
              handleClear={handleClear}
            />
          )}
          {user.isGovernment && (
            <ActionBarGov
              filtered={filtered}
              handleClear={handleClear}
              setFiltered={setFiltered}
              vehicles={vehicles}
            />
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <VehicleListTable
            filtered={filtered}
            items={vehicles}
            setFiltered={setFiltered}
            showSupplier={user && user.isGovernment}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

VehicleList.defaultProps = {};

VehicleList.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFiltered: PropTypes.func.isRequired,
  handleClear: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    isGovernment: PropTypes.bool,
  }).isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VehicleList;
