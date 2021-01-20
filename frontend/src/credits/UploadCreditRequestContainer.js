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
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidenceErrorMessage, setEvidenceErrorMessage] = useState(null);
  const [icbcDate, setIcbcDate] = useState('- no icbc data yet -');
  const [loading, setLoading] = useState(true);
  const [evidenceCheckbox, setEvidenceCheckbox] = useState(false);
  const [showProgressBars, setShowProgressBars] = useState(false);
  const [progressBars, setProgressBars] = useState({});

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

  const updateProgressBars = (progressEvent, index) => {
    const percentage = Math.round((100 * progressEvent.loaded) / progressEvent.total);
    setProgressBars({
      ...progressBars,
      [index]: percentage,
    });

    progressBars[index] = percentage;
  };

  const handleEvidenceUpload = (paramId) => {
    const promises = [];
    setShowProgressBars(true);

    evidenceFiles.forEach((file, index) => {
      promises.push(new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const blob = reader.result;

          axios.get(ROUTES_CREDIT_REQUESTS.MINIO_URL.replace(/:id/gi, paramId)).then((response) => {
            const { url: uploadUrl, minioObjectName } = response.data;

            axios.put(uploadUrl, blob, {
              headers: {
                Authorization: null,
              },
              onUploadProgress: (progressEvent) => {
                updateProgressBars(progressEvent, index);

                if (progressEvent.loaded >= progressEvent.total) {
                  resolve({
                    filename: file.name,
                    mimeType: file.type,
                    minioObjectName,
                    size: file.size,
                  });
                }
              },
            }).catch(() => {
              reject();
            });
          });
        };

        reader.readAsArrayBuffer(file);
      }));
    });

    return promises;
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
      if (evidenceCheckbox === true) {
        const uploadPromises = handleEvidenceUpload(creditRequestId);
        Promise.all(uploadPromises).then((attachments) => {
          const patchData = {};

          if (attachments.length > 0) {
            patchData.salesEvidences = attachments;
          }

          axios.patch(ROUTES_CREDIT_REQUESTS.DETAILS.replace(/:id/gi, creditRequestId), {
            ...patchData,
          }).then(() => {
            history.push(ROUTES_CREDIT_REQUESTS.DETAILS.replace(/:id/gi, creditRequestId));
          });
        });
      }
      history.push(ROUTES_CREDIT_REQUESTS.DETAILS.replace(/:id/gi, creditRequestId));
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
      evidenceErrorMessage={evidenceErrorMessage}
      files={files}
      key="page"
      setErrorMessage={setErrorMessage}
      setEvidenceErrorMessage={setEvidenceErrorMessage}
      setUploadFiles={setFiles}
      upload={doUpload}
      user={user}
      uploadEvidenceFiles={evidenceFiles}
      setEvidenceUploadFiles={setEvidenceFiles}
      evidenceCheckbox={evidenceCheckbox}
      setEvidenceCheckbox={setEvidenceCheckbox}
      showProgressBars={showProgressBars}
    />,
  ]);
};

UploadCreditRequestsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(UploadCreditRequestsContainer);
