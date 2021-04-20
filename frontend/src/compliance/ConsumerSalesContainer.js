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
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [salesInput, setSalesInput] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [checkboxes, setCheckboxes] = useState([]);
  const [disabledCheckboxes, setDisabledCheckboxes] = useState('');
  const [modelYear, setModelYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [firstYear, setFirstYear] = useState({ modelYear: modelYear - 1, ldvSales: 0 });
  const [secondYear, setSecondYear] = useState({ modelYear: modelYear - 2, ldvSales: 0 });
  const [thirdYear, setThirdYear] = useState({ modelYear: modelYear - 3, ldvSales: 0 });
  const [avgSales, setAvgSales] = useState(0);
  const [previousYearsExist, setPreviousYearsExist] = useState(false);
  const [previousYearsList, setPreviousYearsList] = useState([{}]);
  const [details, setDetails] = useState({});
  const [statuses, setStatuses] = useState({});

  const { id } = useParams();
  let supplierClass = '';
  let supplierClassText = '';

  const averageLdvSales = (paramFirstYear, paramSecondYear, paramThirdYear) => {
    let avg = 0;
    const sum = (paramFirstYear + paramSecondYear + paramThirdYear)
    avg = sum / 3;
    setAvgSales(Math.round(avg));
  };

  const refreshDetails = (showLoading) => {
    setLoading(showLoading);
    axios.all([
      axios.get(ROUTES_VEHICLES.VEHICLES_SALES),
      axios.get(ROUTES_COMPLIANCE.RETRIEVE_CONSUMER_SALES.replace(':id', id)),
    ]).then(axios.spread((vehiclesSales, consumerSalesResponse) => {
      const {
        previousSales,
        vehicleList,
        confirmations,
        organizationName,
        ldvSales,
        modelYearReportHistory,
        validationStatus,
      } = consumerSalesResponse.data;

      if (previousSales.length === 3) {
        setPreviousYearsExist(true);
        setPreviousYearsList(previousSales);
        averageLdvSales(
          parseInt(previousSales[0].previousSales, 10),
          parseInt(previousSales[1].previousSales, 10),
          parseInt(previousSales[2].previousSales, 10)
        );
      }

      if (vehicleList.length > 0) {
        setVehicles(vehicleList);
      } else {
        setVehicles(vehiclesSales.data);
      }
      if (ldvSales > 0) {
        setSalesInput(ldvSales);
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
      setLoading(false);
    }));

    axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST)
      .then((response) => {
        const filteredAssertions = response.data.filter((data) => data.module === 'consumer_sales');
        setAssertions(filteredAssertions);
      });

    if (id && id !== 'new') {
      axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)).then((response) => {
        const {
          modelYear: reportModelYear,
          statuses: reportStatuses,
        } = response.data;

        const year = parseInt(reportModelYear.name, 10);

        setModelYear(year);
        setFirstYear({ modelYear: year - 1, ldvSales: 0 });
        setSecondYear({ modelYear: year - 2, ldvSales: 0 });
        setThirdYear({ modelYear: year - 3, ldvSales: 0 });

        setStatuses(reportStatuses);
      });
    }
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

  const handleInputChange = (event) => {
    const { id: inputId, value } = event.target;
    if (inputId === 'first') {
      if (value === '') {
        setFirstYear({ ...firstYear, ldvSales: 0 });
        averageLdvSales(0, secondYear.ldvSales, thirdYear.ldvSales);
      } else {
        setFirstYear({ ...firstYear, ldvSales: parseInt(value, 10) });
        averageLdvSales(parseInt(value, 10), secondYear.ldvSales, thirdYear.ldvSales);
      }
    }
    if (inputId === 'second') {
      if (value === '') {
        setSecondYear({ ...secondYear, ldvSales: 0 });
        averageLdvSales(firstYear.ldvSales, 0, thirdYear.ldvSales);
      } else {
        setSecondYear({ ...secondYear, ldvSales: parseInt(value, 10) });
        averageLdvSales(firstYear.ldvSales, parseInt(value, 10), thirdYear.ldvSales);
      }
    }
    if (inputId === 'third') {
      if (value === '') {
        setThirdYear({ ...thirdYear, ldvSales: 0 });
        averageLdvSales(firstYear.ldvSales, secondYear.ldvSales, 0);
      } else {
        setThirdYear({ ...thirdYear, ldvSales: parseInt(value, 10) });
        averageLdvSales(firstYear.ldvSales, secondYear.ldvSales, parseInt(value, 10));
      }
    }
  };

  const vehicleSupplierClass = (avg) => {
    if (avg < 1000) {
      supplierClass = 'Small Volume Supplier';
      supplierClassText = '(less than 1,000 total LDV sales)';
    } else if (avg < 5000) {
      supplierClass = 'Medium Volume Supplier';
      supplierClassText = '(1,000 to 4,999 total LDV sales)';
    } else if (avg > 5000) {
      supplierClass = 'Large Volume Supplier';
      supplierClassText = '(5,000 or more total LDV sales)';
    }
    return [supplierClass, supplierClassText];
  };

  const handleChange = (event) => {
    setSalesInput(parseInt(event.target.value, 10));
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
    const previousSalesInfo = [firstYear, secondYear, thirdYear];
    if (!salesInput) {
      setError(true);
    } else {
      setError(false);
      axios.post(ROUTES_COMPLIANCE.CONSUMER_SALES, {
        data: vehicles,
        ldvSales: salesInput,
        modelYearReportId: id,
        previousSales: previousSalesInfo,
        previousYearsExist,
        supplierClass: supplierClass.charAt(0),
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
  };

  useEffect(() => {
    refreshDetails(true);
    averageLdvSales(
      firstYear.ldvSales,
      secondYear.ldvSales,
      thirdYear.ldvSales,
    );
  }, [keycloak.authenticated]);

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
        handleChange={handleChange}
        vehicles={vehicles}
        confirmed={confirmed}
        error={error}
        assertions={assertions}
        checkboxes={checkboxes}
        disabledCheckboxes={disabledCheckboxes}
        handleCheckboxClick={handleCheckboxClick}
        handleInputChange={handleInputChange}
        avgSales={avgSales}
        vehicleSupplierClass={vehicleSupplierClass}
        previousYearsExist={previousYearsExist}
        previousYearsList={previousYearsList}
        salesInput={salesInput}
        details={details}
        modelYear={modelYear}
        firstYear={firstYear.modelYear}
        secondYear={secondYear.modelYear}
        thirdYear={thirdYear.modelYear}
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
