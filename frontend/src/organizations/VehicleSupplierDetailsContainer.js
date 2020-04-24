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
import VehicleSupplierEditForm from './components/VehicleSupplierEditForm';
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs';
import VehicleSupplierZEVListPage from './components/VehicleSupplierZEVListPage';
import History from '../app/History';

const VehicleSupplierDetailsContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState('supplier-info');
  const [editForm, setEditForm] = useState(false);
  const { keycloak } = props;

  const refreshDetails = () => {
    setLoading(true);

    const detailsPromise = axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails(response.data);
    });

    const vehiclesPromise = axios.get(ROUTES_VEHICLES.LIST).then((response) => {
      setVehicles(response.data);
    });

    Promise.all([detailsPromise, vehiclesPromise]).then(() => {
      setLoading(false);
    });
    console.log(editForm)
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  const editButton = (
    <button
      className="button primary"
      onClick={() => {
        setEditForm(true);
        History.push(ROUTES_ORGANIZATIONS.EDIT.replace(/:id/gi, id));
      }}
      type="button"
    >
      <FontAwesomeIcon icon="edit" /> Edit
    </button>
  );
  const handleInputChange = (event) => {
    const { value, name } = event.target;
    console.log(value);
  };
  const handleSubmit = () => {
    console.log('submit!');
  };
  return (
    <div>
      <div className="row">
        <div className="col-sm-12">
          <h1>{details.name}</h1>
        </div>
      </div>
      <VehicleSupplierTabs supplierId={details.id} active={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'supplier-info' && editForm === false
      && (
        <VehicleSupplierDetailsPage
          details={details}
          loading={loading}
          vehicles={vehicles}
          editButton={editButton}
        />
      )}
      {activeTab === 'supplier-info' && editForm === true
      && (
        <VehicleSupplierEditForm setEditForm={setEditForm} details={details} handleInputChange={handleInputChange} loading={loading} handleSubmit={handleSubmit} />
      )}
      {activeTab === 'supplier-zev-models'
      && (
        <VehicleSupplierZEVListPage
          loading={loading}
          vehicles={vehicles}
        />
      )}
      {activeTab === 'transactions'
        && (
          <CreditTransactions title="Credit Transactions" items={creditTransactions} />
        )}
    </div>
  );
};
VehicleSupplierDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default VehicleSupplierDetailsContainer;
