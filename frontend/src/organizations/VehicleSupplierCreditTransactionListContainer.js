/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import CustomPropTypes from '../app/utilities/props';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs';
import VehicleSupplierSalesListPage from './components/VehicleSupplierSalesListPage';

const VehicleSupplierCreditTransactionListContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const { keycloak } = props;

  const refreshDetails = () => {
    setLoading(true);
    const detailsPromise = axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails(response.data);
    });

    const salesPromise = axios.get(ROUTES_ORGANIZATIONS.SALES.replace(/:id/gi, id)).then((response) => {
      setSales(response.data);
    });

    Promise.all([detailsPromise, salesPromise]).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <div className="page">
      <h1 className="mb-2">{details.name}</h1>
      <VehicleSupplierTabs supplierId={details.id} active="supplier-credit-transactions" />
      <VehicleSupplierSalesListPage
        filtered={filtered}
        loading={loading}
        sales={sales}
        setFiltered={setFiltered}
        user={{ isGovernment: false }}
      />
    </div>
  );
};
VehicleSupplierCreditTransactionListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default VehicleSupplierCreditTransactionListContainer;
