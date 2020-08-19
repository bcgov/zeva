import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import axios from 'axios';

import ROUTES_SALES_SUBMISSIONS from '../../app/routes/SalesSubmissions';
import ROUTES_SALES from '../../app/routes/Sales';

import ROUTES_VEHICLES from '../../app/routes/Vehicles';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ActivityBanner from './ActivityBanner';

const ActionsBceid = () => {
  const [loading, setLoading] = useState(true);
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
  const refreshList = () => {
    const date3months = moment().subtract(3, 'months').calendar();
    axios.all([
      axios.get(ROUTES_VEHICLES.LIST),
      axios.get(ROUTES_SALES_SUBMISSIONS.LIST),
    ]).then(axios.spread((vehiclesResponse, salesResponse) => {
      const changesRequested = vehiclesResponse.data
        .filter((vehicle) => vehicle.validationStatus === 'CHANGES_REQUESTED')
        .map((vehicle) => vehicle.modelName);
      const submittedVehicles = vehiclesResponse.data
        .filter((vehicle) => vehicle.validationStatus === 'SUBMITTED')
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
        modelsAwaitingValidation: submittedVehicles.length,
        modelsValidated: validatedVehicles.length,
        modelsInfoRequest: changesRequested.length,
        creditsNew: newCredits.length,
        creditsIssued: validatedSales.length,
        creditsAwaiting: submittedSales.length,
      });
      setLoading(false);
    }));
  };
  useEffect(() => {
    refreshList(true);
  }, []);
  if (loading) {
    return <Loading />;
  }
  return (
    <div id="actions" className="dashboard-card">
      <div className="content">
        <h1>Latest Activity</h1>
        {activityCount.modelsInfoRequest > 0
        && (
        <ActivityBanner
          colour="yellow"
          icon="car"
          boldText="ZEV Models"
          regularText={`${activityCount.modelsInfoRequest} range information requests`}
          linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Changes%20Requested`}

        />
        )}
        {activityCount.modelsAwaitingValidation > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="car"
          boldText="ZEV Models"
          regularText={`${activityCount.modelsAwaitingValidation} awaiting validation`}
          linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Submitted`}
        />
        )}
        {activityCount.modelsValidated > 0
        && (
        <ActivityBanner
          colour="green"
          icon="car"
          boldText="ZEV Models"
          regularText={`${activityCount.modelsValidated} validated by government`}
          linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Validated`}
        />
        )}
        {activityCount.modelsInfoRequest === 0
        && activityCount.modelsAwaitingValidation === 0 && activityCount.modelsValidated === 0
        && (
          <ActivityBanner
            colour="green"
            icon="exchange-alt"
            boldText="ZEV Models"
            regularText="no current activity"
            className="no-hover"
          />
        )}
        {activityCount.creditsNew > 0
        && (
        <ActivityBanner
          colour="yellow"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsNew} saved awaiting submission`}
          linkTo={`${ROUTES_SALES.LIST}?status=New`}
        />
        )}
        {activityCount.creditsAwaiting > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsAwaiting} awaiting validation`}
          linkTo={`${ROUTES_SALES.LIST}?status=Submitted%2CRecommend`}
        />
        )}
        {activityCount.creditsIssued > 0
        && (
        <ActivityBanner
          colour="green"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsIssued} processed by government`}
          linkTo={`${ROUTES_SALES.LIST}?status=Validated`}
        />
        )}
        {activityCount.creditsNew === 0
        && activityCount.creditsAwaiting === 0 && activityCount.creditsIssued === 0
        && (
          <ActivityBanner
            colour="green"
            icon="check-square"
            boldText="Credit Applications"
            regularText="no current activity"
            className="no-hover"
          />
        )}
        {activityCount.transfersAwaitingPartner > 0
        && (
        <ActivityBanner
          colour="yellow"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transfersAwaitingPartner} awaiting partner confirmation`}
        />
        )}
        {activityCount.transferAwaitingGovernment > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transfersAwaitingGovernment} awaiting  government action`}
        />
        )}
        {activityCount.transferRecorded > 0
        && (
        <ActivityBanner
          colour="green"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transfersRecorded} recorded by government`}
          className="no-hover"
        />
        )}
        {activityCount.transfersAwaitingGovernment === 0
        && activityCount.transfersAwaitingPartner === 0 && activityCount.transfersRecorded === 0
        && (
          <ActivityBanner
            colour="green"
            icon="exchange-alt"
            boldText="Credit Transfer"
            regularText="no current activity"
            className="no-hover"
          />
        )}
      </div>
    </div>
  );
};

ActionsBceid.defaultProps = {
};

ActionsBceid.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
};

export default ActionsBceid;
