import React from 'react';
import DashboardPage from '../dashboard/components/DashboardPage';
import ActionsBceid from '../dashboard/components/ActionsBceid';
import '../app/css/index.scss';
// import { storiesOf } from "@storybook/react";
// import { action } from "@storybook/addon-actions";

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
export default { title: 'Bceid user' };

export const BceidDashboard = () => <DashboardPage user={BceidUser} />;
