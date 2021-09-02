import axios from 'axios';
import React, { useEffect, useState } from 'react';
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
import getComplianceObligationDetails from '../app/utilities/getComplianceObligationDetails';
import getTotalReduction from '../app/utilities/getTotalReduction';
import getUnspecifiedClassReduction from '../app/utilities/getUnspecifiedClassReduction';

const AssessmentContainer = (props) => {
  const { keycloak, user } = props;
  const { id } = useParams();
  const [balances, setBalances] = useState([]);
  const [bceidComment, setBceidComment] = useState('');
  const [changedValue, setChangedValue] = useState(false);
  const [classAReductions, setClassAReductions] = useState([]);
  const [creditDetails, setCreditDetails] = useState({});
  const [deductions, setDeductions] = useState([]);
  const [details, setDetails] = useState({});
  const [idirComment, setIdirComment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [pendingBalanceExist, setPendingBalanceExist] = useState(false);
  const [radioDescriptions, setRadioDescriptions] = useState([{ id: 0, description: '' }]);
  const [ratios, setRatios] = useState({});
  const [reportYear, setReportYear] = useState(CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR);
  const [sales, setSales] = useState(0);
  const [statuses, setStatuses] = useState({
    assessment: {
      status: 'UNSAVED',
      confirmedBy: null,
    },
  });
  const [supplierClass, setSupplierClass] = useState('S');
  const [totalReduction, setTotalReduction] = useState(0);
  const [unspecifiedReductions, setUnspecifiedReductions] = useState([]);
  const [updatedBalances, setUpdatedBalances] = useState({});

  const handleCommentChangeBceid = (text) => {
    setBceidComment(text);
  };

  const handleAddIdirComment = () => {
    const comment = { comment: idirComment, director: true };
    axios.post(ROUTES_COMPLIANCE.ASSESSMENT_COMMENT_SAVE.replace(':id', id), comment).then(() => {
      history.push(ROUTES_COMPLIANCE.REPORTS);
      history.replace(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id));
    });
  };
  const refreshDetails = () => {
    if (id) {
      axios.all([
        axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id)),
        axios.get(ROUTES_COMPLIANCE.RATIOS),
        axios.get(`${ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id)}?assessment=True`),
        axios.get(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id)),
      ]).then(axios.spread(
        (reportDetailsResponse, ratioResponse, creditActivityResponse, assessmentResponse) => {
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
            modelYear,
            statuses: reportStatuses,
            ldvSales,
            changelog,
            creditReductionSelection,
            supplierClass: tempSupplierClass,
          } = reportDetailsResponse.data;

          setSupplierClass(tempSupplierClass);

          if (changelog.ldvChanges !== '') {
            setChangedValue(true);
          }

          const currentReportYear = Number(modelYear.name);
          setReportYear(currentReportYear);

          const filteredRatios = ratioResponse.data.find(
            (data) => Number(data.modelYear) === Number(currentReportYear),
          );
          setRatios(filteredRatios);
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

          const {
            creditBalanceEnd,
            creditBalanceStart,
            creditsIssuedSales,
            pendingBalance,
            pendingBalanceExist: tempPendingBalanceExist,
            provisionalBalance,
            transfersIn,
            transfersOut,
            initiativeAgreement,
            purchaseAgreement,
            administrativeAllocation,
            administrativeReduction,
            automaticAdministrativePenalty,
          } = getComplianceObligationDetails(complianceResponseDetails);

          setPendingBalanceExist(tempPendingBalanceExist);

          setCreditDetails({
            creditBalanceStart,
            creditBalanceEnd,
            pendingBalance,
            provisionalBalance,
            transactions: {
              creditsIssuedSales,
              transfersIn,
              transfersOut,
              initiativeAgreement,
              purchaseAgreement,
              administrativeAllocation,
              administrativeReduction,
              automaticAdministrativePenalty,
            },
          });

          const tempTotalReduction = getTotalReduction(ldvSales, filteredRatios.complianceRatio);
          const classAReduction = getClassAReduction(ldvSales, filteredRatios.zevClassA, tempSupplierClass);
          const leftoverReduction = getUnspecifiedClassReduction(tempTotalReduction, classAReduction);
          setTotalReduction(tempTotalReduction);

          const tempBalances = [];

          Object.keys(provisionalBalance).forEach((year) => {
            const { A: creditA, B: creditB } = provisionalBalance[year];
            tempBalances.push({
              modelYear: Number(year),
              creditA,
              creditB,
            });
          });

          setBalances(tempBalances);

          const tempClassAReductions = [{
            modelYear: Number(modelYear.name),
            value: Number(classAReduction),
          }];

          const tempUnspecifiedReductions = [{
            modelYear: Number(modelYear.name),
            value: Number(leftoverReduction),
          }];

          setClassAReductions(tempClassAReductions);
          setUnspecifiedReductions(tempUnspecifiedReductions);

          const creditReduction = calculateCreditReduction(
            tempBalances,
            tempClassAReductions,
            tempUnspecifiedReductions,
            creditReductionSelection,
          );

          setDeductions(creditReduction.deductions);

          setUpdatedBalances({
            balances: creditReduction.balances,
            deficits: creditReduction.deficits,
          });

          setLoading(false);
        },
      ));
    }
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);
  if (loading) {
    return <Loading />;
  }

  const handleCommentChangeIdir = (text) => {
    setIdirComment(text);
  };

  const directorAction = user.isGovernment
  && ['RECOMMENDED'].indexOf(details.assessment.validationStatus) >= 0
  && user.hasPermission('SIGN_COMPLIANCE_REPORT');

  const analystAction = user.isGovernment
  && ['SUBMITTED', 'RETURNED'].indexOf(details.assessment.validationStatus) >= 0
  && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT');

  const handleSubmit = (status) => {
    const comment = { comment: bceidComment, director: false };

    axios.post(ROUTES_COMPLIANCE.ASSESSMENT_COMMENT_SAVE.replace(':id', id), comment).then(() => {
      if (changedValue && status === 'RECOMMENDED') {
        const reportDetailsArray = [];
        Object.keys(creditDetails).forEach((each) => {
          Object.keys(creditDetails[each]).forEach((year) => {
            if (each !== 'transactions' && each !== 'pendingBalance') {
              const a = creditDetails[each][year].A;
              const b = creditDetails[each][year].B;
              reportDetailsArray.push({
                category: each, year, a, b,
              });
            } else if (each === 'pendingBalance') {
              reportDetailsArray.push({
                category: each,
                year: creditDetails[each][year].modelYear,
                A: creditDetails[each][year].A,
                B: creditDetails[each][year].B,
              });
            } else {
              const category = year;
              creditDetails[each][year].forEach((record) => {
                const A = parseFloat(record.A) || 0;
                const B = parseFloat(record.B) || 0;
                reportDetailsArray.push({
                  category, year: record.modelYear, A, B,
                });
              });
            }
          });
        });

        if (deductions) {
          // zev class A reductions
          deductions.filter((deduction) => deduction.type === 'classAReduction').forEach((deduction) => {
            reportDetailsArray.push({
              category: 'ClassAReduction',
              year: deduction.modelYear,
              a: deduction.creditA,
              b: deduction.creditB,
            });
          });

          // unspecified reductions
          deductions.filter((deduction) => deduction.type === 'unspecifiedReduction').forEach((deduction) => {
            reportDetailsArray.push({
              category: 'UnspecifiedClassCreditReduction',
              year: deduction.modelYear,
              a: deduction.creditA,
              b: deduction.creditB,
            });
          });
        }

        if (updatedBalances) {
          // provincial balance after reductions
          if (updatedBalances.balances.length > 0) {
            updatedBalances.balances.forEach((balance) => {
              reportDetailsArray.push({
                category: 'ProvisionalBalanceAfterCreditReduction',
                year: balance.modelYear,
                a: balance.creditA || 0,
                b: balance.creditB || 0,
              });
            });
          }

          // deficits
          if (updatedBalances.deficits.length > 0) {
            updatedBalances.deficits.forEach((balance) => {
              reportDetailsArray.push({
                category: 'CreditDeficit',
                year: balance.modelYear,
                a: balance.creditA || 0,
                b: balance.creditB || 0,
              });
            });
          }
        }

        const ObligationData = {
          reportId: id,
          creditActivity: reportDetailsArray,
        };

        axios.patch(ROUTES_COMPLIANCE.OBLIGATION_SAVE, ObligationData);
      }

      const data = {
        modelYearReportId: id,
        validation_status: status,
        modelYear: reportYear,
      };

      if (analystAction) {
        data.penalty = details.assessment.assessmentPenalty;
        data.description = details.assessment.decision.id;
      }

      axios.patch(ROUTES_COMPLIANCE.REPORT_SUBMISSION, data).then(() => {
        history.push(ROUTES_COMPLIANCE.REPORTS);
        history.replace(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id));
      });
    });
  };

  const handleAddBceidComment = () => {
    const comment = { comment: bceidComment, director: false };
    axios.post(ROUTES_COMPLIANCE.ASSESSMENT_COMMENT_SAVE.replace(':id', id), comment).then(() => {
      history.push(ROUTES_COMPLIANCE.REPORTS);
      history.replace(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id));
    });
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
        analystAction={analystAction}
        balances={balances}
        classAReductions={classAReductions}
        creditActivityDetails={creditDetails}
        deductions={deductions}
        details={details}
        directorAction={directorAction}
        handleAddBceidComment={handleAddBceidComment}
        handleAddIdirComment={handleAddIdirComment}
        handleCommentChangeBceid={handleCommentChangeBceid}
        handleCommentChangeIdir={handleCommentChangeIdir}
        handleSubmit={handleSubmit}
        id={id}
        loading={loading}
        makes={makes}
        pendingBalanceExist={pendingBalanceExist}
        radioDescriptions={radioDescriptions}
        ratios={ratios}
        reportYear={reportYear}
        sales={sales}
        setDetails={setDetails}
        statuses={statuses}
        supplierClass={supplierClass}
        totalReduction={totalReduction}
        unspecifiedReductions={unspecifiedReductions}
        updatedBalances={updatedBalances}
        user={user}
      />
    </>
  );
};

AssessmentContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(AssessmentContainer);
