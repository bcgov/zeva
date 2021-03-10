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
  const [firstYear, setFirstYear] = useState({modelYear:2019,ldvSales:0});
  const [secondYear, setSecondYear] = useState({modelYear:2018,ldvSales:0});
  const [thirdYear, setThirdYear] = useState({ modelYear: 2017, ldvSales: 0 });
  const [avgSales, setAvgSales] = useState(0);

  const { id } = useParams();

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
        (data) => data.module === 'consumer_sales'
      );
      setAssertions(filteredAssertions);
    });
  };

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    if (id === 'first') {
      if (value === '') {
        setFirstYear({ ...firstYear, ldvSales: 0 });
        averageLdvSales(0, secondYear.ldvSales, thirdYear.ldvSales);
      } else {
        setFirstYear({...firstYear, ldvSales: parseInt(value)});
        averageLdvSales(parseInt(value), secondYear.ldvSales, thirdYear.ldvSales);
      }
    }
    if (id === 'second') {
      if (value === '') {
        setSecondYear({ ...secondYear, ldvSales: 0 });
        averageLdvSales(firstYear.ldvSales, 0, thirdYear.ldvSales);
      } else {
        setSecondYear({...secondYear, ldvSales: parseInt(value)});
        averageLdvSales(firstYear.ldvSales, parseInt(value), thirdYear.ldvSales);
      }
    }
    if (id === 'third') {
      if (value === '') {
        setSecondYear({ ...thirdYear, ldvSales: 0 });
        averageLdvSales(firstYear.ldvSales, secondYear.ldvSales, 0);
      } else {
        setThirdYear({...thirdYear, ldvSales: parseInt(value)});
        averageLdvSales(firstYear.ldvSales, secondYear.ldvSales, parseInt(value));
      }
    }
  };

  const averageLdvSales = (firstYear, secondYear, thirdYear) => {
    let avg = 0;
    avg = (firstYear + secondYear + thirdYear) / 3;
    setAvgSales(Math.round(avg));
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
      axios.post(ROUTES_COMPLIANCE.VEHICLES, {
          data: vehicles,
          ldvSales: salesInput,
          modelYearReportId: id,
          previousSales: previousSalesInfo,
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
      />
    </>
  );
};
ConsumerSalesContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ConsumerSalesContainer;
