import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toastr from 'toastr';

import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import ROUTES_ICBCVERIFICATION from '../app/routes/ICBCVerification';
import ROUTES_UPLOADS from '../app/routes/Uploads';
import CustomPropTypes from '../app/utilities/props';
import UploadVerificationData from './components/UploadVerificationData';

const UploadICBCVerificationContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const { user } = props;
  const [dateCurrentTo, setDateCurrentTo] = useState('');
  const [previousDateCurrentTo, setPreviousDateCurrentTo] = useState(
    'No ICBC data uploaded yet'
  );
  const [files, setFiles] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const today = new Date();
  const date = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

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

  const updateProgressBar = (progressEvent) => {
    const percentage = Math.round(
      (100 * progressEvent.loaded) / progressEvent.total
    );
    setUploadProgress(percentage);
  };

  const doUpload = () => {
    setShowProgressBar(true);

    files.forEach((file) => {
      axios.get(ROUTES_UPLOADS.MINIO_URL).then((response) => {
        const { url: uploadUrl, minioObjectName: filename } = response.data;

        axios
          .put(uploadUrl, file, {
            headers: {
              Authorization: null
            },
            onUploadProgress: (progressEvent) => {
              updateProgressBar(progressEvent);
            }
          })
          .then(() => {
            setShowProcessing(true);

            axios
              .post(ROUTES_ICBCVERIFICATION.UPLOAD, {
                filename,
                submissionCurrentDate: dateCurrentTo
              })
              .then((postResponse) => {
                const { dateCurrentTo: updatedDateCurrentTo } =
                  postResponse.data;
                setPreviousDateCurrentTo(updatedDateCurrentTo);
              })
              .catch((error) => {
                console.error(error);
                const { response: errorResponse } = error;
                if (errorResponse.status === 400) {
                  setAlertMessage(errorResponse.data);
                } else {
                  setAlertMessage(
                    'An error has occurred while uploading. Please try again later.'
                  );
                }
              })
              .finally(() => {
                setAlertMessage('upload successful');
                toastr.success('upload successful!', '', {
                  positionClass: 'toast-bottom-right'
                });
                setFiles([]);
                setShowProcessing(false);
                setShowProgressBar(false);
              });
          })
          .catch((error) => {
            console.error(error);
            setAlertMessage(
              'An error has occurred while uploading. Please try again later.'
            );
          });
      });
    });
  };

  useEffect(() => {
    refreshList(true);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return [
    <CreditTransactionTabs active="icbc-update" key="tabs" user={user} />,
    <UploadVerificationData
      alertMessage={alertMessage}
      dateCurrentTo={dateCurrentTo}
      files={files}
      key="page"
      previousDateCurrentTo={previousDateCurrentTo}
      setDateCurrentTo={setDateCurrentTo}
      setUploadFiles={setFiles}
      showProcessing={showProcessing}
      showProgressBar={showProgressBar}
      title="Upload ICBC Registration Data"
      upload={doUpload}
      uploadProgress={uploadProgress}
      user={user}
    />
  ];
};

UploadICBCVerificationContainer.propTypes = {
  user: CustomPropTypes.user.isRequired
};

export default UploadICBCVerificationContainer;
