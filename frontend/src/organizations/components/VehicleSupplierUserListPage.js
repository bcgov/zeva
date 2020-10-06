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
  const {
    loading, members, filtered, setFiltered,
  } = props;
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="page">
      <div className="row mt-3 mb-2">
        <div className="col-md-8 d-flex align-items-end">
          <h2>Users</h2>
        </div>
        <div className="col-md-4 text-right">
          <button
            className="button primary"
            onClick={() => {
              History.push(ROUTES_ORGANIZATIONS.ADD_USER.replace(/:id/gi, id));
            }}
            type="button"
          >
            <FontAwesomeIcon icon="user-plus" /> <span>New User</span>
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <UsersTable
            filtered={filtered}
            items={members}
            setFiltered={setFiltered}
          />
        </div>
      </div>
    </div>
  );
};

VehicleSupplierUserListPage.defaultProps = {
  members: [],
};

VehicleSupplierUserListPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape({})),
  setFiltered: PropTypes.func.isRequired,
};

export default VehicleSupplierUserListPage;
