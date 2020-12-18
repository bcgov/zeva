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
const historyData = [
  {
    createTimestamp: '2020-01-01T15:51:51.602702-07:00',
    createUser: {
      id: 11, firstName: null, lastName: null, email: null, displayName: 'Wendy Worker',
    },
    validationStatus: 'DRAFT',
  },

  {
    createTimestamp: '2020-02-01T16:12:47.114148-07:00',
    createUser: {
      id: 11, firstName: null, lastName: null, email: null, displayName: 'Barb Boss',
    },
    validationStatus: 'SUBMITTED',
  },

  {
    createTimestamp: '2020-03-01T16:16:17.825740-07:00',
    createUser: {
      id: 10, firstName: 'Gov', lastName: 'User', email: 'asdsf@saf.com', displayName: 'Andy Analyst',
    },
    validationStatus: 'CHECKED',
  },

  {
    createTimestamp: '2020-04-01T16:16:21.220723-07:00',
    createUser: {
      id: 10, firstName: 'Gov', lastName: 'User', email: 'asdsf@saf.com', displayName: 'Andy Analyst',
    },
    validationStatus: 'RECOMMEND_APPROVAL',
  },

  {
    createTimestamp: '2020-05-01T16:16:32.941211-07:00',
    createUser: {
      id: 10, firstName: 'Gov', lastName: 'User', email: 'asdsf@saf.com', displayName: 'Devon Director',
    },
    validationStatus: 'VALIDATED',
  },
];

const submissionDraft = {
  content: [],
  validationStatus: 'DRAFT',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls',
};
const submissionErrors = {
  content: [],
  validationStatus: 'DRAFT',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls',
};
const submissionSubmitted = {
  content: [],
  validationStatus: 'SUBMITTED',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls',
};
const submissionValidated = {
  content: [],
  validationStatus: 'VALIDATED',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls',
};
const submissionRecommend = {
  content: [],
  validationStatus: 'RECOMMEND_APPROVAL',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls',
};
const submissionChecked = {
  content: [],
  validationStatus: 'CHECKED',
  createUser: { displayName: 'emily' },
  submissionDate: 'March 3, 2020',
  updateUser: { displayName: 'Teddy' },
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls',
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
      alertType="credit"
      submission={submissionSubmitted}
      isGovernment
    />
  ))
  .add('validated BCEID', () => (
    <Alert
      submission={submissionValidated}
      alertType="credit"
    />
  ))
  .add('validated IDIR', () => (
    <Alert
      submission={submissionValidated}
      alertType="credit"
      isGovernment
    />
  ))

  .add('recommend approval idir', () => (
    <Alert
      submission={submissionRecommend}
      alertType="credit"
      isGovernment
      icbcDate="Oct 1, 2020"
    />
  ))

  .add('checked idir', () => (
    <Alert
      submission={submissionChecked}
      alertType="credit"
      isGovernment
      icbcDate="Oct 1, 2020"
    />
  ));
