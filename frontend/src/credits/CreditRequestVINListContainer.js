/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';

import history from '../app/History';
import Loading from '../app/components/Loading';
import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests';
import CustomPropTypes from '../app/utilities/props';
import CreditRequestVINListPage from './components/CreditRequestVINListPage';

const qs = require('qs');

const CreditRequestVINListContainer = (props) => {
  const { location, match, user } = props;
  const { id } = match.params;

  const [content, setContent] = useState([]);
  const [submission, setSubmission] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invalidatedList, setInvalidatedList] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [modified, setModified] = useState([]);
  const [reasonList, setReasonList] = useState([]);

  const query = qs.parse(location.search, { ignoreQueryPrefix: true });

  const refreshDetails = () => {
    axios
      .all([
        axios.get(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id)),
        axios.get(ROUTES_CREDIT_REQUESTS.CONTENT.replace(':id', id)),
        axios.get(ROUTES_CREDIT_REQUESTS.UNSELECTED.replace(':id', id), {
          params: query
        }),
        axios.get(ROUTES_CREDIT_REQUESTS.REASONS)
      ])
      .then(
        axios.spread(
          (
            submissionResponse,
            contentResponse,
            unselectedResponse,
            reasonsResponse
          ) => {
            const { data: submissionData } = submissionResponse;
            setSubmission(submissionData);

            const { data } = contentResponse;
            setContent(data.content);

            const reset = query && query.reset;

            data.content.forEach((each) => {
              const index = reasonList.findIndex(
                (item) => Number(item.id) === Number(each.id)
              );

              if (each.reason && index < 0) {
                reasonList.push({
                  id: Number(each.id),
                  reason: reset ? '' : each.reason
                });
              }
            });

            setReasonList(reasonList);

            const { data: unselected } = unselectedResponse;
            setInvalidatedList(unselected);

            const { data: reasonsData } = reasonsResponse;
            setReasons(reasonsData);

            setLoading(false);
          }
        )
      );
  };

  useEffect(() => {
    refreshDetails();
  }, [id]);

  const handleChangeReason = (submissionId, value = false) => {
    let newContent = content
    const subId = Number(submissionId);
    const reasonIdx = reasonList.findIndex(r => Number(r.id) == subId);
    const contentIdx = content.findIndex(c => Number(c.id) == subId);

    if (reasonIdx >= 0) {
      reasonList[reasonIdx].reason = value;
    } else {
      reasonList.push({
        id: Number(submissionId),
        reason: value
      });
    }
    if(contentIdx >= 0) {
      newContent[contentIdx].reason = value
    }

    setReasonList(reasonList);
    setContent(newContent);
  };

  // This could be refactored to only use the content list
  // rather than these 4 different change lists
  const handleCheckboxClick = (event) => {
    const { value: submissionId, checked } = event.target;

    const subId = Number(submissionId);
    const contentIdx = content.findIndex(c => Number(c.id) == subId);
    const noMatch = content[contentIdx].warnings?.includes("NO_ICBC_MATCH")

    updateInvalidated(checked, subId)
    updateContent(checked, noMatch, contentIdx)
    updateReasons(checked, noMatch, subId)
    updateModified(subId)
  };

  const updateInvalidated = (checked, subId) => {
    if(checked) {
      setInvalidatedList(
        invalidatedList.filter((i) => Number(i) !== subId)
      );
    } else {
      setInvalidatedList(() => [...invalidatedList, subId]);
    }
  }

  const updateContent = (checked, noMatch, idx) => {
    let newContent = content
    if(checked) {
      newContent[idx].reason = noMatch ? reasons[0] : ''
    } else {
      newContent[idx].reason = ''
    }
    setContent(newContent);
  }

  const updateReasons = (checked, noMatch, subId) => {
    const reasonIdx = reasonList.findIndex(r => Number(r.id) == subId);
    if(checked) {
      if(reasonIdx >= 0) {
        reasonList[reasonIdx].reason = noMatch ? reasons[0] : ''
      } else {
        reasonList.push({
          id: subId,
          reason: noMatch ? reasons[0] : ''
        })
      } 
    } else {
      if(reasonIdx >= 0) {
        reasonList[reasonIdx].reason = ''
      }
    }
    setReasonList(reasonList);
  }

  const updateModified = (id) => {
    const modifiedIdx = modified.findIndex(m => Number(m.id) == id);
    modifiedIdx >= 0 ? modified.splice(modifiedIdx, 1) : modified.push(id);
    setModified(modified);
  }

  const handleSubmit = () => {
    setLoading(true);

    axios
      .patch(ROUTES_CREDIT_REQUESTS.DETAILS.replace(':id', id), {
        invalidated: invalidatedList,
        validationStatus: 'CHECKED',
        reasons: reasonList,
        reset: query && query.reset
      })
      .then(() => {
        const url = ROUTES_CREDIT_REQUESTS.VALIDATED.replace(
          /:id/g,
          submission.id
        );

        history.push(url);
      });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <CreditRequestVINListPage
      content={content}
      reasonList={reasonList}
      handleCheckboxClick={handleCheckboxClick}
      handleChangeReason={handleChangeReason}
      handleSubmit={handleSubmit}
      invalidatedList={invalidatedList}
      modified={modified}
      query={query}
      reasons={reasons}
      routeParams={match.params}
      setContent={setContent}
      setReasonList={setReasonList}
      submission={submission}
      user={user}
    />
  );
};

CreditRequestVINListContainer.propTypes = {
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
  match: CustomPropTypes.routeMatch.isRequired
};

export default withRouter(CreditRequestVINListContainer);
