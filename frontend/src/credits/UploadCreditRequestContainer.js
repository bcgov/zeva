/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';
import moment from 'moment-timezone';
import { useParams } from 'react-router-dom';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import history from '../app/History';
import Loading from '../app/components/Loading';
import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests';
import CustomPropTypes from '../app/utilities/props';
import { upload } from '../app/utilities/upload';
import CreditRequestsUploadPage from './components/CreditRequestsUploadPage';
import ROUTES_ICBCVERIFICATION from '../app/routes/ICBCVerification';

const UploadCreditRequestsContainer = (props) => {
  const { user } = props;
  const [errorMessage, setErrorMessage] = useState(null);
  const [files, setFiles] = useState([]);
  const [icbcDate, setIcbcDate] = useState('- no icbc data yet -');
  const [loading, setLoading] = useState(true);
  const { id } = useParams();


  const refreshDetails = () => {
    setLoading(true);
    axios.get(ROUTES_ICBCVERIFICATION.DATE)
      .then((response) => {
        if (response.data.uploadDate) {
          setIcbcDate(moment(response.data.uploadDate).format('MMM D, YYYY'));
        }
      });
    setLoading(false);
  };

  const doUpload = () => {
    setLoading(true);
    let data = {};

    if (id) {
      data = {
        id,
      };
    }

    upload(ROUTES_CREDIT_REQUESTS.UPLOAD, files, data).then((response) => {
      const { id: creditRequestId } = response.data;
      history.push(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', creditRequestId));
    }).catch((error) => {
      const { response } = error;

      if (response.status === 400) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('An error has occurred while uploading. Please try again later.');
      }

      setLoading(false);
    });
  };

  useEffect(() => { refreshDetails(); }, []);
  if (loading) {
    return (<Loading />);
  }
  return ([
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    <CreditRequestsUploadPage
      icbcDate={icbcDate}
      errorMessage={errorMessage}
      files={files}
      key="page"
      setUploadFiles={setFiles}
      upload={doUpload}
      user={user}
    />,
  ]);
};

UploadCreditRequestsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(UploadCreditRequestsContainer);
