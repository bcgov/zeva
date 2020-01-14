/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';
import ReactTable from 'react-table';

import history from '../../app/History';

const OrganizationsTable = (props) => {
  const columns = [{
    accessor: 'name',
    className: 'col-name',
    Header: 'Company Name',
  }, {
    accessor: (item) => (item.id % 2 ? 'Large' : 'Medium'),
    className: 'col-class',
    Header: 'Class',
    id: 'class',
  }, {
    className: 'col-compliance-requirement',
    Header: 'Compliance Requirement',
  }, {
    className: 'col-credit-balance',
    Header: 'Credit Balance',
  }, {
    accessor: (item) => {
      const { organizationAddress } = item;

      if (!organizationAddress) {
        return '';
      }

      const {
        addressLine1,
        addressLine2,
        addressLine3,
        city,
        country,
        postalCode,
        state,
      } = organizationAddress;

      let address = '';

      if (addressLine1) {
        address += `${addressLine1} `;
      }

      if (addressLine2) {
        address += `${addressLine2} `;
      }

      if (addressLine3) {
        address += `${addressLine3} `;
      }

      if (city) {
        address += `${city} `;
      }

      if (state) {
        address += `${state} `;
      }

      if (postalCode) {
        address += `${postalCode} `;
      }

      if (country) {
        address += `${country} `;
      }

      return address;
    },
    className: 'col-address',
    Header: 'Address',
    id: 'address',
  }];

  const filterMethod = (filter, row) => {
    const id = filter.pivotId || filter.id;
    return row[id] !== undefined ? String(row[id])
      .toLowerCase()
      .includes(filter.value.toLowerCase()) : true;
  };

  const filterable = true;

  const { items } = props;

  return (
    <ReactTable
      className="searchable"
      columns={columns}
      data={items}
      defaultFilterMethod={filterMethod}
      defaultPageSize={10}
      defaultSorted={[{
        id: 'displayName',
      }]}
      filterable={filterable}
      getTrProps={(state, row) => {
        if (row && row.original) {
          return {
            onClick: () => {
              const { id } = row.original;

              history.push(`/organizations/${id}`);
            },
            className: 'clickable',
          };
        }

        return {};
      }}
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

OrganizationsTable.defaultProps = {
};

OrganizationsTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    organizationAddress: PropTypes.shape({
      addressLine1: PropTypes.string,
      addressLine2: PropTypes.string,
      addressLine3: PropTypes.string,
      city: PropTypes.string,
      country: PropTypes.string,
      postalCode: PropTypes.string,
      state: PropTypes.string,
    }),
  })).isRequired,
};

export default OrganizationsTable;
