import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';

const ActiveUsersListPage = (props) => {
  const {
    filtered, loading,
  } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="organization-list" className="page">
      <div className="col-md-8">
        <h2>Active Users</h2>
      </div>
      <div className="mt-3">
        <textarea
          className="form-control d-inline-block align-top mt-4 col-sm-7"
        />
      </div>
    </div>
  );
};

ActiveUsersListPage.defaultProps = {
};

ActiveUsersListPage.propTypes = {
  filtered: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ActiveUsersListPage;
