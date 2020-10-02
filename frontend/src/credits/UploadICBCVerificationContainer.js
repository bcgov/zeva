import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toastr from 'toastr';
import Loading from '../app/components/Loading';
import UploadVerificationData from './components/UploadVerificationData';
import ROUTES_ICBCVERIFICATION from '../app/routes/ICBCVerification';
import CustomPropTypes from '../app/utilities/props';
import upload from '../app/utilities/upload';

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
    upload(ROUTES_ICBCVERIFICATION.UPLOAD, files, { submissionCurrentDate: dateCurrentTo })
      .then(() => {
        setAlertMessage('upload successful');
        toastr.success('upload successful!', '', { positionClass: 'toast-bottom-right' });
        setFiles([]);
      })
      .catch((error) => {
        const { response } = error;
        if (response.status === 400) {
          setAlertMessage(error.response.data);
        } else {
          setAlertMessage('An error has occurred while uploading. Please try again later.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshList(true);
  }, []);
  if (loading) {
    return <Loading />;
  }

  return (
    <UploadVerificationData
      dateCurrentTo={dateCurrentTo}
      alertMessage={alertMessage}
      files={files}
      previousDateCurrentTo={previousDateCurrentTo}
      setDateCurrentTo={setDateCurrentTo}
      setUploadFiles={setFiles}
      title="Upload ICBC Registration Data"
      upload={doUpload}
      user={user}
    />
  );
};

UploadICBCVerificationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default UploadICBCVerificationContainer;
