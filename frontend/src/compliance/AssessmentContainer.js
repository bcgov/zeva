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
  const [ratios, setRatios] = useState({});
  const [details, setDetails] = useState({});
  const [modelYear, setModelYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [make, setMake] = useState('');
  const [pendingBalanceExist, setPendingBalanceExist] = useState(false);
  const [creditActivityDetails, setCreditActivityDetails] = useState({});
  const [supplierClassInfo, setSupplierClassInfo] = useState({ ldvSales: 0, class: '' });
  const [statuses, setStatuses] = useState({
    assessment: {
      status: 'UNSAVED',
      confirmedBy: null,
    },
  });
  const handleAddComment = () => {
    console.log('add logic here!');
  };
  const refreshDetails = () => {
    if (id) {
      axios.all([
        axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)),
        axios.get(ROUTES_COMPLIANCE.RATIOS),
        axios.get(ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id))
      ])
        .then(axios.spread((response, ratioResponse, creditActivityResponse) => {
          let supplierClass;
          if (response.data.supplierClass === 'L') {
            supplierClass = 'Large';
          } else if (response.data.supplierClass === 'M') {
            supplierClass = 'Medium';
          } else if (response.data.supplierClass === 'S') {
            supplierClass = 'Small';
          }
          const {
            makes: modelYearReportMakes,
            modelYearReportAddresses,
            modelYearReportHistory,
            organizationName,
            validationStatus,
            modelYear: reportModelYear,
            confirmations,
            statuses: reportStatuses,
            ldvSales,
          } = response.data;

          const filteredRatio = ratioResponse.data.filter((data) => data.modelYear === modelYear.toString())[0];
          setRatios(filteredRatio);
          if (modelYearReportMakes) {
            const currentMakes = modelYearReportMakes.map((each) => (each.make));
            setMakes(currentMakes);
          }
          setDetails({
            ldvSales,
            class: supplierClass,
            assessment: {
              history: modelYearReportHistory,
              validationStatus,
            },
            organization: {
              name: organizationName,
              organizationAddress: modelYearReportAddresses,
            },
            supplierInformation: {
              history: modelYearReportHistory,
              validationStatus,
            },
          });
          // CREDIT ACTIVITY
          const creditBalanceStart = { year: '', A: 0, B: 0 };
          const creditBalanceEnd = { A: 0, B: 0 };
          const provisionalBalance = {};
          const pendingBalance = { A: 0, B: 0 };
          const transfersIn = { A: 0, B: 0 };
          const transfersOut = { A: 0, B: 0 };
          const creditsIssuedSales = { A: 0, B: 0 };
          const offsetNumbers = { A: 0, B: 0 };
          creditActivityResponse.data.complianceObligation.forEach((item) => {
            if (item.category === 'creditBalanceStart') {
              creditBalanceStart.year = item.modelYear.name;
              creditBalanceStart.A = item.creditAValue;
              creditBalanceStart.B = item.creditBValue;
            }
            if (item.category === 'creditBalanceEnd') {
              const aValue = parseFloat(item.creditAValue);
              const bValue = parseFloat(item.creditBValue);
              creditBalanceEnd.A += aValue;
              creditBalanceEnd.B += bValue;
            }
            if (item.category === 'provisionalBalance') {
              const aValue = parseFloat(item.creditAValue);
              const bValue = parseFloat(item.creditBValue);
              provisionalBalance.A += aValue;
              provisionalBalance.B += bValue;
            }
            if (item.category === 'pendingBalance') {
              const aValue = parseFloat(item.creditAValue);
              const bValue = parseFloat(item.creditBValue);
              pendingBalance.A += aValue;
              pendingBalance.B += bValue;
              if (pendingBalance.A > 0 || pendingBalance.B > 0) {
                setPendingBalanceExist(true);
              }
            }
            if (item.category === 'transfersIn') {
              const aValue = parseFloat(item.creditAValue);
              const bValue = parseFloat(item.creditBValue);
              transfersIn.A += aValue;
              transfersIn.B += bValue;
            }
            if (item.category === 'transfersOut') {
              const aValue = parseFloat(item.creditAValue);
              const bValue = parseFloat(item.creditBValue);
              transfersOut.A -= aValue;
              transfersOut.B -= bValue;
            }
            if (item.category === 'creditsIssuedSales') {
              const aValue = parseFloat(item.creditAValue);
              const bValue = parseFloat(item.creditBValue);
              creditsIssuedSales.A += aValue;
              creditsIssuedSales.B += bValue;
            }
          });
          setCreditActivityDetails({
            creditBalanceStart,
            creditBalanceEnd,
            pendingBalance,
            provisionalBalance,
            transactions: {
              creditsIssuedSales,
              transfersIn,
              transfersOut,
            },
          });
          setLoading(false);
        }));
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
        handleAddComment={handleAddComment}
        handleCommentChange={handleAddComment}
        ratios={ratios}
        supplierClassInfo={supplierClassInfo}
        creditActivityDetails={creditActivityDetails}
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
