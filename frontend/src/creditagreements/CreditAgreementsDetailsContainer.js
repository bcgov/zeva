import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CreditAgreementsDetailsPage from './components/CreditAgreementsDetailsPage';
import Loading from '../app/components/Loading';
import ROUTES_CREDIT_AGREEMENTS from '../app/routes/CreditAgreements';
import CustomPropTypes from '../app/utilities/props';
import history from '../app/History';

const CreditAgreementsDetailsContainer = (props) => {
  const { keycloak, user } = props;
  const [idirComment, setIdirComment] = useState([]);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const analystAction = user.isGovernment && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT');

  const items = [
    { numberOfCredits: '50', modelYear: '2021', creditClass: 'A' },
    { numberOfCredits: '100', modelYear: '2021', creditClass: 'B' },
  ];

  const handleCommentChangeIdir = (text) => {
    setIdirComment(text);
  };
  const handleAddIdirComment = () => {
    const comment = { comment: idirComment, director: true };
    axios.post(ROUTES_CREDIT_AGREEMENTS.COMMENT_SAVE.replace(':id', id), comment)
      .then(() => {
        history.push(ROUTES_CREDIT_AGREEMENTS.LIST);
        history.replace(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(':id', id));
      });
  };
  const handleDelete = () => {
    console.log('delete')
    axios.patch(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(':id', id),
      { validationStatus: 'DELETED' })
      .then(() => {
        history.push(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(':id', id));
      });
  };
  const refreshDetails = () => {
    if (id > 0) {
      axios.get(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(':id', id)).then((response) => {
        const {
          comments,
          effectiveDate,
          optionalAgreementId,
          organization,
          transactionType,
          status,
          updateTimestamp,
          attachments,
          creditAgreementContent,
        } = response.data;
        let filteredIdirComments;
        let filteredBceidComments;
        if (comments && comments.length > 0) {
          filteredIdirComments = comments.filter(
            (data) => data.toDirector === true,
          );
          filteredBceidComments = comments.filter(
            (data) => data.toDirector === false,
          );
        }

        setDetails({
          filteredIdirComments,
          filteredBceidComments,
          effectiveDate,
          optionalAgreementId,
          organization,
          transactionType,
          status,
          updateTimestamp,
          attachments,
          creditAgreementContent,
        });
        setLoading(false);
      });
    } else {
      // This logic is just to avoid errors when looking at bceid display page as there is no list of agreement transactions/ids.
      // Remove this logic once we have list of transactions(including agreement id) for bceid user so that the details are coming from database
      // instead of static values. This work will be part of ZEVA-639.
      setDetails({
        filteredIdirComments: [],
        filteredBceidComments: [],
        effectiveDate: '2021-07-18',
        optionalAgreementId: '65652',
        organization: { name: 'TESLA' },
        transactionType: 'Initiative Agreement',
        status: 'ISSUED',
        updateTimestamp: '2021-07-18 16:30:34',
        attachment: null,
        creditAgreementContent: items,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);
  if (loading) {
    return <Loading />;
  }

  return [
    <CreditAgreementsDetailsPage
      id={id}
      user={user}
      items={items}
      analystAction={analystAction}
      handleAddIdirComment={handleAddIdirComment}
      handleCommentChangeIdir={handleCommentChangeIdir}
      details={details}
      handleDelete={handleDelete}
    />,
  ];
};

CreditAgreementsDetailsContainer.prototype = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditAgreementsDetailsContainer;
