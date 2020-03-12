/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useState } from 'react';
import ROUTES_SALES from '../app/routes/Sales';

import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import CustomPropTypes from '../app/utilities/props';
import upload from '../app/utilities/upload';
import withReferenceData from '../app/utilities/with_reference_data';
import SalesSubmissionConfirmationPage from './components/SalesSubmissionConfirmationPage';
import SalesSubmissionPage from './components/SalesSubmissionPage';
import SalesSubmissionSignaturesPage from './components/SalesSubmissionSignaturesPage';
import SalesSubmissionValidationPage from './components/SalesSubmissionValidationPage';

const SalesSubmissionContainer = (props) => {
  const { user, referenceData } = props;

  const [workflowState, setWorkflowState] = useState('new');

  const [details, setDetails] = useState({
    entries: [],
    validationMessages: [],
    submissionID: '',
  });

  const [files, setFiles] = useState([]);

  const doUpload = () => {
    upload(ROUTES_SALES.UPLOAD, files).then((response) => {
      setDetails(response.data);
      setWorkflowState('validating');
    });
  };

  const readyToSign = () => {
    setWorkflowState('readyToSign');
  };

  const backToValidationPage = () => {
    setWorkflowState('validating');
  };

  const sign = () => {
    setWorkflowState('complete');
  };

  const backToStart = () => {
    setWorkflowState('new');
    // @todo clear any details, maybe issue delete request
  };

  let content;

  switch (workflowState) {
    case 'readyToSign':
      content = (
        <SalesSubmissionSignaturesPage
          backToValidationPage={backToValidationPage}
          details={details}
          key="page"
          sign={sign}
          user={user}
        />
      );
      break;
    case 'validating':
      content = (
        <SalesSubmissionValidationPage
          backToStart={backToStart}
          details={details}
          key="page"
          readyToSign={readyToSign}
          user={user}
        />
      );
      break;
    case 'complete':
      content = (
        <SalesSubmissionConfirmationPage
          details={details}
          key="page"
          user={user}
        />
      );
      break;
    case 'error':
      content = (<p>An error occurred in validation. Please restart the submission</p>);
      break;
    case 'new':
    default:
      content = (
        <SalesSubmissionPage
          files={files}
          key="page"
          setUploadFile={setFiles}
          upload={doUpload}
          user={user}
          years={referenceData.years}
        />
      );
  }

  return ([
    <CreditTransactionTabs active="credit-requests" key="tabs" />,
    content,
  ]);
};

SalesSubmissionContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  referenceData: CustomPropTypes.referenceData.isRequired,
};

export default withReferenceData(SalesSubmissionContainer)();
