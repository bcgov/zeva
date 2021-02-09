import axios from 'axios';
import React, { useEffect, useState } from 'react';

import ROUTES_VEHICLES from '../app/routes/Vehicles';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import SupplierInformationDetailsPage from './components/SupplierInformationDetailsPage';

const SupplierInformationContainer = (props) => {
  const { keycloak, user } = props;
  const reportStatuses = {
    assessment: '',
    consumerSales: '',
    creditActivity: '',
    reportSummary: '',
    supplierInformation: 'draft',
  };
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [make, setMake] = useState('');
  const [orgMakes, setOrgMakes] = useState([]);

  const handleChangeMake = (event) => {
    const { value } = event.target;
    setMake(value);
  };

  const handleDeleteMake = (index) => {
    makes.splice(index, 1);
    setMakes([...makes]);
  };

  const handleSubmitMake = (event) => {
    event.preventDefault();

    setMake('');
    setMakes([...makes, make]);
  };

  const refreshDetails = () => {
    axios.get(ROUTES_VEHICLES.LIST).then((response) => {
      const { data } = response;
      setOrgMakes([...new Set(data.map((vehicle) => vehicle.make.toUpperCase()))]);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <>
      <ComplianceReportTabs active="supplier-information" reportStatuses={reportStatuses} user={user} />
      <SupplierInformationDetailsPage
        handleChangeMake={handleChangeMake}
        handleDeleteMake={handleDeleteMake}
        handleSubmitMake={handleSubmitMake}
        loading={loading}
        make={make}
        makes={makes}
        orgMakes={orgMakes}
        user={user}
      />
    </>
  );
};

SupplierInformationContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SupplierInformationContainer;
