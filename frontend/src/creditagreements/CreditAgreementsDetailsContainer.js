import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreditAgreementsDetailsPage from './components/CreditAgreementsDetailsPage';
import Loading from '../app/components/Loading';
import ROUTES_CREDIT_AGREEMENTS from '../app/routes/CreditAgreements';
import CustomPropTypes from '../app/utilities/props';
import axios from 'axios';

const CreditAgreementsDetailsContainer = (props) => {
  const { keycloak, user } = props;
  const [idirComment, setIdirComment] = useState([]);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const analystAction =
    user.isGovernment && user.hasPermission('RECOMMEND_COMPLIANCE_REPORT');

  const items = [
    { creditValue: '50', modelYear: '2021', creditClass: 'A' },
    { creditValue: '100', modelYear: '2021', creditClass: 'B' },
  ];

 

  const handleCommentChangeIdir = (text) => {
    setIdirComment(text);
  };
  const handleAddIdirComment = () => {
    const comment = { comment: idirComment, director: true };
    console.log('comment added!: ', idirComment);
    // add route for posting idir comment!!!
    // axios
    //   .post(
    //     ROUTES_CREDIT_AGREEMENTS.ASSESSMENT_COMMENT_SAVE.replace(':id', id),
    //     comment
    //   )
    //   .then(() => {
    //     history.push(ROUTES_CREDIT_AGREEMENTS.DETAILS.replace(':id', id));
    //   });
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
          updateTimestamp
        } = response.data;

        setDetails({
          comments,
          effectiveDate,
          optionalAgreementId,
          organization,
          transactionType,
          status,
          updateTimestamp,
        });
        setLoading(false);
      }
      );
    } else {
      //This logic is just to avoid errors when looking at bceid display page as there is no list of agreement transactions/ids.
      //Remove this logic once we have list of transactions(including agreement id) for bceid user so that the details are coming from database 
      //instead of static values. This work will be part of ZEVA-639.
      setDetails({
        comments: null,
        effectiveDate: '2021-07-18',
        optionalAgreementId: '65652',
        organization: { name: 'TESLA' },
        transactionType: 'Initiative Agreement',
        status: 'ISSUED',
        updateTimestamp: '2021-07-18 16:30:34',
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
    />,
  ];
};

CreditAgreementsDetailsContainer.prototype = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditAgreementsDetailsContainer;
