/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment-timezone';
import axios from 'axios';
import CustomPropTypes from '../app/utilities/props';
import DashboardPage from './components/DashboardPage';

import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import ROUTES_CREDIT_TRANSFERS from '../app/routes/CreditTransfers';
import ROUTES_DASHBOARD from '../app/routes/Dashboard';

const DashboardContainer = (props) => {
  const { user } = props;
  let [activityCount, setActivityCount] = useState({
    modelsRejected: 0,
    modelsAwaitingValidation: 0,
    modelsValidated: 0,
    modelsInfoRequest: 0,
    creditsDraft: 0,
    creditsAwaiting: 0,
    creditsIssued: 0,
    transfersAwaitingPartner: 0,
    transfersAwaitingGovernment: 0,
    transfersAwaitingDirector: 0,
    transfersAwaitingAnalyst: 0,
    transfersRecorded: 0,
    transfersRejectedByPartner: 0,
    transfersRejected: 0,
    creditAgreementsIssued: 0,
    creditAgreementsDraft: 0,
    creditAgreementsRecommended: 0,
    reportsDraft: 0,
    reportsSubmitted: 0,
    reportsAnalyst: 0,
    reportsAssessed: 0,
    reportsRecommended: 0,
  });

  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(null);

  const getDashboard = () => {
    axios.get(ROUTES_DASHBOARD.LIST).then((dashboardResponse) => {
      const dashboard = dashboardResponse.data[0].activity;
      // get vehicles!
      if (user.hasPermission('VIEW_ZEV')) {
        let modelsValidated = dashboard.vehicle.find((each) => each.status === 'VALIDATED');
        modelsValidated = modelsValidated ? modelsValidated.total : 0;
        let modelsRejected = dashboard.vehicle.find((each) => each.status === 'REJECTED');
        modelsRejected = modelsRejected ? modelsRejected.total : 0;

        let modelsDraft = dashboard.vehicle.find((each) => each.status === 'DRAFT');
        modelsDraft = modelsDraft ? modelsDraft.total : 0;

        let modelsAwaitingValidation = dashboard.vehicle.find((each) => each.status === 'SUBMITTED');
        modelsAwaitingValidation = modelsAwaitingValidation ? modelsAwaitingValidation.total : 0;
        let modelsInfoRequest = dashboard.vehicle.find((each) => each.status === 'CHANGES_REQUESTED');
        modelsInfoRequest = modelsInfoRequest ? modelsInfoRequest.total : 0;

        activityCount = {
          ...activityCount,
          modelsRejected,
          modelsDraft,
          modelsAwaitingValidation,
          modelsValidated,
          modelsInfoRequest,
        };
      }
      // get transfers!
      if (user.hasPermission('VIEW_CREDIT_TRANSFERS') || user.hasPermission('VIEW_CREDIT_TRANSACTIONS')) {
        if (!user.isGovernment) {
          let transfersAwaitingPartner = dashboard.creditTransfer.find((submission) => submission.status === 'SUBMITTED');
          transfersAwaitingPartner = transfersAwaitingPartner ? transfersAwaitingPartner.total : 0;

          let transfersAwaitingGovernment = dashboard.creditTransfer.find((submission) => submission.status === 'APPROVED' || submission.status === 'RECOMMEND_APPROVAL');
          transfersAwaitingGovernment = transfersAwaitingGovernment ? transfersAwaitingGovernment.total : 0;

          let transfersRecorded = dashboard.creditTransfer.find((submission) => submission.status === 'VALIDATED');
          transfersRecorded = transfersRecorded ? transfersRecorded.total : 0;

          let transfersRejected = dashboard.creditTransfer.find((submission) => submission.status === 'REJECTED');
          transfersRejected = transfersRejected ? transfersRejected.total : 0;

          let transfersRejectedByTransferPartner = dashboard.creditTransfer.find((submission) => submission.status === 'DISAPPROVED');
          transfersRejectedByTransferPartner = transfersRejectedByTransferPartner ? transfersRejectedByTransferPartner.total : 0;

          activityCount = {
            ...activityCount,
            transfersAwaitingPartner,
            transfersAwaitingGovernment,
            transfersRecorded,
            transfersRejected,
            transfersRejectedByTransferPartner,
          };
        } else {
          let transfersAwaitingPartner = dashboard.creditTransfer.find((submission) => submission.status === 'SUBMITTED');
          transfersAwaitingPartner = transfersAwaitingPartner ? transfersAwaitingPartner.total : 0;

          let transfersAwaitingAnalyst = dashboard.creditTransfer.find((submission) => submission.status === 'APPROVED');
          transfersAwaitingAnalyst = transfersAwaitingAnalyst ? transfersAwaitingAnalyst.total : 0;

          let transfersAwaitingDirector = dashboard.creditTransfer.find((submission) => submission.status === 'RECOMMEND_APPROVAL' || submission.status === 'RECOMMEND_REJECTION');
          transfersAwaitingDirector = transfersAwaitingDirector ? transfersAwaitingDirector.total : 0;

          let transfersRecorded = dashboard.creditTransfer.find((submission) => submission.status === 'VALIDATED');
          transfersRecorded = transfersRecorded ? transfersRecorded.total : 0;

          activityCount = {
            ...activityCount,
            transfersAwaitingAnalyst,
            transfersAwaitingDirector,
            transfersRecorded,
            transfersAwaitingPartner,
          };
        }
      }
      // model year reports!
      if (user.hasPermission('SUBMIT_COMPLIANCE_REPORT') || user.hasPermission('RECOMMEND_COMPLIANCE_REPORT')) {
        if (!user.isGovernment) {
          let reportsDraft = dashboard.modelYearReport.find((report) => report.status === 'DRAFT');
          reportsDraft = reportsDraft ? reportsDraft.total : 0;
          let reportsSubmitted = dashboard.modelYearReport.find((report) => report.status === 'SUBMITTED');
          reportsSubmitted = reportsSubmitted ? reportsSubmitted.total : 0;
          let reportsAssessed = dashboard.modelYearReport.find((report) => report.status === 'ASSESSED');
          reportsAssessed = reportsAssessed ? reportsAssessed.total : reportsAssessed;
          activityCount = {
            ...activityCount,
            reportsDraft,
            reportsSubmitted,
            reportsAssessed,
          };
        } else {
          let reportsAnalyst = dashboard.modelYearReport.find((report) => report.status === 'SUBMITTED');
          reportsAnalyst = reportsAnalyst ? reportsAnalyst.total : 0;
          activityCount = {
            ...activityCount,
            reportsAnalyst,
          };
        }
      }
      // credit requests
      if (user.hasPermission('VIEW_SALES')) {
        if (!user.isGovernment) {
          let creditsDraft = dashboard.creditRequest
            .find((submission) => submission.status === 'DRAFT');
          creditsDraft = creditsDraft ? creditsDraft.total : 0;
          let submittedCredits = dashboard.creditRequest
            .find((submission) => submission.status === 'SUBMITTED' || submission.status === 'RECOMMEND_APPROVAL' || submission.status === 'RECOMMEND_REJECTION');
          submittedCredits = submittedCredits ? submittedCredits.total : 0;
          let creditsIssued = dashboard.creditRequest
            .find((submission) => submission.status === 'VALIDATED');
          creditsIssued = creditsIssued ? creditsIssued.total : 0;

          activityCount = {
            ...activityCount,
            creditsDraft,
            creditsIssued,
            submittedCredits,
          };
        } else {
          let creditsRecommendApprove = dashboard.creditRequest
            .find((submission) => submission.status === 'RECOMMEND_APPROVAL');
          creditsRecommendApprove = creditsRecommendApprove ? creditsRecommendApprove.total : 0;
          let creditsRecommendReject = dashboard.creditRequest
            .find((submission) => submission.status === 'RECOMMEND_REJECTION');
          creditsRecommendReject = creditsRecommendReject ? creditsRecommendReject.total : 0;
          let creditsAnalyst = dashboard.creditRequest
            .find((submission) => ['SUBMITTED', 'CHECKED'].indexOf(submission.status) >= 0);
          creditsAnalyst = creditsAnalyst ? creditsAnalyst.total : 0;
          activityCount = {
            ...activityCount,
            creditsAnalyst,
            creditsRecommendApprove,
            creditsRecommendReject,
          };
        }
      }
      // agreements
      // permissions for agreements???
      let creditAgreementsIssued = dashboard.creditAgreement.find((agreement) => agreement.status === 'ISSUED');
      creditAgreementsIssued = creditAgreementsIssued ? creditAgreementsIssued.total : 0;
      if (user.isGovernment) {
        let creditAgreementsDraft = dashboard.creditAgreement.find((agreement) => agreement.status === 'DRAFT');
        creditAgreementsDraft = creditAgreementsDraft ? creditAgreementsDraft.total : 0;
        let creditAgreementsRecommended = dashboard.creditAgreement.find((agreement) => agreement.status === 'RECOMMENDED');
        creditAgreementsRecommended = creditAgreementsRecommended ? creditAgreementsRecommended.total : 0;
        activityCount = {
          ...activityCount,
          creditAgreementsDraft,
          creditAgreementsRecommended,
        };
      }
      activityCount = {
        ...activityCount,
        creditAgreementsIssued,
      };
      setActivityCount(activityCount);
    });
  };
  const refreshList = () => {
    const promises = [];
    promises.push(getDashboard());
    Promise.all(promises).then(() => {
      if (!isMountedRef.current) {
        return false;
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    isMountedRef.current = true;
    refreshList(isMountedRef.current);
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  return (
    <DashboardPage user={user} activityCount={activityCount} loading={loading} />
  );
};

DashboardContainer.defaultProps = {
};

DashboardContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default DashboardContainer;
