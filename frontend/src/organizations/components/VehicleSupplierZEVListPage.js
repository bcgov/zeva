import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import History from '../../app/History';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import VehicleListTable from '../../vehicles/components/VehicleListTable';

const VehicleSupplierZEVListPage = (props) => {
  const { loading, user, vehicles } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="row mt-5">
        <div className="col-sm-12">
          <h2>ZEV Lineup Model Year 2019</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  History.goBack();
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> <span>Back</span>
              </button>
            </span>

            <span className="right-content">
              Select a different model year

              <select>
                <option>2019</option>
              </select>
            </span>
          </div>

          <VehicleListTable
            items={vehicles}
            user={user}
          />

          <div className="action-bar">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  History.goBack();
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> <span>Back</span>
              </button>
            </span>

            <span className="right-content">
              Select a different model year

              <select>
                <option>2019</option>
              </select>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

VehicleSupplierZEVListPage.defaultProps = {
  vehicles: [],
};

VehicleSupplierZEVListPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape({})),
};

export default VehicleSupplierZEVListPage;
