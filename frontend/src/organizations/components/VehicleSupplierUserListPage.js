import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams } from 'react-router-dom';

import History from '../../app/History';
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations';
import Loading from '../../app/components/Loading';
import UsersTable from './UsersTable';

const VehicleSupplierUserListPage = (props) => {
  const { id } = useParams();
  const { loading, members } = props;
  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="row mt-5">
        <div className="col-sm-12">
          <h2>Users</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <div className="text-right">
            <button
              className="button primary mb-3"
              onClick={() => {
                History.push(ROUTES_ORGANIZATIONS.ADD_USER.replace(/:id/gi, id));
              }}
              type="button"
            >
              <FontAwesomeIcon icon="user-plus" /> <span>New User</span>
            </button>
          </div>

          <UsersTable
            items={members}
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

VehicleSupplierUserListPage.defaultProps = {
  members: [],
};

VehicleSupplierUserListPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape({})),
};

export default VehicleSupplierUserListPage;
