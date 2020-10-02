/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { useParams } from 'react-router-dom';

import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import history from '../app/History';
import ROUTES_CREDITS from '../app/routes/Credits';
import ROUTES_SALES from '../app/routes/Sales';
import CustomPropTypes from '../app/utilities/props';
import upload from '../app/utilities/upload';
import SalesUploadPage from './components/SalesUploadPage';

const SalesSubmissionContainer = (props) => {
  const { user } = props;
  const [errorMessage, setErrorMessage] = useState(null);
  const [files, setFiles] = useState([]);

  const { id } = useParams();

  const doUpload = () => {
    let data = {};

    if (id) {
      data = {
        id,
      };
    }

    upload(ROUTES_SALES.UPLOAD, files, data).then((response) => {
      const { id: creditRequestId } = response.data;
      history.push(ROUTES_CREDITS.CREDIT_REQUEST_DETAILS.replace(':id', creditRequestId));
    }).catch((error) => {
      const { response } = error;

      if (response.status === 400) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('An error has occurred while uploading. Please try again later.');
      }
    });
  };

  useEffect(() => {}, []);

  return ([
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    <SalesUploadPage
      errorMessage={errorMessage}
      files={files}
      key="page"
      setUploadFiles={setFiles}
      upload={doUpload}
      user={user}
    />,
  ]);
};

SalesSubmissionContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(SalesSubmissionContainer);
