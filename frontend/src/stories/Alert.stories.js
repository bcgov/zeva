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
storiesOf('vehicle alert', module)
  .add('changes requested alert', () => (
    <Alert
      status="CHANGES_REQUESTED"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
      alertType="vehicle"
    />
  ))
  .add('draft alert', () => (
    <Alert
      status="DRAFT"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
      alertType="vehicle"
    />
  ))
  .add('submitted alert', () => (
    <Alert
      status="SUBMITTED"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
      alertType="vehicle"
    />
  ))
  .add('validated alert', () => (
    <Alert
      status="VALIDATED"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
      alertType="vehicle"
    />
  ))
  .add('rejected alert', () => (
    <Alert
      status="REJECTED"
      user="Emily"
      updateTimestamp="Dec 1, 2020"
      alertType="vehicle"
    />
  ));

const submissionDraft = {
  validationStatus: 'DRAFT',
  createUser: { displayName: 'emily' },
  submissionDate: 'March 3, 2020',
  updateUser: { displayName: 'Teddy' },
  unselected: 1,
};
const submissionErrors = {
  validationStatus: 'DRAFT',
  createUser: { displayName: 'emily' },
  submissionDate: 'March 3, 2020',
  updateUser: { displayName: 'Teddy' },
  unselected: 1,
};
const submissionSubmitted = {
  validationStatus: 'SUBMITTED',
  createUser: { displayName: 'emily' },
  submissionDate: 'March 3, 2020',
  updateUser: { displayName: 'Teddy' },
  unselected: 1,
};
const submissionValidated = {
  validationStatus: 'VALIDATED',
  createUser: { displayName: 'emily' },
  submissionDate: 'March 3, 2020',
  updateUser: { displayName: 'Teddy' },
  unselected: 1,
};
const submissionRecommend = {
  validationStatus: 'RECOMMEND_APPROVAL',
  createUser: { displayName: 'emily' },
  submissionDate: 'March 3, 2020',
  updateUser: { displayName: 'Teddy' },
  unselected: 1,
};
const submissionChecked = {
  validationStatus: 'CHECKED',
  createUser: { displayName: 'emily' },
  submissionDate: 'March 3, 2020',
  updateUser: { displayName: 'Teddy' },
  unselected: 1,
};
storiesOf('credit alert', module)
  .add('errors bceid', () => (
    <Alert
      user="Emily"
      date="Dec 1, 2020"
      alertType="credit"
      submission={submissionErrors}
      invalidSubmission
    />
  ))
  .add('draft BCEID', () => (
    <Alert
      user="Emily"
      date="Dec 1, 2020"
      alertType="credit"
      submission={submissionDraft}
    />
  ))
  .add('submitted BCEID', () => (
    <Alert
      status="SUBMITTED"
      user="Emily"
      date="Dec 1, 2020"
      alertType="credit"
      submission={submissionSubmitted}
    />
  ))
  .add('submitted IDIR', () => (
    <Alert
      status="SUBMITTED"
      user="Emily"
      date="Dec 1, 2020"
      alertType="credit"
      submission={submissionSubmitted}
      isGovernment
    />
  ))
  .add('validated BCEID', () => (
    <Alert
      submission={submissionValidated}
      user="Emily"
      date="Dec 1, 2020"
      alertType="credit"
    />
  ))
  .add('validated IDIR', () => (
    <Alert
      submission={submissionValidated}
      user="Emily"
      date="Dec 1, 2020"
      alertType="credit"
      isGovernment
    />
  ))

  .add('recommend approval idir', () => (
    <Alert
      submission={submissionRecommend}
      user="Emily"
      date="Dec 1, 2020"
      alertType="credit"
      isGovernment
      icbcDate="Oct 1, 2020"
    />
  ))

  .add('checked idir', () => (
    <Alert
      submission={submissionChecked}
      user="Emily"
      date="Dec 1, 2020"
      alertType="credit"
      isGovernment
      icbcDate="Oct 1, 2020"
    />
  ));
