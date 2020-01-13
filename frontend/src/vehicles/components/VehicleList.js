import React from 'react';
import PropTypes from 'prop-types';

const VehicleList = (props) => (
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
      {props.vehicles.map(v => (<tr key={v.id}>
        <td>{v.make}</td>
        <td>{v.model}</td>
        <td>{v.trim}</td>

        <td>{v.type}</td>
        <td>{v.range}</td>
        <td>{v.modelYear.name}</td>
        <td>{v.validated ? 'Yes' : 'No'}</td>
        <td>{(v.creditValue && v.creditValue.a) ? v.creditValue.a : ''}</td>
        <td>{(v.creditValue && v.creditValue.b) ? v.creditValue.b : ''}</td>
      </tr>))}
      </tbody>
    </table>
  </div>
);

VehicleList.defaultProps = {};

VehicleList.propTypes = {
  vehicles: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VehicleList;
