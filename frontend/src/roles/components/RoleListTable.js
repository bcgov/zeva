/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

const RoleListTable = (props) => {
  const { roles } = props;

  return (
    <ul>
      {roles.map((r) => (
        <li key={r.name}>
          {r.name}
          <table>
            <tbody>
            {r.roles.map(role => (<tr key={role.id}>
              <td>{role.name}</td>
              <td>{role.description}</td>
            </tr>))}
            </tbody>
          </table>
          {(r.subGroups.length > 0) && (
            <ul>
              {r.subGroups.map((sg) => (
                <li key={sg.name}>
                  {sg.name}
                  <table>
                    <tbody>
                    {sg.roles.map(role => (<tr key={role.id}>
                      <td>{role.name}</td>
                      <td>{role.description}</td>
                    </tr>))}
                    </tbody>
                  </table>
                </li>
              ))}
            </ul>
          )}

        </li>
      ))}
    </ul>
  );
};

RoleListTable.defaultProps = {};

RoleListTable.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  })).isRequired,
};

export default RoleListTable;
