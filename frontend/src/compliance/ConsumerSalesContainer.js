import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import CONFIG from '../app/config';
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
  const [modelYear, setModelYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [firstYear, setFirstYear] = useState({ modelYear: modelYear - 1, ldvSales: 0 });
  const [secondYear, setSecondYear] = useState({ modelYear: modelYear - 2, ldvSales: 0 });
  const [thirdYear, setThirdYear] = useState({ modelYear: modelYear - 3, ldvSales: 0 });
  const [avgSales, setAvgSales] = useState(0);

  const { id } = useParams();
  let supplierClass = '';
  let supplierClassText = '';

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
      const filteredAssertions = response.data.filter(
        (data) => data.module === 'consumer_sales',
      );
      setAssertions(filteredAssertions);
    });

    if (id && id !== 'new') {
      axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)).then((response) => {
        const {
          modelYear: reportModelYear,
        } = response.data;

        const year = parseInt(reportModelYear, 10);

        setModelYear(year);
        setFirstYear(year - 1);
        setSecondYear(year - 2);
        setThirdYear(year - 3);

        setLoading(false);
      });
    }
  };

  const averageLdvSales = (paramFirstYear, paramSecondYear, paramThirdYear) => {
    let avg = 0;
    avg = (paramFirstYear + paramSecondYear + paramThirdYear) / 3;
    setAvgSales(Math.round(avg));
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
        setSecondYear({ ...thirdYear, ldvSales: 0 });
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
      supplierClassText = '(under 1,000 total LDV sales)';
    } else if (avg < 5000) {
      supplierClass = 'Medium Volume Supplier';
      supplierClassText = '(under 5,000 total LDV sales)';
    } else if (avg > 5000) {
      supplierClass = 'Large Volume Supplier';
      supplierClassText = '(over 5,000 total LDV sales)';
    }
    return [supplierClass, supplierClassText];
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
    const previousSalesInfo = [firstYear, secondYear, thirdYear];
    if (!salesInput) {
      setError(true);
    } else {
      setError(false);
      axios
        .post(ROUTES_COMPLIANCE.VEHICLES, {
          data: vehicles,
          ldvSales: salesInput,
          modelYearReportId: id,
          previousSales: previousSalesInfo,
          supplierClass: supplierClass.charAt(0),
          confirmation: checkboxes,
        })
        .then(() => {
          setConfirmed(true);
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
    averageLdvSales(firstYear.ldvSales, secondYear.ldvSales, thirdYear.ldvSales);
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
        error={error}
        readOnly={readOnly}
        assertions={assertions}
        checkboxes={checkboxes}
        disabledCheckboxes={disabledCheckboxes}
        handleCheckboxClick={handleCheckboxClick}
        handleInputChange={handleInputChange}
        avgSales={avgSales}
        vehicleSupplierClass={vehicleSupplierClass}
        modelYear={modelYear}
        firstYear={firstYear}
        secondYear={secondYear}
        thirdYear={thirdYear}
      />
    </>
  );
};
ConsumerSalesContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ConsumerSalesContainer;
