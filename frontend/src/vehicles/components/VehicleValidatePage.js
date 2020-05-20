import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import DetailField from '../../app/components/DetailField';
import history from '../../app/History';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';

const VehicleValidatePage = (props) => {
  const { details, loading, requestStateChange } = props;
  console.log(details)
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
    <div id="vehicle-validation" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Validate ZEV</h1>
        </div>
      </div>

      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="form p-4">
            <DetailField label="Model Year" value={details.modelYear.name} />
            <DetailField label="Make" value={details.make} />
            <DetailField label="Model" value={details.modelName} />
            <DetailField label="ZEV Type" value={details.vehicleZevType.description} />
            <DetailField label="Electric Range (km)" value={details.range} />
            <DetailField label="Vehicle Class" value={details.vehicleClassCode.description} />
            <DetailField label="ZEV Class" value={` ${details.creditClass} (calculated)`} />
            <DetailField label="Credits" value={` ${details.creditValue} (calculated)`} />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 pt-4 pb-2">
          <div>Add a comment to the vehicle supplier (for Rejections only)</div>
          <textarea className="form-control" rows="3" />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
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

VehicleValidatePage.defaultProps = {};

VehicleValidatePage.propTypes = {
  details: PropTypes.shape({
    id: PropTypes.any,
    actions: PropTypes.arrayOf(PropTypes.string),
    creditClass: PropTypes.string,
    creditValue: PropTypes.number,
    history: PropTypes.arrayOf(PropTypes.object),
    make: PropTypes.string,
    modelName: PropTypes.string,
    vehicleClassCide: PropTypes.shape({
      description: PropTypes.string
    }),
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

export default VehicleValidatePage;
