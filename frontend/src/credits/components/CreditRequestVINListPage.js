import axios from 'axios';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '../../app/components/Button';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';
import CustomPropTypes from '../../app/utilities/props';
import VINListTable from './VINListTable';

const CreditRequestVINListPage = (props) => {
  const {
    content,
    handleCheckboxClick,
    handleChangeReason,
    handleSubmit,
    modified,
    query,
    reasons,
    setContent,
    submission,
    user,
    invalidatedList
  } = props;

  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState(-1);
  const [reactTable, setReactTable] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [cancelToken, setCancelToken] = useState(null);

  const filterWarnings = (event) => {
    const { value } = event.target;

    const index = filtered.findIndex((item) => item.id === 'warning');
    const filter = {
      id: 'warning',
      value
    };

    if (index >= 0) {
      filtered[index] = filter;
    } else {
      filtered.push(filter);
    }

    setSelectedOption(value);
    setFiltered([...filtered, { id: 'warning', value }]);
    reactTable.filterColumn(reactTable.state.columns[3].columns[0], value);
  };

  const refreshContent = async (state, filters = []) => {
    if (cancelToken) {
      cancelToken.cancel('Cancelling previous requests');
    }

    const sorted = [];

    state.sorted.forEach((each) => {
      let value = each.id;

      if (each.desc) {
        value = `-${value}`;
      }

      sorted.push(value);
    });

    setLoading(true);

    const newCancelToken = axios.CancelToken.source();

    setCancelToken(newCancelToken);

    await axios
      .get(ROUTES_CREDIT_REQUESTS.CONTENT.replace(':id', submission.id), {
        params: {
          filters,
          page: state.page + 1, // page from front-end is zero index, but in the back-end we need the actual page number
          page_size: state.pageSize,
          sorted: sorted.join(',')
        },
        cancelToken: newCancelToken.token
      })
      .then((response) => {
        const { content: refreshedContent, pages: numPages } = response.data;

        setContent(refreshedContent);
        setLoading(false);
        setPages(numPages);
      });
  };

  const clearFilters = () => {
    setSelectedOption('');
    setFiltered([]);

    const state = reactTable.getResolvedState();

    refreshContent(state);
  };

  const actionBar = (
    <div className="action-bar">
      <span className="left-content">
        <Button buttonType="back" />
      </span>
      <span className="right-content">
        <Button
          buttonType="save"
          action={() => {
            handleSubmit();
          }}
          optionalClassname="button primary"
        />
      </span>
    </div>
  );

  return (
    <div id="sales-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>
            {submission.organization && `${submission.organization.name} `}
          </h1>
          <h2 className="my-0 py-0">
            ZEV Sales Submission {submission.submissionDate}
          </h2>
        </div>
      </div>

      <div className="row mb-2">
        <div className="col-sm-12 text-right">
          <span className="d-inline-block mr-3 align-middle">
            <select
              className="form-control h-auto py-2"
              onChange={filterWarnings}
              value={selectedOption}
            >
              <option value="">Filter by Error Type</option>
              <option value="1">1 - Show all warnings</option>
              <option value="11">11 - VIN not registered in B.C.</option>
              <option value="21">21 - VIN already issued credits</option>
              <option value="31">31 - Duplicate VIN</option>
              <option value="41">
                41 - Model year and/or make does not match
              </option>
              <option value="51">51 - Sale prior to Jan 2018</option>
              <option value="61">61 - Invalid date format</option>
            </select>
          </span>

          <button
            className="button d-inline-block align-middle"
            disabled={filtered.length === 0}
            onClick={() => {
              clearFilters();
            }}
            type="button"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <VINListTable
            filtered={filtered}
            handleCheckboxClick={handleCheckboxClick}
            handleChangeReason={handleChangeReason}
            invalidatedList={invalidatedList}
            items={content}
            loading={loading}
            modified={modified}
            pages={pages}
            query={query}
            reasons={reasons}
            refreshContent={refreshContent}
            setContent={setContent}
            setFiltered={setFiltered}
            setLoading={setLoading}
            setPages={setPages}
            setReactTable={setReactTable}
            submission={submission}
            user={user}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">{actionBar}</div>
      </div>
    </div>
  );
};

CreditRequestVINListPage.defaultProps = {
  query: null
};

CreditRequestVINListPage.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  handleChangeReason: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  invalidatedList: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  modified: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  query: PropTypes.shape(),
  reasons: PropTypes.arrayOf(PropTypes.string).isRequired,
  setContent: PropTypes.func.isRequired,
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
};

export default CreditRequestVINListPage;
