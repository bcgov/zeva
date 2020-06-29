import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../../app/components/Loading';
import VehicleListTable from './VehicleListTable';
import ActionBarGov from './ActionBarGov';
import ActionBarNonGov from './ActionBarNonGov';

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

  const actionBar = user.isGovernment
    ? <ActionBarGov vehicles={vehicles} handleClear={handleClear} filtered={filtered} setFiltered={setFiltered} /> : <ActionBarNonGov />;

  return (
    <div id="vehicle-list" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>ZEV Models</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          {actionBar}
          <VehicleListTable
            filtered={filtered}
            setFiltered={setFiltered}
            items={vehicles}
            user={user}
          />
          {actionBar}
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
