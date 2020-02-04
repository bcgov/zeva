import React from 'react';
import PropTypes from 'prop-types';
import Loading from '../../app/components/Loading';
import RoleListTable from './RoleListTable';

const RoleList = (props) => {
  const {
    loading,
    roles,
    user,
  } = props;

  if (loading) {
    return <Loading/>;
  }

  return (
    <div id="role-list" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Available Roles</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <RoleListTable roles={roles} />
        </div>
      </div>
    </div>
  );
};

RoleList.defaultProps = {};

RoleList.propTypes = {
  loading: PropTypes.bool.isRequired,
  roles: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RoleList;
