/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { withRouter } from 'react-router';

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
  const { keycloak, location, user } = props;
  const { state: locationState } = location;

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
      <VehicleSupplierTabs locationState={locationState} supplierId={details.id} active="supplier-credit-transactions" user={user} />
      <VehicleSupplierSalesListPage
        filtered={filtered}
        loading={loading}
        locationState={locationState}
        sales={sales}
        setFiltered={setFiltered}
        user={{ isGovernment: false }}
      />
    </div>
  );
};
VehicleSupplierCreditTransactionListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
};

export default withRouter(VehicleSupplierCreditTransactionListContainer);
