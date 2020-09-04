import React from 'react';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ActivityBanner from './ActivityBanner';
import ROUTES_SALES from '../../app/routes/Sales';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';

const ActionsBceid = (props) => {
  const { activityCount, loading } = props;
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
