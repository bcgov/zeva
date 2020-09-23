import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CustomPropTypes from '../../app/utilities/props';
import History from '../../app/History';
import Loading from '../../app/components/Loading';
import SubmissionListTable from '../../credits/components/SubmissionListTable';

const VehicleSupplierSalesListPage = (props) => {
  const { loading, sales, user } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="row mt-3">
      <div className="col-sm-12">
        <SubmissionListTable
          items={sales}
          user={user}
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
  );
};

VehicleSupplierSalesListPage.defaultProps = {
  sales: [],
};

VehicleSupplierSalesListPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  sales: PropTypes.arrayOf(PropTypes.shape({})),
  user: CustomPropTypes.user.isRequired,
};

export default VehicleSupplierSalesListPage;
