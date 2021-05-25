import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import CONFIG from '../app/config';
import history from '../app/History';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ConsumerSalesDetailsPage from './components/ConsumerSalesDetailsPage';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';

const ConsumerSalesContainer = (props) => {
  const { keycloak, user } = props;
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [checkboxes, setCheckboxes] = useState([]);
  const [disabledCheckboxes, setDisabledCheckboxes] = useState('');
  const [modelYear, setModelYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [details, setDetails] = useState({});
  const [statuses, setStatuses] = useState({});
  const { id } = useParams();

  const refreshDetails = (showLoading) => {
    setLoading(showLoading);

    axios.all([
      axios.get(ROUTES_COMPLIANCE.RETRIEVE_CONSUMER_SALES.replace(':id', id)),
      axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)),
    ]).then(axios.spread((consumerSalesResponse, statusesResponse) => {
      const {
        vehicleList,
        confirmations,
        organizationName,
        modelYearReportHistory,
        validationStatus,
      } = consumerSalesResponse.data;


      if (vehicleList.length > 0) {
        setVehicles(vehicleList);
      }

      setDetails({
        organization: {
          name: organizationName,
        },
        consumerSales: {
          history: modelYearReportHistory,
          validationStatus,
        },
      });

      if (confirmations.length > 0) {
        setConfirmed(true);
        setCheckboxes(confirmations);
      }

      const {
        modelYear: reportModelYear,
        statuses: reportStatuses,
      } = statusesResponse.data;

      const year = parseInt(reportModelYear.name, 10);

      setModelYear(year);
      setStatuses(reportStatuses);

      setLoading(false);
    }));

    axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((response) => {
      const filteredAssertions = response.data.filter((data) => data.module === 'consumer_sales');
      setAssertions(filteredAssertions);
    });
  };

  const handleCancelConfirmation = () => {
    const data = {
      delete_confirmations: true,
      module: 'consumer_sales',
    };

    axios.patch(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id), data).then((response) => {
      history.push(ROUTES_COMPLIANCE.REPORTS);
      history.replace(ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES.replace(':id', response.data.id));
    });
  };

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter(
        (each) => Number(each) !== Number(event.target.id)
      );
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id);
      setCheckboxes(checked);
    }
  };

  const handleSave = () => {
      axios.post(ROUTES_COMPLIANCE.CONSUMER_SALES, {
        data: vehicles,
        modelYearReportId: id,
        confirmation: checkboxes,
      }).then(() => {
        history.push(ROUTES_COMPLIANCE.REPORTS);
        history.replace(ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES.replace(':id', id));
      }).catch((error) => {
        const { response } = error;
        if (response.status === 400) {
          setErrorMessage(error.response.data.status);
        }
      });
    }
  

  useEffect(() => {
    refreshDetails(true);
  }, [keycloak.authenticated, modelYear]);

  return (
    <>
      <ComplianceReportTabs
        active="consumer-sales"
        reportStatuses={statuses}
        user={user}
      />
      <ConsumerSalesDetailsPage
        user={user}
        loading={loading}
        handleSave={handleSave}
        vehicles={vehicles}
        confirmed={confirmed}
        assertions={assertions}
        checkboxes={checkboxes}
        disabledCheckboxes={disabledCheckboxes}
        handleCheckboxClick={handleCheckboxClick}
        details={details}
        modelYear={modelYear}
        statuses={statuses}
        errorMessage={errorMessage}
        id={id}
        handleCancelConfirmation={handleCancelConfirmation}
      />
    </>
  );
};

ConsumerSalesContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ConsumerSalesContainer;
