/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import history from '../app/History';
import ROUTES_SALES from '../app/routes/Sales';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';
import CustomPropTypes from '../app/utilities/props';
import upload from '../app/utilities/upload';
import withReferenceData from '../app/utilities/with_reference_data';
import SalesSubmissionPage from './components/SalesSubmissionPage';

const SalesSubmissionContainer = (props) => {
  const { user, referenceData } = props;
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

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
      const { id } = response.data;
      history.push(ROUTES_SALES.DETAILS.replace(':id', id));
    }).catch((error) => {
      const { response } = error;

      if (response.status === 400) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('An error has occurred while uploading. Please try again later.');
      }
    });
  };

  useEffect(() => {
    refreshList(true);
  }, []);

  if (loading) {
    return (<Loading />);
  }

  return ([
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    <SalesSubmissionPage
      errorMessage={errorMessage}
      files={files}
      key="page"
      setUploadFiles={setFiles}
      submissions={submissions}
      upload={doUpload}
      user={user}
      years={referenceData.years}
    />,
  ]);
};

SalesSubmissionContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  referenceData: CustomPropTypes.referenceData.isRequired,
};

export default withReferenceData(SalesSubmissionContainer)();
