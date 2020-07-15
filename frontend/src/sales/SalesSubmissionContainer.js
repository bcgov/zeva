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
import SalesSubmissionValidationPage from './components/SalesSubmissionValidationPage';

const SalesSubmissionContainer = (props) => {
  const { user, referenceData } = props;
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [workflowState, setWorkflowState] = useState('new');

  const [details, setDetails] = useState({
    entries: [],
    validationMessages: [],
    submissionId: '',
  });

  const [files, setFiles] = useState([]);

  const refreshList = (showLoading) => {
    setLoading(showLoading);

    axios.get(ROUTES_SALES_SUBMISSIONS.LIST).then((response) => {
      const nonValidatedVehicles = response.data
        .filter((vehicle) => vehicle.validationStatus !== 'VALIDATED' && vehicle.validationStatus !== 'DELETED');
      setSubmissions(nonValidatedVehicles);
      setLoading(false);
    });
  };

  const doUpload = () => {
    upload(ROUTES_SALES.UPLOAD, files).then((response) => {
      setDetails(response.data);
      setWorkflowState('validating');
    }).catch((error) => {
      const { response } = error;

      if (response.status === 400) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('An error has occurred while uploading. Please try again later.');
      }
    });
  };

  const sign = (id) => {
    axios.patch(ROUTES_SALES_SUBMISSIONS.DETAILS.replace(':id', id), {
      validationStatus: 'SUBMITTED',
    }).then(() => {
      setWorkflowState('complete');
    });
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
    case 'validating':
      content = (
        <SalesSubmissionValidationPage
          backToStart={backToStart}
          details={details}
          key="page"
          setShowModal={setShowModal}
          showModal={showModal}
          sign={sign}
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
          errorMessage={errorMessage}
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
