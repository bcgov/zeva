/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import CustomPropTypes from '../app/utilities/props';
import VehicleSupplierDetailsPage from './components/VehicleSupplierDetailsPage';
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs';
import History from '../app/History';

const VehicleSupplierDetailsContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [display, setDisplay] = useState({});
  const { keycloak } = props;


  const refreshDetails = () => {
    setLoading(true);
    const detailsPromise = axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails({
        ...response.data,
        organizationAddress: {
          ...response.data.organizationAddress,
          addressLine_1: response.data.organizationAddress ? response.data.organizationAddress.addressLine1 : '',
          addressLine_2: response.data.organizationAddress ? response.data.organizationAddress.addressLine2 : '',
          addressLine_3: response.data.organizationAddress ? response.data.organizationAddress.addressLine3 : '',
        },
      });

      setDisplay(response.data);
    });

    const vehiclesPromise = axios.get(ROUTES_VEHICLES.LIST).then((response) => {
      setVehicles(response.data);
    });

    Promise.all([detailsPromise, vehiclesPromise]).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  const editButton = (
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

  return (
    <div>
      <div className="row">
        <div className="col-sm-12">
          <h1>{display.name}</h1>
        </div>
      </div>
      <VehicleSupplierTabs supplierId={details.id} active="supplier-info" />
      <VehicleSupplierDetailsPage
        details={details}
        loading={loading}
        vehicles={vehicles}
        editButton={editButton}
      />
    </div>
  );
};
VehicleSupplierDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default VehicleSupplierDetailsContainer;
