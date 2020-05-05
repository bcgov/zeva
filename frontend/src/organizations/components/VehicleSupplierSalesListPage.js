import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import History from '../../app/History';
import Loading from '../../app/components/Loading';
import SalesSubmissionListTable from './SalesSubmissionListTable';

const VehicleSupplierSalesListPage = (props) => {
  const { loading, sales } = props;
  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="row mt-5">
        <div className="col-sm-12">
          <h2>Credit Transactions</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12 pt-1">
          <SalesSubmissionListTable
            items={sales}
          />

          <div className="action-bar">
            <span className="left-content">
              <button
                className="button"
                onClick={() => {
                  History.goBack();
                }}
                type="button"
              >
                <FontAwesomeIcon icon="arrow-left" /> <span>Back</span>
              </button>
            </span>

            <span className="right-content" />
          </div>
        </div>
      </div>
    </div>
  );
};

VehicleSupplierSalesListPage.defaultProps = {
  sales: [],
};

VehicleSupplierSalesListPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  sales: PropTypes.arrayOf(PropTypes.shape({})),
};

export default VehicleSupplierSalesListPage;
