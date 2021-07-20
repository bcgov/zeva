import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import history from '../app/History';
import CreditAgreementsForm from './components/CreditAgreementsForm';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import { upload } from '../app/utilities/upload';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_CREDIT_AGREEMENTS from '../app/routes/CreditAgreements';

const CreditAgreementsEditContainer = (props) => {
  const { keycloak, user } = props;
  const { id } = useParams();
  const [bceidComment, setBceidComment] = useState('');
  const [creditRows, setCreditRows] = useState([{
    creditClass: 'A',
    modelYear: '-',
    quantity: 0,
  }]);
  const [years, setYears] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agreementDetails, setAgreementDetails] = useState({});
  const [files, setFiles] = useState([]);

  const [errorMessage, setErrorMessage] = useState(null);
  const analystAction = user.isGovernment
  && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT');
  const handleCommentChangeBceid = (text) => {
    setBceidComment(text);
  };

  const handleUpload = (paramId) => {
    const promises = [];
    // setShowProgressBars(true);
    files.forEach((file, index) => {
      promises.push(new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const blob = reader.result;

          axios.get(ROUTES_CREDIT_AGREEMENTS.MINIO_URL.replace(/:id/gi, paramId)).then((response) => {
            const { url: uploadUrl, minioObjectName } = response.data;
            axios.put(uploadUrl, blob, {
              headers: {
                Authorization: null,
              },
              onUploadProgress: (progressEvent) => {
                // updateProgressBars(progressEvent, index);

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
  const addRow = () => {
    creditRows.push({
      creditClass: 'A',
      modelYear: '-',
      quantity: 0,
    });

    setCreditRows([...creditRows]);
  };
  const handleDeleteRow = (index) => {
    creditRows.splice(index, 1);
    setCreditRows([...creditRows]);
  };
  const handleChangeRow = (value, property, index) => {
    creditRows[index][property] = value;
    setCreditRows([...creditRows]);
  };

  const handleChangeDetails = (value, property) => {
    setAgreementDetails({ ...agreementDetails, [property]: value });
  };
  const handleSubmit = () => {
    const data = {
      organization: agreementDetails.vehicleSupplier,
      agreementDetails,
      bceidComment,
      content: creditRows,
    };
    axios.post(ROUTES_CREDIT_AGREEMENTS.LIST, data).then((response) => {
      // after agreement is created, then post the content using the id from the response
      const { id: agreementId } = response.data;
      const uploadPromises = handleUpload(agreementId);
      Promise.all(uploadPromises).then((attachments) => {
        const patchData = {};
        if (attachments.length > 0) {
          patchData.agreementAttachments = attachments;
        }
        axios.patch(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(/:id/gi, agreementId), {
          ...patchData,
        }).then(() => {
          history.push(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(/:id/gi, agreementId));
        });
      });
    });
  };
  const refreshDetails = () => {
    const yearsPromise = axios.get(ROUTES_VEHICLES.YEARS);
    const supplierPromise = axios.get(ROUTES_ORGANIZATIONS.LIST);
    const typesPromise = axios.get(ROUTES_CREDIT_AGREEMENTS.TRANSACTION_TYPES);
    Promise.all([yearsPromise, supplierPromise, typesPromise]).then(
      ([yearsResponse, supplierResponse, typesResponse]) => {
        setYears(yearsResponse.data);
        setSuppliers(supplierResponse.data);
        // this needs to be retrieved from backend!!
        setTransactionTypes(typesResponse.data.map((each) => ({ name: each })));

        setLoading(false);
      },
    );
  };
  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);
  if (loading) {
    return <Loading />;
  }
  return ([
    <CreditTransactionTabs active="credit-transfers" key="tabs" user={user} />,
    <CreditAgreementsForm
      id={id}
      user={user}
      key="form"
      agreementDetails={agreementDetails}
      bceidComment={bceidComment}
      setBciedComment={setBceidComment}
      analystAction={analystAction}
      setUploadFiles={setFiles}
      setErrorMessage={setErrorMessage}
      errorMessage={errorMessage}
      files={files}
      upload={handleUpload}
      handleCommentChangeBceid={handleCommentChangeBceid}
      handleSubmit={handleSubmit}
      addRow={addRow}
      creditRows={creditRows}
      years={years}
      handleChangeRow={handleChangeRow}
      handleChangeDetails={handleChangeDetails}
      suppliers={suppliers}
      transactionTypes={transactionTypes}
      handleDeleteRow={handleDeleteRow}
    />,
  ]);
};

export default CreditAgreementsEditContainer;
