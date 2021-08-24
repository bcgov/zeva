import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ROUTES_SUPPLEMENTARY from '../app/routes/SupplementaryReport';
import SupplementaryDetailsPage from './components/SupplementaryDetailsPage';

const SupplementaryContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [newData, setNewData] = useState({});
  const { keycloak, user } = props;
  const [files, setFiles] = useState([]);
  const [deleteFiles, setDeleteFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleAddComment = (comment) => {
    setNewData({ ...newData, comment });
  };

  const handleUpload = (paramId) => {
    const promises = [];
    files.forEach((file, index) => {
      promises.push(new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const blob = reader.result;

          axios.get(ROUTES_SUPPLEMENTARY.MINIO_URL.replace(/:id/gi, paramId)).then((response) => {
            const { url: uploadUrl, minioObjectName } = response.data;
            axios.put(uploadUrl, blob, {
              headers: {
                Authorization: null,
              },
              onUploadProgress: (progressEvent) => {
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

  const handleSubmit = (status) => {
    const uploadPromises = handleUpload(id);
    Promise.all(uploadPromises).then((attachments) => {
      const evidenceAttachments = {};
      if (attachments.length > 0) {
          evidenceAttachments.attachments = attachments;
      }
    
      const data = {
      ...newData,
      status,
      creditActivity: [{
        category: 'creditBalanceStart',
        modelYearId: 2,
        creditAValue: '100',
        creditBValue: '50',
      }, {
        category: 'creditBalanceEnd',
        modelYearId: 1,
        creditAValue: '100',
        creditBValue: '50',
      }],
      zevSales: [{
        sales: 250,
        make: 'TESLA',
        model_name: 'TEST 1',
        model_year_id: 2,
        vehicle_zev_type: 2,
        range: 87,
        zev_class: 1,
      }],
      evidenceAttachments,
      deleteFiles
    };
  
    axios.patch(ROUTES_SUPPLEMENTARY.SAVE.replace(':id', id), data).then((response) => {
      console.log(response)
    })
  }).catch((e) => {
      setErrorMessage(e);
  });
  };

  const handleInputChange = (event) => {
    const { id, name, value } = event.target;
    // seperate sections into which database table they will be inserted into ie supplierInfo
    const dataToUpdate = {
      ...newData[name],
      [id]: value,
    };
    setNewData({
      ...newData,
      [name]: dataToUpdate,
    });
  };
  const refreshDetails = () => {
    setLoading(true);
    axios.get(ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id)).then((response) => {
      if (response.data) {
        setDetails(response.data);
        console.log(response.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <SupplementaryDetailsPage
      handleAddComment={handleAddComment}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      loading={loading}
      user={user}
      details={details}
      newData={newData}
      files={files}
      deleteFiles={deleteFiles}
      setDeleteFiles={setDeleteFiles}
      setUploadFiles={setFiles}
      errorMessage={errorMessage}
    />
  );
};
export default SupplementaryContainer;
