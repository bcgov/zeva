import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { storiesOf } from '@storybook/react';
import '../app/css/index.scss';
import CreditRequestAlert from '../credits/components/CreditRequestAlert';
// import{ action } from "@storybook/addon-actions";
library.add(fab, far, fas);
const historyData = [
  {
    createTimestamp: '2020-01-01T15:51:51.602702-07:00',
    createUser: {
      id: 11,
      firstName: null,
      lastName: null,
      email: null,
      displayName: 'Wendy Worker'
    },
    validationStatus: 'DRAFT'
  },

  {
    createTimestamp: '2020-02-01T16:12:47.114148-07:00',
    createUser: {
      id: 11,
      firstName: null,
      lastName: null,
      email: null,
      displayName: 'Barb Boss'
    },
    validationStatus: 'SUBMITTED'
  },

  {
    createTimestamp: '2020-03-01T16:16:17.825740-07:00',
    createUser: {
      id: 10,
      firstName: 'Gov',
      lastName: 'User',
      email: 'asdsf@saf.com',
      displayName: 'Andy Analyst'
    },
    validationStatus: 'CHECKED'
  },

  {
    createTimestamp: '2020-04-01T16:16:21.220723-07:00',
    createUser: {
      id: 10,
      firstName: 'Gov',
      lastName: 'User',
      email: 'asdsf@saf.com',
      displayName: 'Andy Analyst'
    },
    validationStatus: 'RECOMMEND_APPROVAL'
  },

  {
    createTimestamp: '2020-05-01T16:16:32.941211-07:00',
    createUser: {
      id: 10,
      firstName: 'Gov',
      lastName: 'User',
      email: 'asdsf@saf.com',
      displayName: 'Devon Director'
    },
    validationStatus: 'VALIDATED'
  }
];

const submissionDraft = {
  content: [],
  validationStatus: 'DRAFT',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls'
};
const submissionErrors = {
  content: [],
  validationStatus: 'DRAFT',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls'
};
const submissionSubmitted = {
  content: [],
  validationStatus: 'SUBMITTED',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls'
};
const submissionValidated = {
  content: [],
  validationStatus: 'VALIDATED',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls'
};
const submissionRecommend = {
  content: [],
  validationStatus: 'RECOMMEND_APPROVAL',
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls'
};
const submissionChecked = {
  content: [],
  validationStatus: 'CHECKED',
  createUser: { displayName: 'emily' },
  submissionDate: 'March 3, 2020',
  updateUser: { displayName: 'Teddy' },
  unselected: 1,
  history: historyData,
  filename: 'BC-ZEVA_Sales_Template_Toyota__2020-10-08.xls'
};
storiesOf('credit alert', module)
  .add('errors bceid', () => (
    <CreditRequestAlert submission={submissionErrors} invalidSubmission />
  ))
  .add('draft BCEID', () => <CreditRequestAlert submission={submissionDraft} />)
  .add('submitted BCEID', () => (
    <CreditRequestAlert submission={submissionSubmitted} />
  ))
  .add('submitted IDIR', () => (
    <CreditRequestAlert submission={submissionSubmitted} isGovernment />
  ))
  .add('validated BCEID', () => (
    <CreditRequestAlert submission={submissionValidated} />
  ))
  .add('validated IDIR', () => (
    <CreditRequestAlert submission={submissionValidated} isGovernment />
  ))

  .add('recommend approval idir', () => (
    <CreditRequestAlert
      submission={submissionRecommend}
      isGovernment
      icbcDate="Oct 1, 2020"
    />
  ))

  .add('checked idir', () => (
    <CreditRequestAlert
      submission={submissionChecked}
      isGovernment
      icbcDate="Oct 1, 2020"
    />
  ));
