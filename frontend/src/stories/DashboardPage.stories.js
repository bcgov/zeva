import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActionsBceid from '../dashboard/components/ActionsBceid';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import '../app/css/index.scss';
// import { storiesOf } from "@storybook/react";
// import { action } from "@storybook/addon-actions";
import { storiesOf } from '@storybook/react';
import ActivityBanner from '../dashboard/components/ActivityBanner';

library.add(fab, far, fas);

const BceidUser = {
  displayName: 'Bob Boss',
  email: 'asdsf@saf.com',
  firstName: 'Gov',
  isGovernment: false,
  permission: ['EDIT_ORGANIZATONS'],
  organization: {
    balance: { A: 0, B: 0 },
    createTimestamp: '2020-05-26T11:22:04.046832-07:00',
    id: 62,
    isActive: true,
    isGovernment: false,
    name: 'Toyota',
    organizationAddress: null,
    shortName: null,
    phone: '111-111-1111',
    title: 'Toyota employee',
    username: 'fs1',
  },
  hasPermission: 'EDIT_ORGANIZATONS',
};



const activityCountIdir = {
  creditsAnalyst: 2,
  creditsAwaiting: 0,
  creditsIssued: 0,
  creditsRecommendApprove: 1,
  creditsRecommendReject: 1,
  modelAwaitingValidation: 0,
  modelInfoRequest: 0,
  modelValidated: 0,
  submittedVehicles: 7,
  transfersAwaitingGovernment: 0,
  transfersAwaitingPartner: 0,
  transfersRecorded: 0,
};

const activityCountBceid = {
  creditsAwaiting: 6,
  creditsIssued: 2,
  creditsDraft: 3,
  modelAwaitingValidation: 0,
  modelInfoRequest: 0,
  modelValidated: 0,
  modelsAwaitingValidation: 7,
  modelsInfoRequest: 4,
  modelsValidated: 8,
  transfersAwaitingGovernment: 1,
  transfersAwaitingPartner: 2,
  transfersRecorded: 5,
};

const activityCountBceidNone = {
  creditsAwaiting: 0,
  creditsIssued: 0,
  creditsDraft: 0,
  modelAwaitingValidation: 0,
  modelInfoRequest: 0,
  modelValidated: 0,
  modelsAwaitingValidation: 0,
  modelsInfoRequest: 0,
  modelsValidated: 0,
  transfersAwaitingGovernment: 0,
  transfersAwaitingPartner: 0,
  transfersRecorded: 0,
};

storiesOf('Activity Banner BCEID', module)
  .add('yellow range information request', () => (
    <div id="actions" className="dashboard-card">
      <ActivityBanner
        user={BceidUser}
        colour="yellow"
        icon="car"
        boldText="ZEV Models"
        regularText="2 range information requests"
        linkTo="/"
      />
    </div>
  ))
  .add('blue awaiting validation', () => (
    <div id="actions" className="dashboard-card">
      <ActivityBanner
        user={BceidUser}
        colour="blue"
        icon="car"
        boldText="ZEV Models"
        regularText="2 awaiting validation"
        linkTo="/"
      />
    </div>
  ))
  .add('green validated by Government of B.C.', () => (
    <div id="actions" className="dashboard-card">
      <ActivityBanner
        user={BceidUser}
        colour="green"
        icon="car"
        boldText="ZEV Models"
        regularText="2 validated by Government of B.C."
        linkTo="/"
      />
    </div>
  ))
  .add('green no application activity', () => (
    <div id="actions" className="dashboard-card">
      <ActivityBanner
        colour="green"
        icon="check-square"
        boldText="Credit Transfer"
        regularText="no current activity"
        className="no-hover"
      />
    </div>
  ))

  .add('yellow application awaiting submision', () => (
    <div id="actions" className="dashboard-card">
      <ActivityBanner
        colour="yellow"
        icon="check-square"
        boldText="Credit Applications"
        regularText="2 saved awaiting submission"
        linkTo="/"
      />
    </div>
  ))

  .add('no transfer activity', () => (
    <div id="actions" className="dashboard-card">
      <ActivityBanner
        colour="green"
        icon="exchange-alt"
        boldText="Credit Transfer"
        regularText="no current activity"
        className="no-hover"
      />
    </div>
  ));

storiesOf('Actions page bceid', module)
  .add('whole page', () => (
    <ActionsBceid activityCount={activityCountBceid} loading={false} />
  )) 
  .add('no activity', () => (
    <ActionsBceid activityCount={activityCountBceidNone} loading={false} />
  ));
