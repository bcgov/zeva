/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withRouter } from 'react-router';

import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import CustomPropTypes from '../app/utilities/props';
import VehicleSupplierDetailsPage from './components/VehicleSupplierDetailsPage';
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs';
import History from '../app/History';

const VehicleSupplierDetailsContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState({});
  const { keycloak, location, user } = props;
  const { state: locationState } = location;

  const refreshDetails = () => {
    setLoading(true);

    axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails(response.data);
      setDisplay(response.data);

      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  const editButton = () => {
    if (typeof user.hasPermission === 'function'&& user.hasPermission('EDIT_ORGANIZATIONS') && user.isGovernment){
        return(
          <button
          className="button primary"
          onClick={() => {
            History.push(ROUTES_ORGANIZATIONS.EDIT.replace(/:id/gi, id));
          }}
          type="button"
          >
          <FontAwesomeIcon icon="edit" /> Edit
          </button>
        );
    }
  }

  return (
    <div className="page">
      <h1 className="mb-2">{display.name}</h1>
      <VehicleSupplierTabs locationState={locationState} supplierId={details.id} active="supplier-info" />
      <VehicleSupplierDetailsPage
        details={details}
        loading={loading}
        locationState={locationState}
        editButton={editButton()}
        user={user}
      />
    </div>
  );
};
VehicleSupplierDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(VehicleSupplierDetailsContainer);
