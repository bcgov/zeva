import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ConsumerSalesDetailsPage from './components/ConsumerSalesDetailsPage';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ROUTES_VEHICLES from '../app/routes/Vehicles';

const ConsumerSalesContainer = (props) => {
  const { keycloak, user } = props;
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState([]);
  const [salesInput, setSalesInput] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const { id } = useParams();
  let previousSales = [
     { id:1, modelYear: 2017, ldvSales: 7789 },
     { id:2, modelYear: 2018, ldvSales: 8123 },
     { id:3, modelYear: 2019, ldvSales: 9456 },
  ];

  const reportStatuses = {
    assessment: '',
    consumerSales: 'draft',
    creditActivity: '',
    reportSummary: '',
    supplierInformation: '',
  };

  const refreshDetails = (showLoading) => {
    setLoading(showLoading);
    axios.get(ROUTES_VEHICLES.VEHICLES_SALES).then((response) => {
      setVehicles(response.data);
      setLoading(false);
    });
  };

  const handleChange = (event) => {
    setSalesInput(event.target.value);
  };

  const handleSave = () => {
    axios
      .post(ROUTES_COMPLIANCE.VEHICLES, {
        data: vehicles,
        ldvSales: salesInput,
        modelYearReportId: id,
        previousSales: previousSales
      })
      .then(() => setConfirmed(true))
      .catch((error) => {
        const { response } = error;
        if (response.status === 400) {
          setErrorMessage(error.response.data.status);
        }
      });
  };

  useEffect(() => {
    refreshDetails(true);
  }, [keycloak.authenticated]);

  return (
    <>
      <ComplianceReportTabs
        active="consumer-sales"
        reportStatuses={reportStatuses}
        user={user}
      />
      <ConsumerSalesDetailsPage
        user={user}
        loading={loading}
        handleSave={handleSave}
        handleChange={handleChange}
        vehicles={vehicles}
        confirmed={confirmed}
        previousSales={previousSales}
      />
    </>
  );
};
ConsumerSalesContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ConsumerSalesContainer;
