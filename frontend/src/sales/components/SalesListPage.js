import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import history from '../../app/History';

import CustomPropTypes from '../../app/utilities/props';
import SalesSubmissionsListTable from './SalesSubmissionsListTable';

const SalesListPage = (props) => {
  const {
    submissions,
    user,
  } = props;

  return (
    <div id="sales-list" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>{user.organization.name}</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <span className="left-content" />
            <span className="right-content">
              <button
                className="button"
                type="button"
              >
                <FontAwesomeIcon icon="download" /> Download as Excel
              </button>

              <button
                className="button primary"
                onClick={() => {
                  history.push('/sales/add');
                }}
                type="button"
              >
                <FontAwesomeIcon icon="dollar-sign" /> Enter ZEV Sales
              </button>
            </span>
          </div>

          <SalesSubmissionsListTable
            items={submissions}
            user={user}
          />

          <div className="action-bar">
            <span className="left-content" />
            <span className="right-content">
              <button
                className="button"
                type="button"
              >
                <FontAwesomeIcon icon="download" /> Download as Excel
              </button>

              <button
                className="button primary"
                onClick={() => {
                  history.push('/sales/add');
                }}
                type="button"
              >
                <FontAwesomeIcon icon="dollar-sign" /> Enter ZEV Sales
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

SalesListPage.defaultProps = {};

SalesListPage.propTypes = {
  submissions: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesListPage;
