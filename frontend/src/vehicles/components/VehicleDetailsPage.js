import React from 'react';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import DetailField from '../../app/components/DetailField';
import VehicleHistoryTable from './VehicleHistoryTable';

const VehicleDetailsPage = (props) => {
  const { details, loading, requestStateChange } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="vehicle-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Vehicle Details</h1>
        </div>
      </div>
      <div className="row align-items-center">
        <div className="col-sm-12">
          <DetailField label="Make" value={details.make.name} />
          <DetailField label="Model" value={details.model.name} />
          <DetailField label="Trim" value={details.trim.name} />
          <DetailField label="Type" value={details.type.name} />
          <DetailField label="Range" value={details.range} />
          <DetailField label="Model Year" value={details.modelYear.name} />
          <DetailField
            label="Credit"
            value={(details.creditValue && details.creditValue.a) ? details.creditValue.a : ''}
          />
          <DetailField
            label="Class"
            value={(details.creditValue && details.creditValue.b) ? details.creditValue.b : ''}
          />
          <DetailField label="State" value={details.state} />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <h1>Vehicle State History</h1>
        </div>
        <div className="col-sm-12">
          <VehicleHistoryTable items={details.changelog} />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <span className="left-content">
              {details.actions.map((action) => (
                <button type="button" key={action} onClick={() => requestStateChange(action)}>
                  Set state to {action}
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
    actions: PropTypes.arrayOf(PropTypes.string).isRequired,
    changelog: PropTypes.arrayOf(PropTypes.object).isRequired,
    make: PropTypes.shape({
      name: PropTypes.string,
    }),
    model: PropTypes.shape({
      name: PropTypes.string,
    }),
    trim: PropTypes.shape({
      name: PropTypes.string,
    }),
    type: PropTypes.shape({
      name: PropTypes.string,
    }),
    range: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    modelYear: PropTypes.shape({
      name: PropTypes.string,
    }),
    creditValue: PropTypes.shape({
      a: PropTypes.string,
      b: PropTypes.string,
    }),
    state: PropTypes.string,
  }).isRequired,
  actions: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  requestStateChange: PropTypes.func.isRequired,
};

export default VehicleDetailsPage;
