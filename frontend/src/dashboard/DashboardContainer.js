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
    reportsDraft: 0,
    reportsSubmitted: 0,
    reportsAnalyst: 0,
    reportsAssessed: 0,
    reportsRecommended: 0,
  });

  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(null);

  const getCreditRequests = () => (
    axios.get(ROUTES_CREDIT_REQUESTS.LIST).then((salesResponse) => {
      const days28 = moment().subtract(28, 'days').calendar();

      if (!user.isGovernment) {
        const draftCredits = salesResponse.data
          .filter((submission) => submission.validationStatus === 'DRAFT');
        const submittedCredits = salesResponse.data
          .filter((submission) => submission.validationStatus === 'SUBMITTED' || submission.validationStatus === 'RECOMMEND_APPROVAL' || submission.validationStatus === 'RECOMMEND_REJECTION');
        const validatedCredits = salesResponse.data
          .filter((submission) => submission.validationStatus === 'VALIDATED' && moment(submission.updatedTimestamp).isAfter(days28));

        activityCount = {
          ...activityCount,
          creditsDraft: draftCredits.length,
          creditsIssued: validatedCredits.length,
          creditsAwaiting: submittedCredits.length,
        };
      } else {
        const recommendApprove = salesResponse.data
          .filter((submission) => submission.validationStatus === 'RECOMMEND_APPROVAL');
        const recommendReject = salesResponse.data
          .filter((submission) => submission.validationStatus === 'RECOMMEND_REJECTION');
        const analystNeeded = salesResponse.data
          .filter((submission) => ['SUBMITTED', 'CHECKED'].indexOf(submission.validationStatus) >= 0);

        activityCount = {
          ...activityCount,
          creditsAnalyst: analystNeeded.length,
          creditsRecommendApprove: recommendApprove.length,
          creditsRecommendReject: recommendReject.length,
        };
      }
    })
  );

  const getVehicles = () => (
    axios.get(ROUTES_VEHICLES.LIST).then((vehiclesResponse) => {
      if (!user.isGovernment) {
        const date3months = moment().subtract(3, 'months').calendar();

        const vehiclesRejected = vehiclesResponse.data
          .filter((vehicle) => vehicle.validationStatus === 'REJECTED')
          .map((vehicle) => vehicle.modelName);
        const changesRequested = vehiclesResponse.data
          .filter((vehicle) => vehicle.validationStatus === 'CHANGES_REQUESTED')
          .map((vehicle) => vehicle.modelName);
        const submittedModels = vehiclesResponse.data
          .filter((vehicle) => vehicle.validationStatus === 'SUBMITTED')
          .map((vehicle) => vehicle.modelName);
        const draftModels = vehiclesResponse.data
          .filter((vehicle) => vehicle.validationStatus === 'DRAFT')
          .map((vehicle) => vehicle.modelName);
        const validatedModels = vehiclesResponse.data
          .filter((vehicle) => vehicle.validationStatus === 'VALIDATED' && moment(vehicle.updatedTimestamp).isAfter(date3months))
          .map((vehicle) => vehicle.modelName);

        activityCount = {
          ...activityCount,
          modelsRejected: vehiclesRejected.length,
          modelsDraft: draftModels.length,
          modelsAwaitingValidation: submittedModels.length,
          modelsValidated: validatedModels.length,
          modelsInfoRequest: changesRequested.length,
        };
      } else {
        const submittedVehicles = vehiclesResponse.data
          .filter((vehicle) => vehicle.validationStatus === 'SUBMITTED')
          .map((vehicle) => vehicle.modelName);

        activityCount = {
          ...activityCount,
          submittedVehicles: submittedVehicles.length,
        };
      }
    })
  );
  const getModelYearReports = () => (
    axios.get(ROUTES_DASHBOARD.LIST).then((dashboardResponse) => {
      if (!user.isGovernment) {
        const reportsDraft = dashboardResponse.data.filter((report) => report.modelYearReportValidationStatus === 'DRAFT');
        const reportsSubmitted = dashboardResponse.data.filter((report) => report.modelYearReportValidationStatus === 'SUBMITTED');
        activityCount = {...activityCount,
          reportsDraft: reportsDraft.length,
          reportsSubmitted: reportsSubmitted.length}
      } else {
        const reportsAnalyst = dashboardResponse.data.filter((report) => report.modelYearReportValidationStatus === 'SUBMITTED');
        activityCount = { ...activityCount,
          reportsAnalyst: reportsAnalyst.length }
      }
      console.log(dashboardResponse.data);
    })
  );

  const getCreditTransfers = () => (
    axios.get(ROUTES_CREDIT_TRANSFERS.LIST).then((transfersResponse) => {
      const days28 = moment().subtract(28, 'days').calendar();

      if (!user.isGovernment) {
        const transfersAwaitingPartner = transfersResponse.data
          .filter((submission) => submission.status === 'SUBMITTED');
        const transfersAwaitingGovernment = transfersResponse.data
          .filter((submission) => submission.status === 'APPROVED' || submission.status === 'RECOMMEND_APPROVAL');
        const transfersRecorded = transfersResponse.data
          .filter((submission) => submission.status === 'VALIDATED' && moment(submission.updatedTimestamp).isAfter(days28));
        const transfersRejected = transfersResponse.data
          .filter((submission) => submission.status === 'REJECTED' && moment(submission.updatedTimestamp).isAfter(days28));
        const transfersRejectedByTransferPartner = transfersResponse.data
          .filter((submission) => submission.status === 'DISAPPROVED' && moment(submission.updatedTimestamp).isAfter(days28));

        activityCount = {
          ...activityCount,
          transfersAwaitingPartner: transfersAwaitingPartner.length,
          transfersAwaitingGovernment: transfersAwaitingGovernment.length,
          transfersRecorded: transfersRecorded.length,
          transfersRejected: transfersRejected.length,
          transfersRejectedByPartner: transfersRejectedByTransferPartner.length,
        };
      } else {
        const transfersAwaitingPartner = transfersResponse.data
          .filter((submission) => submission.status === 'SUBMITTED');
        const transfersAwaitingAnalyst = transfersResponse.data
          .filter((submission) => submission.status === 'APPROVED');
        const transfersAwaitingDirector = transfersResponse.data
          .filter((submission) => submission.status === 'RECOMMEND_APPROVAL' || submission.status === 'RECOMMEND_REJECTION');
        const transfersRecorded = transfersResponse.data
          .filter((submission) => submission.status === 'VALIDATED');

        activityCount = {
          ...activityCount,
          transfersAwaitingAnalyst: transfersAwaitingAnalyst.length,
          transfersAwaitingDirector: transfersAwaitingDirector.length,
          transfersRecorded: transfersRecorded.length,
          transfersAwaitingPartner: transfersAwaitingPartner.length,
        };
      }
    })
  );

  const refreshList = () => {
    const promises = [];
    promises.push(getModelYearReports())
    if (user.hasPermission('VIEW_SALES')) {
      promises.push(getCreditRequests());
    }

    if (user.hasPermission('VIEW_ZEV')) {
      promises.push(getVehicles());
    }

    if (user.hasPermission('VIEW_CREDIT_TRANSFERS') || user.hasPermission('VIEW_CREDIT_TRANSACTIONS')) {
      promises.push(getCreditTransfers());
    }

    Promise.all(promises).then(() => {
      setActivityCount(activityCount);
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
