import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { storiesOf } from '@storybook/react';
import '../app/css/index.scss';
import VehicleAlert from '../vehicles/components/VehicleAlert';
// import{ action } from "@storybook/addon-actions";

library.add(fab, far, fas);
storiesOf('vehicle alert', module)
  .add('changes requested alert', () => (
    <VehicleAlert status="CHANGES_REQUESTED" user="Emily" date="Dec 1, 2020" />
  ))
  .add('draft alert', () => (
    <VehicleAlert status="DRAFT" user="Emily" date="Dec 1, 2020" />
  ))
  .add('submitted alert', () => (
    <VehicleAlert status="SUBMITTED" user="Emily" date="Dec 1, 2020" />
  ))
  .add('validated alert', () => (
    <VehicleAlert status="VALIDATED" user="Emily" date="Dec 1, 2020" />
  ))
  .add('rejected alert', () => (
    <VehicleAlert status="REJECTED" user="Emily" date="Dec 1, 2020" />
  ));
