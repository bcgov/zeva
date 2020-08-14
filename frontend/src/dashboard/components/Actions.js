import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

import ROUTES_SALES_SUBMISSIONS from '../../app/routes/SalesSubmissions';
import ROUTES_VEHICLES from '../../app/routes/Vehicles';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ActivityBanner from './ActivityBanner';

const Actions = (props) => {
  const { details } = props;
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
    const date3months = moment().subtract(3, 'months').calendar();
    axios.all([
      axios.get(ROUTES_SALES_SUBMISSIONS.LIST),
      axios.get(ROUTES_VEHICLES.LIST),
    ]).then(axios.spread((salesResponse, vehiclesResponse) => {
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
        modelAwaitingValidation: submittedVehicles.length,
        modelvalidated: validatedVehicles.length,
        modelInfoRequest: changesRequested.length,
        creditsNew: newCredits.length,
        creditsIssued: validatedSales.length,
        creditAwaiting: submittedSales.length,
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
        {activityCount.modelInfoRequest > 0
        && (
        <ActivityBanner
          colour="yellow"
          icon="car"
          boldText="ZEV Models"
          regularText={`${activityCount.modelInfoRequest} range information requests`}
          linkTo={ROUTES_VEHICLES.LIST}
          filter="CHANGES_REQUESTED"
        />
        )}
        {activityCount.modelAwaitingValidation > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="car"
          boldText="ZEV Models"
          regularText={`${activityCount.modelAwaitingValidation} awaiting validation`}
        />
        )}
        {activityCount.modelValidated > 0
        && (
        <ActivityBanner
          colour="green"
          icon="car"
          boldText="ZEV Models"
          regularText={`${activityCount.modelValidated} validated by government`}
        />
        )}
        {activityCount.modelInfoRequest === 0
        && activityCount.modelAwaitingValidation === 0 && activityCount.modelValidated === 0
        && (
          <ActivityBanner
            colour="green"
            icon="exchange-alt"
            boldText="ZEV Models"
            regularText="no current activity"
          />
        )}
        {activityCount.creditsNew > 0
        && (
        <ActivityBanner
          colour="yellow"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsNew} saved awaiting submission`}
        />
        )}
        {activityCount.creditsAwaiting > 0
        && (
        <ActivityBanner
          colour="blue"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditAwaiting} awaiting validation`}
        />
        )}
        {activityCount.creditsIssued > 0
        && (
        <ActivityBanner
          colour="green"
          icon="check-square"
          boldText="Credit Applications"
          regularText={`${activityCount.creditsIssued} processed by government`}
        />
        )}
        {activityCount.creditNew === 0
        && activityCount.creditsAwaiting === 0 && activityCount.creditsIssued === 0
        && (
          <ActivityBanner
            colour="green"
            icon="exchange-alt"
            boldText="Credit Applications"
            regularText="no current activity"
          />
        )}
        {activityCount.transferAwaitingPartner > 0
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
          regularText={`${activityCount.transferAwaitingGovernment} awaiting  government action`}
        />
        )}
        {activityCount.transferRecorded > 0
        && (
        <ActivityBanner
          colour="green"
          icon="exchange-alt"
          boldText="Credit Transfer"
          regularText={`${activityCount.transferRecorded} recorded by government`}
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
          />
        )}
      </div>
    </div>
  );
};

Actions.defaultProps = {
};

Actions.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
};

export default Actions;
