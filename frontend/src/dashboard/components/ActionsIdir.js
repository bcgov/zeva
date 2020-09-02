import React, { useState, useEffect } from 'react';
import axios from 'axios';

import ROUTES_CREDITS from '../../app/routes/Credits';
import ROUTES_SALES_SUBMISSIONS from '../../app/routes/SalesSubmissions';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ActivityBanner from './ActivityBanner';

const ActionsIdir = (props) => {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const [activityCount, setActivityCount] = useState({
    modelAwaitingValidation: 0,
    modelValidated: 0,
    modelInfoRequest: 0,
    creditNew: 0,
    creditsAwaiting: 0,
    creditsIssued: 0,
    transferAwaitingPartner: 0,
    transferAwaitingGovernment: 0,
    transferRecorded: 0,
  });

  const refreshList = () => {
    axios.all([
      axios.get(ROUTES_SALES_SUBMISSIONS.LIST),
      axios.get(ROUTES_VEHICLES.LIST),
    ]).then(axios.spread((salesResponse, vehiclesResponse) => {
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
        {activityCount.submittedVehicles > 0 && user.hasPermission('VALIDATE_ZEV')
        && (
        <ActivityBanner
          colour="yellow"
          icon="car"
          boldText="ZEV Models"
          regularText={`${activityCount.submittedVehicles} submitted for validation`}
          linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Submitted`}
        />
        )}
        {user.hasPermission('VALIDATE_ZEV') && activityCount.submittedVehicles === 0
        && (
          <ActivityBanner
            colour="green"
            icon="car"
            boldText="ZEV Models"
            regularText="no current activity"
            className="no-hover"
          />
        )}
        {activityCount.creditsAnalyst > 0 && user.hasPermission('RECOMMEND_SALES')
        && (
        <ActivityBanner
          colour="yellow"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsAnalyst} require analyst/engineer validation`}
          linkTo={`${ROUTES_CREDITS.CREDIT_REQUESTS}?status=Submitted`}
        />
        )}
        {activityCount.creditsRecommendApprove > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsRecommendApprove} recommended for director approval`}
          linkTo={`${ROUTES_CREDITS.CREDIT_REQUESTS}?status=Recommend%20Approval`}
        />
        )}
        {activityCount.creditsRecommendReject > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsRecommendReject} recommended for director rejection`}
          linkTo={`${ROUTES_CREDITS.CREDIT_REQUESTS}?status=Recommend%20Rejection`}
        />
        )}
        {((!user.hasPermission('RECOMMEND_SALES') && activityCount.creditsRecommendApprove === 0
        && activityCount.creditsRecommendReject === 0) || (user.hasPermission('RECOMMEND_SALES') && activityCount.creditsRecommendApprove === 0
          && activityCount.creditsRecommendReject === 0 && activityCount.creditsAnalyst === 0))
        && (
          <ActivityBanner
            colour="green"
            icon="check-square"
            boldText="Credit Applications"
            regularText="no current activity"
            className="no-hover"

          />
        )}
        {activityCount.transferAwaitingPartner > 0 && user.hasPermission('RECOMMEND_SALES')
        && (
        <ActivityBanner
          colour="yellow"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transferAwaitingPartner} awaiting partner confirmation`}
        />
        )}
        {activityCount.transferAwaitingGovernment > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transferAwaitingGovernment} require director approval`}
        />
        )}
        {activityCount.transferAwaitingGovernment === 0
        && activityCount.transferAwaitingPartner === 0 && activityCount.transferRecorded === 0
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

ActionsIdir.defaultProps = {
};

ActionsIdir.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default ActionsIdir;
