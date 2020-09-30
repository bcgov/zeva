import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import '../app/css/index.scss';

// import{ action } from "@storybook/addon-actions";
import { storiesOf } from '@storybook/react';

import Alert from '../app/components/Alert';

library.add(fab, far, fas);

storiesOf('alert', module)
  .add('submitted alert', () => (
    <Alert
      status="SUBMITTED"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
    />
  ))
  .add('validated alert', () => (
    <Alert
      status="VALIDATED"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
    />
  ))
  .add('changes requested alert', () => (
    <Alert
      status="CHANGES_REQUESTED"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
    />
  ))
  .add('rejected alert', () => (
    <Alert
      status="REJECTED"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
    />
  ))
  .add('draft alert', () => (
    <Alert
      status="DRAFT"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
    />
  ));
