import React from 'react';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import DetailField from '../../app/components/DetailField';

const VehicleDetailsPage = (props) => {
  const { details, loading } = props;

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
          <DetailField label="Class A Credits" value={(details.creditValue && details.creditValue.a) ? details.creditValue.a : ''} />
          <DetailField label="Class B Credits" value={(details.creditValue && details.creditValue.b) ? details.creditValue.b : ''} />
          <DetailField label="Validated" value={details.validated ? 'Yes' : 'No'} />
        </div>
      </div>

    </div>


  );
};

VehicleDetailsPage.defaultProps = {
};

VehicleDetailsPage.propTypes = {
  details: PropTypes.shape({
    id: PropTypes.any,
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
    validated: PropTypes.bool,

  }).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default VehicleDetailsPage;
