import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import history from '../app/History';
import CreditAgreementsForm from './components/CreditAgreementsForm';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import Loading from '../app/components/Loading';
import { upload } from '../app/utilities/upload';

const CreditAgreementsEditContainer = (props) => {
  const { keycloak, user } = props;
  const { id } = useParams();
  const [bceidComment, setBceidComment] = useState('');
  const [idirComment, setIdirComment] = useState([]);
  const [creditLines, setCreditLines] = useState([]);
  //   const [files, setFiles] = useState([]);
  //   const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [agreementDetails, setAgreementDetails] = useState({
    idirComment: [{
      id: 1,
      createUser: { displayName: 'emily' },
      comment: 'test',
      createTimestamp: '01-01-2021',
    }],
    bceidComment: [],
  });
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const analystAction = user.isGovernment
  && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT');
  const handleCommentChangeIdir = (text) => {
    setIdirComment(text);
  };
  const handleCommentChangeBceid = (text) => {
    setBceidComment(text);
  };
  const handleAddIdirComment = () => {
    const comment = { comment: idirComment, director: true };
    console.log('comment added!: ', idirComment);
    // axios.post(ROUTES_COMPLIANCE.ASSESSMENT_COMMENT_SAVE.replace(':id', id), comment).then(() => {
    //   history.push(ROUTES_COMPLIANCE.REPORT_ASSESSMENT.replace(':id', id));
    // });
  };
  const addLine = () => {
    creditLines.push({
      creditClass: 'A',
      modelYear: '2020',
      quantity: 0,
    });

    setCreditLines([...creditLines]);
  };
  const handleSubmit = () => {
    console.log('submit!');
  };
  const refreshDetails = () => {
    setLoading(false);
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
      idirComment={idirComment}
      setIdirComment={setIdirComment}
      analystAction={analystAction}
      handleCommentChangeIdir={handleCommentChangeIdir}
      handleAddIdirComment={handleAddIdirComment}
      setUploadFiles={setFiles}
      setErrorMessage={setErrorMessage}
      errorMessage={errorMessage}
      files={files}
      upload={upload}
      handleCommentChangeBceid={handleCommentChangeBceid}
      handleSubmit={handleSubmit}
      addLine={addLine}
      creditLines={creditLines}
    />,
  ]);
};

export default CreditAgreementsEditContainer;
