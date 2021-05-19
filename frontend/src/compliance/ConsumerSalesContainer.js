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
  const [calculated, setCalculated] = useState(false);

  const { id } = useParams();
  let supplierClass = '';
  let supplierClassText = '';

  const averageLdvSales = (paramFirstYear, paramSecondYear, paramThirdYear, paramCurrentYear) => {
    let avg = 0;
    if (paramFirstYear > 0 && paramSecondYear > 0 && paramThirdYear > 0) {
      const sum = (paramFirstYear + paramSecondYear + paramThirdYear)
      avg = sum / 3;
      setAvgSales(Math.round(avg));
      setCalculated(true);
    } else if ((paramFirstYear == 0 || paramSecondYear == 0 || paramThirdYear == 0) && paramCurrentYear) {
      setAvgSales(parseInt(paramCurrentYear, 10));
      setCalculated(false);
    } else if ((paramFirstYear == 0 || paramSecondYear == 0 || paramThirdYear == 0) && salesInput) {
      setAvgSales(salesInput);
      setCalculated(false);
    } else {
      setAvgSales(0);
    }
  };

  const refreshDetails = (showLoading) => {
    setLoading(showLoading);

    axios.all([
      axios.get(ROUTES_VEHICLES.VEHICLES_SALES.replace(':id', modelYear)),
      axios.get(ROUTES_COMPLIANCE.RETRIEVE_CONSUMER_SALES.replace(':id', id)),
      axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)),
    ]).then(axios.spread((vehiclesSales, consumerSalesResponse, statusesResponse) => {
      const {
        previousSales,
        vehicleList,
        confirmations,
        organizationName,
        ldvSales,
        modelYearReportHistory,
        validationStatus,
      } = consumerSalesResponse.data;

      if (ldvSales > 0) {
        setSalesInput(ldvSales);
      }

      if (previousSales.length === 3) {
        setPreviousYearsExist(true);
        setPreviousYearsList(previousSales);
        averageLdvSales(
          parseInt(previousSales[0].ldvSales, 10),
          parseInt(previousSales[1].ldvSales, 10),
          parseInt(previousSales[2].ldvSales, 10),
          ldvSales,
        );
      } else {
        setAvgSales(ldvSales);
      }

      if (vehicleList.length > 0) {
        setVehicles(vehicleList);
      } else {
        setVehicles(vehiclesSales.data);
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
      setFirstYear({ ...firstYear, modelYear: year - 1 });
      setSecondYear({ ...secondYear, modelYear: year - 2 });
      setThirdYear({ ...thirdYear, modelYear: year - 3});
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

  const handleInputChange = (event) => {
    const { id: inputId, value } = event.target;
    if (inputId === 'first') {
      if (value === '' || value == 0) {
        setFirstYear({ ...firstYear, ldvSales: 0 });
        averageLdvSales(0, secondYear.ldvSales, thirdYear.ldvSales);
      } else {
        setFirstYear({ ...firstYear, ldvSales: parseInt(value, 10) });
        averageLdvSales(parseInt(value, 10), secondYear.ldvSales, thirdYear.ldvSales);
      }
    }
    if (inputId === 'second') {
      if (value === '' || value == 0) {
        setSecondYear({ ...secondYear, ldvSales: 0 });
        averageLdvSales(firstYear.ldvSales, 0, thirdYear.ldvSales);
      } else {
        setSecondYear({ ...secondYear, ldvSales: parseInt(value, 10) });
        averageLdvSales(firstYear.ldvSales, parseInt(value, 10), thirdYear.ldvSales);
      }
    }
    if (inputId === 'third') {
      if (value === '' || value == 0) {
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
    } else if (avg >= 5000) {
      supplierClass = 'Large Volume Supplier';
      supplierClassText = '(5,000 or more total LDV sales)';
    }
    return [supplierClass, supplierClassText];
  };

  const handleChange = (event) => {
    setSalesInput(parseInt(event.target.value, 10));
    if (!calculated && event.target.value) {
      averageLdvSales(firstYear.ldvSales, secondYear.ldvSales, thirdYear.ldvSales, event.target.value);
    }
    if (!calculated && !event.target.value) {
      setAvgSales(0);
    }
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
