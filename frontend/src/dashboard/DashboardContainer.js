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

const DashboardContainer = (props) => {
  const { user } = props;
  const [activityCount, setActivityCount] = useState({
    modelAwaitingValidation: 0,
    modelValidated: 0,
    modelInfoRequest: 0,
    creditNew: 0,
    creditsAwaiting: 0,
    creditsIssued: 0,
    transfersAwaitingPartner: 0,
    transfersAwaitingGovernment: 0,
    transfersAwaitingDirector: 0,
    transfersAwaitingAnalyst: 0,
    transfersRecorded: 0,
  });
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(null);

  const getBCEIDActivityCount = (salesResponse, vehiclesResponse, transfersResponse) => {
    const date3months = moment().subtract(3, 'months').calendar();
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
    const newCredits = salesResponse.data
      .filter((submission) => submission.validationStatus === 'NEW');
    const submittedCredits = salesResponse.data
      .filter((submission) => submission.validationStatus === 'SUBMITTED' || submission.validationStatus === 'RECOMMEND_APPROVAL' || submission.validationStatus === 'RECOMMEND_REJECTION');
    const validatedCredits = salesResponse.data
      .filter((submission) => submission.validationStatus === 'VALIDATED');
    const transfersAwaitingPartner = transfersResponse.data
      .filter((submission) => submission.status === 'SUBMITTED');
    const transfersAwaitingGovernment = transfersResponse.data
      .filter((submission) => submission.status === 'APPROVED' || submission.status === 'RECOMMEND_APPROVAL');
    const transfersRecorded = transfersResponse.data
      .filter((submission) => submission.status === 'VALIDATED');
    setActivityCount({
      ...activityCount,
      modelsDraft: draftModels.length,
      modelsAwaitingValidation: submittedModels.length,
      modelsValidated: validatedModels.length,
      modelsInfoRequest: changesRequested.length,
      creditsNew: newCredits.length,
      creditsIssued: validatedCredits.length,
      creditsAwaiting: submittedCredits.length,
      transfersAwaitingPartner: transfersAwaitingPartner.length,
      transfersAwaitingGovernment: transfersAwaitingGovernment.length,
      transfersRecorded: transfersRecorded.length,
    });
  };

  const getIDIRActivityCount = (salesResponse, vehiclesResponse, transfersResponse) => {
    console.error(salesResponse.data);
    const submittedVehicles = vehiclesResponse.data
      .filter((vehicle) => vehicle.validationStatus === 'SUBMITTED')
      .map((vehicle) => vehicle.modelName);
    const recommendApprove = salesResponse.data
      .filter((submission) => submission.validationStatus === 'RECOMMEND_APPROVAL');
    const recommendReject = salesResponse.data
      .filter((submission) => submission.validationStatus === 'RECOMMEND_REJECTION');
    const analystNeeded = salesResponse.data
      .filter((submission) => ['SUBMITTED', 'CHECKED'].indexOf(submission.validationStatus) >= 0);
    const transfersAwaitingPartner= transfersResponse.data
      .filter((submission) => submission.status === 'SUBMITTED');
    const transfersAwaitingDirector = transfersResponse.data
      .filter((submission) => submission.status === 'RECOMMEND_APPROVAL' || submission.status === 'RECOMMENDED_REJECTION' || submission.status === 'APPROVED');
    const transfersRecorded = transfersResponse.data
      .filter((submission) => submission.status === 'VALIDATED');
    setActivityCount({
      ...activityCount,
      submittedVehicles: submittedVehicles.length,
      creditsAnalyst: analystNeeded.length,
      creditsRecommendApprove: recommendApprove.length,
      creditsRecommendReject: recommendReject.length,
      transfersAwaitingDirector: transfersAwaitingDirector.length,
      transfersRecorded: transfersRecorded.length,
      transfersAwaitingPartner: transfersAwaitingPartner.length,
    });
  };

  const refreshList = () => {
    axios.all([
      axios.get(ROUTES_CREDIT_REQUESTS.LIST),
      axios.get(ROUTES_VEHICLES.LIST),
      axios.get(ROUTES_CREDIT_TRANSFERS.LIST),
    ]).then(axios.spread((salesResponse, vehiclesResponse, transfersResponse) => {
      if (!isMountedRef.current) {
        return false;
      }

      if (!user.isGovernment) {
        getBCEIDActivityCount(salesResponse, vehiclesResponse, transfersResponse);
      } else {
        getIDIRActivityCount(salesResponse, vehiclesResponse, transfersResponse);
      }
      setLoading(false);
    }));
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
