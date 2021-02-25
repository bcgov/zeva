import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ConsumerSalesDetailsPage from './components/ConsumerSalesDetailsPage';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';

const ConsumerSalesContainer = (props) => {
  const { keycloak, user } = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [salesInput, setSalesInput] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [checkboxes, setCheckboxes] = useState([]);
  const [disabledCheckboxes, setDisabledCheckboxes] = useState('');
  const { id } = useParams();
  let previousSales = [
    { id: 1, modelYear: 2017, ldvSales: 7789 },
    { id: 2, modelYear: 2018, ldvSales: 8123 },
    { id: 3, modelYear: 2019, ldvSales: 9456 },
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
    axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((response) => {
      let filteredAsserstions = response.data.filter((data) => data.module == 'consumer_sales');
      setAssertions(filteredAsserstions);
    });
  };

  const handleChange = (event) => {
    setSalesInput(event.target.value);
  };

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter((each) => Number(each) !== Number(event.target.id));
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id);
      setCheckboxes(checked);
    }
  };

  const handleSave = () => {
    if (!salesInput) {
      setError(true);
    } else {
      setError(false);
      axios
        .post(ROUTES_COMPLIANCE.VEHICLES, {
          data: vehicles,
          ldvSales: salesInput,
          modelYearReportId: id,
          previousSales: previousSales,
          confirmation: checkboxes
        })
        .then(() => {
          setConfirmed(true)
          setDisabledCheckboxes('disabled');
          setReadOnly(true);
        })
        .catch((error) => {
          const { response } = error;
          if (response.status === 400) {
            setErrorMessage(error.response.data.status);
          }
        });
    }
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
        error={error}
        readOnly={readOnly}
        assertions={assertions}
        checkboxes={checkboxes}
        disabledCheckboxes={disabledCheckboxes}
        handleCheckboxClick={handleCheckboxClick}
      />
    </>
  );
};
ConsumerSalesContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ConsumerSalesContainer;
