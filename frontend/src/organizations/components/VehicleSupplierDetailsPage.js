import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import History from '../../app/History';
import Loading from '../../app/components/Loading';
import VehiclesTable from './VehiclesTable';

const VehicleSupplierDetailsPage = (props) => {
  const { details, loading, vehicles } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="vehicle-supplier-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>{details.name}</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-6">
          {details.organizationAddress && (
            <div className="organization-address">
              {details.organizationAddress.addressLine1}
              <br />
              {details.organizationAddress.city} {details.organizationAddress.state}
              <br />
              {details.organizationAddress.postalCode}
            </div>
          )}
          <a href="#">Edit address</a>
        </div>

        <div className="col-sm-6">
          <div className="organization-info">
            Organization Class: {(details.id % 2) ? 'Medium' : 'Large'}
            <br />
            2019 Compliance target: 55,000
            <br />
            Credit balance: 23,000-A / 28,000-B
          </div>
        </div>
      </div>

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

          <VehiclesTable
            items={vehicles}
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

VehicleSupplierDetailsPage.defaultProps = {
  vehicles: [],
};

VehicleSupplierDetailsPage.propTypes = {
  details: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    organizationAddress: PropTypes.shape({
      addressLine1: PropTypes.string,
      addressLine2: PropTypes.string,
      addressLine3: PropTypes.string,
      city: PropTypes.string,
      postalCode: PropTypes.string,
      state: PropTypes.string,
    }),
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape({})),
};

export default VehicleSupplierDetailsPage;
