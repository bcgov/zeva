import React from 'react';
import PropTypes from 'prop-types';

import ROUTES_CREDITS from '../../app/routes/Credits';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ActivityBanner from './ActivityBanner';

const ActionsIdir = (props) => {
  const { user, activityCount, loading } = props;
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
        {activityCount.transfersAwaitingPartner > 0 && user.hasPermission('RECOMMEND_SALES')
        && (
        <ActivityBanner
          colour="yellow"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transfersAwaitingPartner} awaiting partner confirmation`}
        />
        )}
        {activityCount.transfersAwaitingGovernment > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transfersAwaitingGovernment} require director approval`}
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

ActionsIdir.defaultProps = {
};

ActionsIdir.propTypes = {
  activityCount: PropTypes.shape().isRequired,
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ActionsIdir;
