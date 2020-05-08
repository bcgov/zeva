import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import History from '../../app/History';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';

const Actions = (props) => {
  const { details } = props;
  const [loading, setLoading] = useState(true);
  const [validatedCount, setValidatedCount] = useState(0);
  const refreshList = () => {
    axios.get(ROUTES_VEHICLES.LIST).then((response) => {
      const validatedVehicles = response.data
        .filter((vehicle) => vehicle.validationStatus === 'SUBMITTED')
        .map((vehicle) => vehicle.modelName);
      setValidatedCount(validatedVehicles.length);
      setLoading(false);
    });
  };
  useEffect(() => {
    refreshList(true);
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <div id="actions" className="dashboard-fieldset">
      <h1>Actions</h1>
      <h5 id="action-org-na">{details.organization.name} has:</h5>
      <div className="content">
        <div className="text">
          <div>
            <span className="value"> {validatedCount}</span>
            <button type="button">
             ZEV Models submitted for Validation
            </button>
          </div>
          <FontAwesomeIcon icon={['fas', 'play']} />
          <button
            type="button"
            onClick={() => { History.push(ROUTES_VEHICLES.LIST); }}
          > Manage ZEV model lineup
          </button>
        </div>
      </div>
    </div>
  );
};

Actions.defaultProps = {
};

Actions.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
};

export default Actions;
