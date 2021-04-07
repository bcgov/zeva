import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { withRouter } from 'react-router';

import CONFIG from '../app/config';
import history from '../app/History';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import SupplierInformationDetailsPage from './components/SupplierInformationDetailsPage';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';

const qs = require('qs');

const SupplierInformationContainer = (props) => {
  const { location, keycloak, user } = props;
  const { id } = useParams();
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [disabledCheckboxes, setDisabledCheckboxes] = useState('');
  const [details, setDetails] = useState({});
  const [modelYear, setModelYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);

  const query = qs.parse(location.search, { ignoreQueryPrefix: true });

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

    const data = {
      makes,
      modelYear,
      confirmations: checkboxes,
    };

    if (id && id !== 'new') {
      axios.patch(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id), data).then((response) => {
        history.push(ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION.replace(':id', response.data.id));
        setDisabledCheckboxes('disabled');
      });
    } else {
      axios.post(ROUTES_COMPLIANCE.REPORTS, data).then((response) => {
        history.push(ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION.replace(':id', response.data.id));
        setDisabledCheckboxes('disabled');
      });
    }
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

  const refreshDetails = () => {
    if (id && id !== 'new') {
      axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)).then((response) => {
        const {
          makes: modelYearReportMakes,
          modelYearReportAddresses,
          modelYearReportHistory,
          organizationName,
          validationStatus,
          confirmations,
          modelYear: reportModelYear,
        } = response.data;

        setModelYear(parseInt(reportModelYear.name, 10));

        if (modelYearReportMakes) {
          const currentMakes = modelYearReportMakes.map((each) => (each.make));

          setMakes(currentMakes);
        }

        setDetails({
          organization: {
            name: organizationName,
            organizationAddress: modelYearReportAddresses,
          },
          supplierInformation: {
            history: modelYearReportHistory,
            validationStatus,
          },
        });
        setCheckboxes(confirmations);

        setLoading(false);
      });
    } else {
      axios.get(ROUTES_VEHICLES.LIST).then((response) => {
        const { data } = response;

        setMakes([...new Set(data.map((vehicle) => vehicle.make.toUpperCase()))]);
        setDetails({
          organization: user.organization,
        });

        if (!isNaN(query.year) && id === 'new') {
          setModelYear(parseInt(query.year, 10));
        }

        setLoading(false);
      });
    }

    axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((response) => {
      const filteredAssertions = response.data.filter((data) => data.module === 'supplier_information');
      setAssertions(filteredAssertions);
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
        modelYear={modelYear}
        user={user}
        assertions={assertions}
        checkboxes={checkboxes}
        handleCheckboxClick={handleCheckboxClick}
        disabledCheckboxes={disabledCheckboxes}
        details={details}
      />
    </>
  );
};

SupplierInformationContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(SupplierInformationContainer);
