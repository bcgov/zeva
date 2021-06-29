import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { withRouter } from 'react-router';
import Loading from '../app/components/Loading';
import CONFIG from '../app/config';
import history from '../app/History';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import CustomPropTypes from '../app/utilities/props';
import getClassAReduction from '../app/utilities/getClassAReduction';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import AssessmentDetailsPage from './components/AssessmentDetailsPage';
import calculateCreditReduction from '../app/utilities/calculateCreditReduction';
import calculateCreditAReduction from '../app/utilities/calculateCreditAReduction';

const AssessmentContainer = (props) => {
  const { keycloak, user } = props;
  const { id } = useParams();
  const [ratios, setRatios] = useState({});
  const [details, setDetails] = useState({});
  const [offsetNumbers, setOffsetNumbers] = useState({});
  const [modelYear, setModelYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [bceidComment, setBceidComment] = useState('');
  const [idirComment, setIdirComment] = useState([]);
  const [creditActivityDetails, setCreditActivityDetails] = useState({});
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
      modelYear: modelYear
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
        axios.get(`${ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id)}?assessment=True`),
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
            creditReductionSelection,
          } = reportDetailsResponse.data;
          setModelYear(Number(reportModelYear.name));

          const filteredRatio = ratioResponse.data.filter((data) => data.modelYear === reportModelYear.name.toString())[0];
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
            class: reportDetailsResponse.data.supplierClass,
            creditReductionSelection,
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
          let zevClassAReduction = {};
          let unspecifiedReductions = {};
          const creditBalance = {};

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
              if (item.issuedCredits) {
                item.issuedCredits.forEach((each) => {
                  creditsIssuedSales.push({
                    modelYear: each.modelYear,
                    A: each.A,
                    B: each.B,
                  });
                });
              } else {
                creditsIssuedSales.push({
                  modelYear: item.modelYear.name,
                  A: item.creditAValue,
                  B: item.creditBValue,
                });
              }
            }
            if (item.category === 'pendingBalance') {
              pendingBalance.push({
                modelYear: item.modelYear.name,
                A: item.creditAValue,
                B: item.creditBValue,
              });
            }

            if (item.category === 'ClassAReduction') {
              if (item.modelYear.name === reportModelYear.name) {
                zevClassAReduction.currentYearA = item.creditAValue;
              } else {
                zevClassAReduction.lastYearA = item.creditAValue;
              }
            }

            if (item.category === 'UnspecifiedClassCreditReduction') {
              if (item.modelYear.name === reportModelYear.name) {
                unspecifiedReductions.currentYearA = item.creditAValue;
                unspecifiedReductions.currentYearB = item.creditBValue;
              } else {
                unspecifiedReductions.lastYearA = item.creditAValue;
                unspecifiedReductions.lastYearB = item.creditAValue;
              }
            }

            if (item.category === 'ProvisionalBalanceAfterCreditReduction') {
              creditBalance.A = item.creditAValue;
              creditBalance.B = item.creditBValue;
            }

            if (item.category === 'CreditDeficit') {
              creditBalance.creditADeficit = item.creditAValue;
              creditBalance.unspecifiedCreditDeficit = item.creditBValue;
            }
          });

          const classAReduction = getClassAReduction(ldvSales, filteredRatio.zevClassA, reportDetailsResponse.data.supplierClass);

          // go through every year in end balance and push to provisional
          Object.keys(creditBalanceEnd).forEach((item) => {
            provisionalBalance[item] = {
              A: Number(creditBalanceEnd[item].A),
              B: Number(creditBalanceEnd[item].B),
            };
          });

          // go through every item in pending and add to total if year already there or create new
          pendingBalance.forEach((item) => {
            if (provisionalBalance[item.modelYear]) {
              provisionalBalance[item.modelYear].A += Number(item.A);
              provisionalBalance[item.modelYear].B += Number(item.B);
            } else {
              provisionalBalance[item.modelYear] = {
                A: Number(item.A),
                B: Number(item.B),
              };
            }
          });

          const creditReduction = calculateCreditReduction(
            creditReductionSelection,
            reportDetailsResponse.data.supplierClass,
            classAReduction,
            provisionalBalance,
            ldvSales,
            filteredRatio,
            Number(reportModelYear.name),
          );

          const creditAReduction = calculateCreditAReduction(
            reportDetailsResponse.data.supplierClass,
            classAReduction,
            provisionalBalance,
            Number(reportModelYear.name),
          );

          unspecifiedReductions = creditReduction.unspecifiedReductions;

          zevClassAReduction = creditAReduction.zevClassACreditReduction;

          if (creditAReduction.remainingABalance) {
            creditBalance.lastYearA = creditAReduction.remainingABalance.lastYearABalance;
            creditBalance.A = creditAReduction.remainingABalance.currentYearABalance;
            creditBalance.creditADeficit = creditAReduction.remainingABalance.creditADeficit;
          }

          if (creditReduction.creditBalance) {
            creditBalance.A = creditReduction.creditBalance.A;
            creditBalance.B = creditReduction.creditBalance.B;
            creditBalance.creditADeficit = creditReduction.creditBalance.creditADeficit;
            creditBalance.unspecifiedCreditDeficit = creditReduction.creditBalance.unspecifiedCreditDeficit;
          }

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
            zevClassAReduction,
            unspecifiedReductions,
            creditBalance,
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
