import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { withRouter } from 'react-router';
import Loading from '../app/components/Loading';
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
  const [offsetNumbers, setOffsetNumbers] = useState({});
  const [modelYear, setModelYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [make, setMake] = useState('');
  const [bceidComment, setBceidComment] = useState('');
  const [idirComment, setIdirComment] = useState([]);
  const [pendingBalanceExist, setPendingBalanceExist] = useState(false);
  const [creditActivityDetails, setCreditActivityDetails] = useState({});
  const [supplierClassInfo, setSupplierClassInfo] = useState({ ldvSales: 0, class: '' });
  const [radioDescriptions, setRadioDescriptions] = useState([{ id: 0, description: 'test' }]);
  const [sales, setSales] = useState(0);
  const [statuses, setStatuses] = useState({
    assessment: {
      status: 'UNSAVED',
      confirmedBy: null,
    },
  });

  const handleSubmit = (status) => {
    const data = {
      modelYearReportId: id,
      validation_status: status,
    };
    if (analystAction) {
      data.penalty = details.assessment.assessmentPenalty;
      data.description = details.assessment.decision.id;
    }
    axios.patch(ROUTES_COMPLIANCE.REPORT_SUBMISSION, data).then((response) => {
      history.push(ROUTES_COMPLIANCE.REPORTS);
      history.replace(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id));
    });
  };

  const handleCommentChangeBceid = (text) => {
    setBceidComment(text);
  };
  const handleAddBceidComment = () => {
    const comment = { comment: bceidComment, director: false };
    axios.post(ROUTES_COMPLIANCE.ASSESSMENT_COMMENT_SAVE.replace(':id', id), comment).then(() => {
      history.push(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id));
    });
  };
  const handleAddIdirComment = () => {
    const comment = { comment: idirComment, director: true };
    axios.post(ROUTES_COMPLIANCE.ASSESSMENT_COMMENT_SAVE.replace(':id', id), comment).then(() => {
      history.push(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id));
    });
  };
  const refreshDetails = () => {
    if (id) {
      axios.all([
        axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)),
        axios.get(ROUTES_COMPLIANCE.RATIOS),
        axios.get(ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id)),
        axios.get(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id)),
      ])
        .then(axios.spread((reportDetailsResponse, ratioResponse, creditActivityResponse, assessmentResponse) => {
          const idirCommentArrayResponse = [];
          let bceidCommentResponse = {};
          const {
            assessment: {
              penalty: assessmentPenalty, decision, deficit, inCompliance,
            },
            descriptions: assessmentDescriptions,
          } = assessmentResponse.data;
          setRadioDescriptions(assessmentDescriptions);
          assessmentResponse.data.assessmentComment.forEach((item) => {
            if (item.toDirector === true) {
              idirCommentArrayResponse.push(item);
            } else {
              bceidCommentResponse = item;
            }
          });

          let supplierClass;
          if (reportDetailsResponse.data.supplierClass === 'L') {
            supplierClass = 'Large';
          } else if (reportDetailsResponse.data.supplierClass === 'M') {
            supplierClass = 'Medium';
          } else if (reportDetailsResponse.data.supplierClass === 'S') {
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
            ldvSalesUpdated,
            changelog,
          } = reportDetailsResponse.data;
          const filteredRatio = ratioResponse.data.filter((data) => data.modelYear === modelYear.toString())[0];
          setRatios(filteredRatio);
          const makesChanges = {
            additions: [],
            // deletions: [],
            // edits: []
          };
          if (modelYearReportMakes) {
            const currentMakes = modelYearReportMakes.map((each) => (each.make));
            const makesAdditions = modelYearReportMakes.filter((each) => (each.fromGov));
            makesChanges.additions = makesAdditions;
            setMakes(currentMakes);
          }
          setStatuses(reportStatuses);
          setSales(ldvSales);
          setDetails({
            changelog,
            bceidComment: bceidCommentResponse,
            idirComment: idirCommentArrayResponse,
            ldvSales,
            class: supplierClass,
            assessment: {
              inCompliance,
              assessmentPenalty,
              decision,
              deficit,
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
          const complianceResponseDetails = creditActivityResponse.data.complianceObligation;
          const { complianceOffset } = creditActivityResponse.data;
          const creditBalanceStart = {};
          const creditBalanceEnd = {};
          const provisionalBalance = [];
          const pendingBalance = [];
          const transfersIn = [];
          const transfersOut = [];
          const creditsIssuedSales = [];
          const complianceOffsetNumbers = [];
          if (complianceOffset) {
            complianceOffset.forEach((item) => {
              complianceOffsetNumbers.push({
                modelYear: item.modelYear.name,
                A: parseFloat(item.creditAOffsetValue),
                B: parseFloat(item.creditAOffsetValue),
              });
            });
            setOffsetNumbers(complianceOffsetNumbers);
          }
          complianceResponseDetails.forEach((item) => {
            if (item.category === 'creditBalanceStart') {
              creditBalanceStart[item.modelYear.name] = {
                A: item.creditAValue,
                B: item.creditBValue,
              };
            }
            if (item.category === 'creditBalanceEnd') {
              creditBalanceEnd[item.modelYear.name] = {
                A: item.creditAValue,
                B: item.creditBValue,
              };
            }
            if (item.category === 'transfersIn') {
              transfersIn.push({
                modelYear: item.modelYear.name,
                A: item.creditAValue,
                B: item.creditBValue,
              });
            }
            if (item.category === 'transfersOut') {
              transfersOut.push({
                modelYear: item.modelYear.name,
                A: item.creditAValue,
                B: item.creditBValue,
              });
            }
            if (item.category === 'creditsIssuedSales') {
              creditsIssuedSales.push({
                modelYear: item.modelYear.name,
                A: item.creditAValue,
                B: item.creditBValue,
              });
            }
            if (item.category === 'pendingBalance') {
              pendingBalance.push({
                modelYear: item.modelYear.name,
                A: item.creditAValue,
                B: item.creditBValue,
              });
            }
          });

          // go through every year in end balance and push to provisional
          Object.keys(creditBalanceEnd).forEach((item) => {
            provisionalBalance[item] = {
              A: creditBalanceEnd[item].A,
              B: creditBalanceEnd[item].B,
            };
          });

          // go through every item in pending and add to total if year already there or create new
          pendingBalance.forEach((item) => {
            if (provisionalBalance[item.modelYear]) {
              provisionalBalance[item.modelYear].A += item.A;
              provisionalBalance[item.modelYear].B += item.B;
            } else {
              provisionalBalance[item.modelYear] = {
                A: item.A,
                B: item.B,
              };
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
  if (loading) {
    return <Loading />;
  }
  const directorAction = user.isGovernment
  && ['RECOMMENDED'].indexOf(details.assessment.validationStatus) >= 0
  && user.hasPermission('SIGN_COMPLIANCE_REPORT');

  const analystAction = user.isGovernment
  && ['SUBMITTED'].indexOf(details.assessment.validationStatus) >= 0
  && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT');
  const handleCommentChangeIdir = (text) => {
    setIdirComment(text);
  };
  return (
    <>
      <ComplianceReportTabs
        active="assessment"
        reportStatuses={statuses}
        id={id}
        user={user}
      />
      <AssessmentDetailsPage
        creditActivityDetails={creditActivityDetails}
        details={details}
        id={id}
        handleAddBceidComment={handleAddBceidComment}
        handleAddIdirComment={handleAddIdirComment}
        handleCommentChangeIdir={handleCommentChangeIdir}
        handleCommentChangeBceid={handleCommentChangeBceid}
        loading={loading}
        makes={makes}
        modelYear={modelYear}
        radioDescriptions={radioDescriptions}
        ratios={ratios}
        statuses={statuses}
        user={user}
        sales={sales}
        handleSubmit={handleSubmit}
        directorAction={directorAction}
        analystAction={analystAction}
        setDetails={setDetails}
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
