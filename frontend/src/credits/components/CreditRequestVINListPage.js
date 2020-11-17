import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '../../app/components/Button';
import CustomPropTypes from '../../app/utilities/props';
import VINListTable from './VINListTable';

const CreditRequestVINListPage = (props) => {
  const {
    handleCheckboxClick,
    handleSubmit,
    submission,
    user,
    validatedList,
  } = props;

  const [filtered, setFiltered] = useState([]);
  const filterWarnings = () => {
    setFiltered([...filtered, { id: 'warning', value: '1' }]);
  };

  const clearFilters = () => {
    setFiltered([]);
  };

  const showWarnings = submission.content.some((row) => (row.warnings.length > 0));

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
          <h1>{submission.organization && `${submission.organization.name} `}</h1>
          <h2 className="my-0 py-0">ZEV Sales Submission {submission.submissionDate}</h2>
        </div>
      </div>

      {showWarnings && (
      <div className="row">
        <div className="col-sm-12 mt-3">
          <strong>warnings found </strong>
          &mdash; warning codes:{' '}
          11 = VIN not registered in BC;{' '}
          21 = VIN already issued credit;{' '}
          31 = Duplicate VIN;{' '}
          41 = Model year and/or Make does not match BC registration data;{' '}
          51 = Sale prior to 2 Jan 2018;{' '}
          61 = Invalid Date Format
        </div>
      </div>
      )}

      <div className="row mb-2">
        <div className="col-sm-12 text-right">
          <button
            className="button btn btn-outline-danger d-inline-block align-middle mr-3"
            onClick={() => { filterWarnings(); }}
            type="button"
          >
            View Warnings Only
          </button>

          <button
            className="button d-inline-block align-middle"
            disabled={filtered.length === 0}
            onClick={() => { clearFilters(); }}
            type="button"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <VINListTable
            handleCheckboxClick={handleCheckboxClick}
            items={submission.content}
            submission={submission}
            user={user}
            validatedList={validatedList}
            filtered={filtered}
            setFiltered={setFiltered}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          {actionBar}
        </div>
      </div>
    </div>
  );
};

CreditRequestVINListPage.defaultProps = {};

CreditRequestVINListPage.propTypes = {
  handleCheckboxClick: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submission: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
  validatedList: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ])).isRequired,
};

export default CreditRequestVINListPage;
