import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Loading from '../../app/components/Loading';
import RoleListTable from './RoleListTable';
import RoleSelector from './RoleSelector';

const RoleList = (props) => {
  const {
    loading,
    roles,
  } = props;

  const [selection, setSelection] = useState(null);
  const [flatGroups, setFlatGroups] = useState([]);

  useEffect(() => {
    const flatten = (input, prefix = null, parentRoles = []) => input.reduce((acc, r) => {
      let result;

      if (r.subGroups) {
        result = flatten(r.subGroups, r.name, r.roles);
      } else {
        const transformed = r;
        transformed.name = `${prefix} -- ${r.name}`;
        transformed.roles = transformed.roles.concat(parentRoles);
        result = [transformed];
      }

      return acc.concat(result);
    }, []);
    setFlatGroups(flatten(roles));
    setSelection(null);
  }, [roles]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="role-list" className="page">
      <div className="row">
        <div className="col-sm-3">
          <RoleSelector
            roles={flatGroups}
            selected={selection}
            selectionChangeHandler={setSelection}
          />
        </div>
        <div className="col-sm-9">
          {(selection != null) && <RoleListTable roles={selection.roles} title={selection.name} />}
          {(selection == null) && <span>Select a role to see permissions</span>}
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
