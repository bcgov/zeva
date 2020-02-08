import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';

import CustomPropTypes from '../../app/utilities/props';
import history from '../../app/History';
import SalesDetailsTable from './SalesDetailsTable';

const SalesDetailsPage = (props) => {
  const {
    details,
    user,
  } = props;

  return (
    <div id="sales-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>{user.organization.name}</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  history.goBack();
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> Back
              </button>
            </span>
            <span className="right-content">
              <button
                className="button"
                type="button"
              >
                <FontAwesomeIcon icon="download" /> Download as Excel
              </button>
            </span>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <SalesDetailsTable
            items={details}
            user={user}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-8" />
        <div className="col-sm-4">
          <table className="table table-bordered table-striped">
            <tbody>
              <tr>
                <td className="text-center">Total A</td>
                <td className="text-right">487.96</td>
              </tr>
              <tr>
                <td className="text-center">Total B</td>
                <td className="text-right">82.26</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  history.goBack();
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> Back
              </button>
            </span>
            <span className="right-content">
              <button
                className="button"
                type="button"
              >
                <FontAwesomeIcon icon="download" /> Download as Excel
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

SalesDetailsPage.defaultProps = {};

SalesDetailsPage.propTypes = {
  details: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default SalesDetailsPage;
