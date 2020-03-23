/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ROUTES_SALES from '../app/routes/Sales';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';

import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import CustomPropTypes from '../app/utilities/props';
import upload from '../app/utilities/upload';
import withReferenceData from '../app/utilities/with_reference_data';
import SalesSubmissionConfirmationPage from './components/SalesSubmissionConfirmationPage';
import SalesSubmissionPage from './components/SalesSubmissionPage';
import SalesSubmissionSignaturesPage from './components/SalesSubmissionSignaturesPage';
import SalesSubmissionValidationPage from './components/SalesSubmissionValidationPage';

const SalesSubmissionContainer = (props) => {
  const { user, referenceData } = props;
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [workflowState, setWorkflowState] = useState('new');

  const [details, setDetails] = useState({
    entries: [],
    validationMessages: [],
    submissionID: '',
  });

  const [files, setFiles] = useState([]);

  const refreshList = (showLoading) => {
    setLoading(showLoading);

    axios.get(ROUTES_SALES_SUBMISSIONS.LIST).then((response) => {
      setSubmissions(response.data);
      setLoading(false);
    });
  };

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

  useEffect(() => {
    refreshList(true);
  }, []);

  if (loading) {
    return (<Loading />);
  }

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
          setUploadFiles={setFiles}
          submissions={submissions}
          upload={doUpload}
          user={user}
          years={referenceData.years}
        />
      );
  }

  return ([
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    content,
  ]);
};

SalesSubmissionContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  referenceData: CustomPropTypes.referenceData.isRequired,
};

export default withReferenceData(SalesSubmissionContainer)();
