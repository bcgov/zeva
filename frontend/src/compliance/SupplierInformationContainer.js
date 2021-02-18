import axios from 'axios';
import React, { useEffect, useState } from 'react';
import moment from 'moment-timezone';
import { useParams } from 'react-router-dom';
import history from '../app/History';

import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import SupplierInformationDetailsPage from './components/SupplierInformationDetailsPage';

const SupplierInformationContainer = (props) => {
  const { keycloak, user } = props;
  const { id } = useParams();
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

  const handleChangeMake = (event) => {
    const { value } = event.target;
    setMake(value.toUpperCase());
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

  const handleSubmit = (event) => {
    event.preventDefault();
    console.error(moment().year());

    const data = {
      makes,
      modelYear: moment().year(),
    };

    axios.post(ROUTES_COMPLIANCE.REPORTS, data).then((response) => {
      history.push(ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION.replace(':id', response.data.id));
    });
  };

  const refreshDetails = () => {
    axios.get(ROUTES_VEHICLES.LIST).then((response) => {
      const { data } = response;
      setMakes([...new Set(data.map((vehicle) => vehicle.make.toUpperCase()))]);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <>
      <ComplianceReportTabs
        active="supplier-information"
        reportStatuses={reportStatuses}
        id={id}
        user={user}
      />
      <SupplierInformationDetailsPage
        handleChangeMake={handleChangeMake}
        handleDeleteMake={handleDeleteMake}
        handleSubmit={handleSubmit}
        handleSubmitMake={handleSubmitMake}
        loading={loading}
        make={make}
        makes={makes}
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
