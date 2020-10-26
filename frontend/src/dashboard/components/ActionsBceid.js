import React from 'react';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import ActivityBanner from './ActivityBanner';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';
import ROUTES_CREDIT_TRANSFERS from '../../app/routes/CreditTransfers';

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
        {activityCount.modelsDraft > 0
        && (
        <ActivityBanner
          colour="yellow"
          icon="car"
          boldText="ZEV Models"
          regularText={`${activityCount.modelsDraft} saved in draft`}
          linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Draft`}
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
          regularText={`${activityCount.modelsValidated} validated by Government of B.C.`}
          linkTo={`${ROUTES_VEHICLES.LIST}?col-status=Validated`}
        />
        )}
        {activityCount.modelsInfoRequest === 0
        && activityCount.modelsAwaitingValidation === 0 && activityCount.modelsValidated === 0
        && (
          <ActivityBanner
            colour="green"
            icon="car"
            boldText="ZEV Models"
            regularText="no current activity"
            linkTo={ROUTES_VEHICLES.LIST}
          />
        )}
        {activityCount.creditsNew > 0
        && (
        <ActivityBanner
          colour="yellow"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsNew} saved awaiting submission`}
          linkTo={`${ROUTES_CREDIT_REQUESTS.LIST}?status=New`}
        />
        )}
        {activityCount.creditsAwaiting > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsAwaiting} awaiting validation`}
          linkTo={`${ROUTES_CREDIT_REQUESTS.LIST}?status=Submitted`}
        />
        )}
        {activityCount.creditsIssued > 0
        && (
        <ActivityBanner
          colour="green"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsIssued} processed by Government of B.C.`}
          linkTo={`${ROUTES_CREDIT_REQUESTS.LIST}?status=Issued`}
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
            linkTo={ROUTES_CREDIT_REQUESTS.LIST}
          />
        )}
        {activityCount.transfersAwaitingPartner > 0
        && (
        <ActivityBanner
          colour="yellow"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transfersAwaitingPartner} awaiting partner confirmation`}
          linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Submitted`}
        />
        )}
        {activityCount.transfersAwaitingGovernment > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transfersAwaitingGovernment} awaiting  Government of B.C. action`}
          linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Approved`}
        />
        )}
        {activityCount.transfersRecorded > 0
        && (
        <ActivityBanner
          colour="green"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transfersRecorded} recorded by Government of B.C.`}
          linkTo={`${ROUTES_CREDIT_TRANSFERS.LIST}?status=Issued`}
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
            linkTo={ROUTES_CREDIT_TRANSFERS.LIST}
          />
        )}
      </div>
    </div>
  );
};

ActionsBceid.defaultProps = {
};

ActionsBceid.propTypes = {
  activityCount: PropTypes.shape().isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ActionsBceid;
