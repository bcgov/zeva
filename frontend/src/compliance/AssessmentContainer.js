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
import AssessmentDetailsPage from './components/AssessmentDetailsPage';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';

const qs = require('qs');

const AssessmentContainer = (props) => {
  const { location, keycloak, user } = props;
  const { id } = useParams();

  const [details, setDetails] = useState({});
  const [modelYear, setModelYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [make, setMake] = useState('');
  const [statuses, setStatuses] = useState({
    assessment: {
      status: 'UNSAVED',
      confirmedBy: null,
    },
  });
  const refreshDetails = () => {
    if (id) {
      axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)).then((response) => {
        const {
          makes: modelYearReportMakes,
          modelYearReportAddresses,
          modelYearReportHistory,
          organizationName,
          validationStatus,
          modelYear: reportModelYear,
          confirmations,
          statuses: reportStatuses,
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

        setLoading(false);
      });
    }
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <>
      <ComplianceReportTabs
        active="assessment"
        reportStatuses={statuses}
        id={id}
        user={user}
      />
      <AssessmentDetailsPage
        loading={loading}
        make={make}
        makes={makes}
        modelYear={modelYear}
        user={user}
        details={details}
        statuses={statuses}
        id={id}
      />
    </>
  );
};

AssessmentContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(AssessmentContainer);
