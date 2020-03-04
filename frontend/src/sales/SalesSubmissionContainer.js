/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ROUTES_SALES from '../app/routes/Sales';

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

  const submissionID = '2020-02-28';

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


  switch (workflowState) {
    case 'readyToSign':
      return (
        <SalesSubmissionSignaturesPage
          user={user}
          sign={sign}
          submissionID={submissionID}
          backToValidationPage={backToValidationPage}
          details={details}
        />
      );
    case 'validating':
      return (
        <SalesSubmissionValidationPage
          user={user}
          readyToSign={readyToSign}
          submissionID={submissionID}
          details={details}
          backToStart={backToStart}
        />
      );
    case 'complete':
      return (
        <SalesSubmissionConfirmationPage
          user={user}
          submissionID={submissionID}
          details={details}
        />
      );
    case 'error':
      return (<p>An error occurred in validation. Please restart the submission</p>);
    case 'new':
    default:
      return (
        <SalesSubmissionPage
          user={user}
          upload={doUpload}
          years={referenceData.years}
          uploadReady={files.length > 0}
          setUploadFile={setFiles}
        />
      );
  }

};

SalesSubmissionContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  referenceData: CustomPropTypes.referenceData.isRequired,
};

export default withReferenceData(SalesSubmissionContainer)();
