import axios from 'axios';
import { now } from 'moment';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceReportSummaryDetailsPage from './components/ComplianceReportSummaryDetailsPage';

const ComplianceReportSummaryContainer = (props) => {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [checkboxes, setCheckboxes] = useState([]);
  const [complianceRatios, setComplianceRatios] = useState({});
  const [assertions, setAssertions] = useState([{ id: 0, description: 'On behalf of [insert supplier name], I confirm the information included in this Model Year report is complete and accurate' }]);
  const year = '2020';
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
  const handleSubmit = (event) => {
    console.log('submit button clicked!');
  };

  const reportStatuses = {
    assessment: '',
    consumerSales: '',
    creditActivity: '',
    reportSummary: 'draft',
    supplierInformation: '',
  };
  const creditsIssuedDetails = {
    startingBalance: { A: 0, B: 0 },
    endingBalance: { A: 1513.09, B: 191.29 },
    creditsIssuedSales:
      [
        {
          year: 2020,
          A: 359.12,
          B: 43.43,
        },
        {
          year: 2019,
          A: 1367.43,
          B: 347.86,
        },
      ],
    creditsIssuedInitiative:
      [{
        year: 2019,
        A: 286.54,
      }],
    creditsIssuedPurchase: [
      {
        year: 2020,
        A: 100.00,
      },
    ],
    creditsTransferredIn: [
      {
        year: 2020,
        A: 200.00,
      },
    ],
    creditsTransferredAway: [
      {
        year: 2020,
        A: -800.00,
        B: -200.00,
      },
    ],
    pendingSales: [
      {
        year: 2020,
        A: 246.67,
        B: 0,
      },
    ],
    provisionalBalance: [
      {
        year: 2020,
        A: 1192.33,
        B: 43.43,
      },
      {
        year: 2019,
        A: 567.43,
        B: 147.86,
      },
    ],
    creditOffset: [
      {
        year: 2019,
        A: -300,
        B: -100,
      },
      {
        year: 2020,
        A: -458.71,
        B: -91.29,
      },
    ],
    provisionalAssessedBalance: [
      {
        year: 2019,
        A: 754.38,
        B: 0,
      },
      {
        year: 2020,
        A: 0,
        B: 0,
      },
    ],
  };
  const supplierInformationDetails = {
    supplierInformation: {
      makes: ['TOYOTA'],
      history: [{
        status: 'DRAFT',
        createTimestamp: now(),
        createUser: user,
      }],
      status: 'DRAFT',
    },
    organization: user.organization,
  };
  const consumerSalesDetails = {
    year: 2020,
    ldvSales: 10000,
    zevSales: 1474,
    pendingZevSales: 114,
    averageLdv3Years: 7467,
    supplierClass: 'Large',
  };
  const refreshDetails = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_COMPLIANCE.RATIOS)]).then(axios.spread((
      allComplianceRatiosResponse,
    ) => {
      setComplianceRatios(allComplianceRatiosResponse.data
        .filter((each) => each.modelYear === year));
    }));
    setLoading(false);
  };

  useEffect(() => {
    refreshDetails();
  }, []);

  return (
    <>
      <ComplianceReportTabs
        active="summary"
        reportStatuses={reportStatuses}
        id={id}
        user={user}
      />
      <ComplianceReportSummaryDetailsPage
        complianceRatios={complianceRatios}
        handleCheckboxClick={handleCheckboxClick}
        checkboxes={checkboxes}
        assertions={assertions}
        creditsIssuedDetails={creditsIssuedDetails}
        consumerSalesDetails={consumerSalesDetails}
        supplierInformationDetails={supplierInformationDetails}
        user={user}
        loading={loading}
        handleSubmit={handleSubmit}
        year="2020"
      />

    </>
  );
};
ComplianceReportSummaryContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportSummaryContainer;
