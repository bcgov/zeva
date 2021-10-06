import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../../app/components/Loading';

const ActiveUsersListPage = (props) => {
  const {
    activeIdirUsers, activeBceidUsers, loading,
  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="organization-list" className="page">
      <div className="col-md-8">
        <h2>Active Users</h2>
      </div>
      <div className="mt-3 pt-3">
        <h4>BCEID Users</h4>
        <textarea
          rows="11"
          className="form-control d-inline-block align-top mt-2 col-sm-9"
          value={activeBceidUsers}
          readOnly
        />
      </div>
      <div className="mt-3 pt-4">
        <h4>IDIR Users</h4>
        <textarea
          rows="11"
          className="form-control d-inline-block align-top mt-2 col-sm-9"
          value={activeIdirUsers}
          readOnly
        />
      </div>
    </div>
  );
};

ActiveUsersListPage.propTypes = {
  activeIdirUsers: PropTypes.string.isRequired,
  activeBceidUsers: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ActiveUsersListPage;
