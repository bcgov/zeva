/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import CustomPropTypes from '../../app/utilities/props';

const RoleSelector = (props) => {
  const { roles, selectionChangeHandler, selected } = props;

  return (
    <div className="panel">
      <h2>Roles</h2>
      {roles.map((r) => (
        <li key={r.name}>
          <button
            className={`listSelection ${selected === r ? 'active' : ''}`}
            type="button"
            onClick={() => selectionChangeHandler(r)}
          >{r.name}
          </button>
        </li>
      ))}
    </div>
  );
};

RoleSelector.propTypes = {
  roles: CustomPropTypes.roles.isRequired,
  selectionChangeHandler: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types,react/require-default-props
  selected: PropTypes.object,
};

export default RoleSelector;
