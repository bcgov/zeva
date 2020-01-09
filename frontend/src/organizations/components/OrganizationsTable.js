/*
 * Presentational component
 */
import React from 'react';
import PropTypes from 'prop-types';

import ReactTable from 'react-table';

const OrganizationsTable = (props) => {
  const columns = [{
    accessor: 'name',
    className: 'col-name',
    Header: 'Company Name',
  }, {
    accessor: (item) => (item % 2 ? 'A' : 'B'),
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
      pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
    />
  );
};

OrganizationsTable.defaultProps = {
};

OrganizationsTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default OrganizationsTable;
