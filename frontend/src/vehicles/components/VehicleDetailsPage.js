import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import DetailField from '../../app/components/DetailField';
import VehicleHistoryTable from './VehicleHistoryTable';
import history from '../../app/History';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';
import formatStatus from '../../app/utilities/formatStatus';

const VehicleDetailsPage = (props) => {
  const { details, loading, requestStateChange } = props;

  if (loading) {
    return <Loading />;
  }
  const { id } = details;

  const editButton = (
    <button
      className="button primary"
      onClick={() => {
        history.push(ROUTES_VEHICLES.EDIT.replace(/:id/gi, id));
      }}
      type="button"
    >
      <FontAwesomeIcon icon="edit" /> Edit
    </button>
  );
  return (
    <div id="vehicle-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Vehicle Details</h1>
        </div>
      </div>
      <div className="row align-items-center">
        <div className="col-sm-12">
          <DetailField label="Make" value={details.make} />
          <DetailField label="Model" value={details.modelName} />
          <DetailField label="Type" value={details.vehicleZevType.description} />
          <DetailField label="Range" value={details.range} />
          <DetailField label="Model Year" value={details.modelYear.name} />
          <DetailField className="text-capitalize" label="Status" value={formatStatus(details.validationStatus)} />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <h1>Vehicle Status History</h1>
        </div>
        <div className="col-sm-12">
          <VehicleHistoryTable items={details.history} />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  history.goBack();
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> Back
              </button>
            </span>
            <span className="right-content">
              {details.validationStatus === 'DRAFT' ? editButton : '' }
              {details.actions.map((action) => (
                <button className="button primary" type="button" key={action} onClick={() => requestStateChange(action)}>
                  Set status to {action}
                </button>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>


  );
};

VehicleDetailsPage.defaultProps = {};

VehicleDetailsPage.propTypes = {
  details: PropTypes.shape({
    id: PropTypes.any,
    actions: PropTypes.arrayOf(PropTypes.string),
    history: PropTypes.arrayOf(PropTypes.object),
    make: PropTypes.string,
    modelName: PropTypes.string,
    vehicleZevType: PropTypes.shape({
      description: PropTypes.string,
    }),
    range: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    modelYear: PropTypes.shape({
      name: PropTypes.string,
    }),
    validationStatus: PropTypes.string,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  requestStateChange: PropTypes.func.isRequired,
};

export default VehicleDetailsPage;
