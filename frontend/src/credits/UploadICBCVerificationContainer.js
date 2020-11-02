import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toastr from 'toastr';

import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import ROUTES_ICBCVERIFICATION from '../app/routes/ICBCVerification';
import CustomPropTypes from '../app/utilities/props';
import { chunkUpload } from '../app/utilities/upload';
import UploadVerificationData from './components/UploadVerificationData';

const UploadICBCVerificationContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const { user } = props;
  const [dateCurrentTo, setDateCurrentTo] = useState('');
  const [previousDateCurrentTo, setPreviousDateCurrentTo] = useState('No ICBC data uploaded yet');
  const [files, setFiles] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);

  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const refreshList = (showLoading) => {
    setLoading(showLoading);
    axios.get(ROUTES_ICBCVERIFICATION.DATE).then((response) => {
      if (response.data.uploadDate) {
        setPreviousDateCurrentTo(response.data.uploadDate);
      }
      setLoading(false);
    });
    setDateCurrentTo(date);
  };

  const doUpload = () => {
    setLoading(true);

    const { promises, filename, chunks } = chunkUpload(ROUTES_ICBCVERIFICATION.CHUNK_UPLOAD, files);

    Promise.all(promises).then(() => {
      axios.post(ROUTES_ICBCVERIFICATION.UPLOAD, {
        filename,
        chunks,
        submissionCurrentDate: dateCurrentTo,
      }).then(() => {
        setAlertMessage('upload successful');
        toastr.success('upload successful!', '', { positionClass: 'toast-bottom-right' });
        setFiles([]);
      }).catch((error) => {
        console.error('error');
        console.error(error);
        const { response } = error;
        if (response.status === 400) {
          setAlertMessage(error.response.data);
        } else {
          setAlertMessage('An error has occurred while uploading. Please try again later.');
        }
      }).finally(() => {
        setLoading(false);
      });
    }).catch((error) => {
      console.error('error');
      console.error(error);
      setAlertMessage('An error has occurred while uploading. Please try again later.');
    });
  };

  useEffect(() => {
    refreshList(true);
  }, []);
  if (loading) {
    return <Loading />;
  }

  return ([
    <CreditTransactionTabs active="icbc-update" key="tabs" user={user} />,
    <UploadVerificationData
      alertMessage={alertMessage}
      dateCurrentTo={dateCurrentTo}
      files={files}
      key="page"
      previousDateCurrentTo={previousDateCurrentTo}
      setDateCurrentTo={setDateCurrentTo}
      setUploadFiles={setFiles}
      title="Upload ICBC Registration Data"
      upload={doUpload}
      user={user}
    />,
  ]);
};

UploadICBCVerificationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default UploadICBCVerificationContainer;
