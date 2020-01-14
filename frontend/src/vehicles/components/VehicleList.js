import React from 'react';
import PropTypes from 'prop-types';

const VehicleList = (props) => {
  const { vehicles } = props;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Make</th>
            <th>Model</th>

            <th>Trim</th>
            <th>Type</th>
            <th>Range (kms)</th>
            <th>Model Year</th>
            <th>Validated</th>
            <th>A Class Credits</th>
            <th>B Class Credits</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.make}</td>
              <td>{vehicle.model}</td>
              <td>{vehicle.trim}</td>

              <td>{vehicle.type}</td>
              <td>{vehicle.range}</td>
              <td>{vehicle.modelYear.name}</td>
              <td>{vehicle.validated ? 'Yes' : 'No'}</td>
              <td>{(vehicle.creditValue && vehicle.creditValue.a) ? vehicle.creditValue.a : ''}</td>
              <td>{(vehicle.creditValue && vehicle.creditValue.b) ? vehicle.creditValue.b : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

VehicleList.defaultProps = {};

VehicleList.propTypes = {
  vehicles: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VehicleList;
