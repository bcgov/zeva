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
    handleCheckboxClick,
    handleSubmit,
  } = props;

  if (loading) {
    return <Loading />;
  }

  const actionBar = user.isGovernment 
    ? <ActionBarGov handleSubmit={handleSubmit} vehicles={vehicles} /> : <ActionBarNonGov />;

  return (
    <div id="organization-list" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>ZEV Models</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          {actionBar}
          <VehicleListTable items={vehicles} user={user} handleCheckboxClick={handleCheckboxClick} />
          {actionBar}
        </div>
      </div>
    </div>
  );
};

VehicleList.defaultProps = {};

VehicleList.propTypes = {
  loading: PropTypes.bool.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VehicleList;
