import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import CreditTransactions from './components/CreditTransactions';
import Loading from '../app/components/Loading';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import UploadVerificationData from './components/UploadVerificationData';
import ROUTES_CREDITS from '../app/routes/Credits';
import ROUTES_ICBCVERIFICATION from '../app/routes/ICBCVerification';
import CustomPropTypes from '../app/utilities/props';
import upload from '../app/utilities/upload';

const CreditsContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const { activeTab, user } = props;
  const [dateCurrentTo, setDateCurrentTo] = useState('');
  const [previousDateCurrentTo, setPreviousDateCurrentTo] = useState('');
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [details, setDetails] = useState({
    entries: [],
    validationMessages: [],
    submissionID: '',
  });


  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const refreshList = (showLoading) => {
    setLoading(showLoading);
    if (activeTab === 'transactions') {
      axios.get(ROUTES_CREDITS.LIST).then((response) => {
        setCreditTransactions(response.data);

        setLoading(false);
      });
    } else if (activeTab === 'upload-verification-data') {
      axios.get(ROUTES_ICBCVERIFICATION.DATE).then((response) => {
        setPreviousDateCurrentTo(response.data.uploadDate);
      });
      setLoading(false);
      setDateCurrentTo(date);
    }
  };

  const doUpload = () => {
    upload(ROUTES_ICBCVERIFICATION.UPLOAD, files, dateCurrentTo).then((response) => {
      setDetails(response.data);
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
    return <Loading />;
  }

  return (
    <div>
      {activeTab === 'transactions'
      && (
      <div>
        <CreditTransactionTabs active="credit-transactions" key="tabs" user={user} />
        <CreditTransactions title="Credit Transactions" items={creditTransactions} user={user} />
      </div>
      )} {activeTab === 'upload-verification-data'
      && (
      <div>
        <UploadVerificationData
          title="Upload ICBC Registration Data"
          errorMessage={errorMessage}
          files={files}
          setUploadFiles={setFiles}
          upload={doUpload}
          dateCurrentTo={dateCurrentTo}
          setDateCurrentTo={setDateCurrentTo}
          previousDateCurrentTo={previousDateCurrentTo}
        />
      </div>
      )}
    </div>
  );
};

CreditsContainer.propTypes = {
  activeTab: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditsContainer;
