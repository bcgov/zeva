/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import axios from 'axios';
import CustomPropTypes from '../app/utilities/props';
import DashboardPage from './components/DashboardPage';

import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';
import ROUTES_VEHICLES from '../app/routes/Vehicles';

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
    transfersRecorded: 0,
  });
  const [loading, setLoading] = useState(true);

  const getBCEIDActivityCount = (salesResponse, vehiclesResponse) => {
    const date3months = moment().subtract(3, 'months').calendar();
    const changesRequested = vehiclesResponse.data
      .filter((vehicle) => vehicle.validationStatus === 'CHANGES_REQUESTED')
      .map((vehicle) => vehicle.modelName);
    const submittedVehicles = vehiclesResponse.data
      .filter((vehicle) => vehicle.validationStatus === 'SUBMITTED')
      .map((vehicle) => vehicle.modelName);
    const draftVehicles = vehiclesResponse.data
      .filter((vehicle) => vehicle.validationStatus === 'DRAFT')
      .map((vehicle) => vehicle.modelName);
    const validatedVehicles = vehiclesResponse.data
      .filter((vehicle) => vehicle.validationStatus === 'VALIDATED' && moment(vehicle.updatedTimestamp).isAfter(date3months))
      .map((vehicle) => vehicle.modelName);
    const newCredits = salesResponse.data
      .filter((submission) => submission.validationStatus === 'NEW');
    const submittedSales = salesResponse.data
      .filter((submission) => submission.validationStatus === 'SUBMITTED' || submission.validationStatus === 'RECOMMEND_APPROVAL' || submission.validationStatus === 'RECOMMEND_REJECTION');
    const validatedSales = salesResponse.data
      .filter((submission) => submission.validationStatus === 'VALIDATED');

    setActivityCount({
      ...activityCount,
      modelsDraft: draftVehicles.length,
      modelsAwaitingValidation: submittedVehicles.length,
      modelsValidated: validatedVehicles.length,
      modelsInfoRequest: changesRequested.length,
      creditsNew: newCredits.length,
      creditsIssued: validatedSales.length,
      creditsAwaiting: submittedSales.length,
    });
  };

  const getIDIRActivityCount = (salesResponse, vehiclesResponse) => {
    const submittedVehicles = vehiclesResponse.data
      .filter((vehicle) => vehicle.validationStatus === 'SUBMITTED')
      .map((vehicle) => vehicle.modelName);
    const recommendApprove = salesResponse.data
      .filter((submission) => submission.validationStatus === 'RECOMMEND_APPROVAL');
    const recommendReject = salesResponse.data
      .filter((submission) => submission.validationStatus === 'RECOMMEND_REJECTION');
    const analystNeeded = salesResponse.data
      .filter((submission) => submission.validationStatus === 'SUBMITTED');

    setActivityCount({
      ...activityCount,
      submittedVehicles: submittedVehicles.length,
      creditsAnalyst: analystNeeded.length,
      creditsRecommendApprove: recommendApprove.length,
      creditsRecommendReject: recommendReject.length,
    });
  };

  const refreshList = () => {
    axios.all([
      axios.get(ROUTES_SALES_SUBMISSIONS.LIST),
      axios.get(ROUTES_VEHICLES.LIST),
    ]).then(axios.spread((salesResponse, vehiclesResponse) => {
      if (!user.isGovernment) {
        getBCEIDActivityCount(salesResponse, vehiclesResponse);
      } else {
        getIDIRActivityCount(salesResponse, vehiclesResponse);
      }

      setLoading(false);
    }));
  };

  useEffect(() => {
    refreshList(true);
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
