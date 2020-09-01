/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';
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
    accessor: () => '-',
    className: 'col-credit-balance',
    Header: 'A-Credits',
    id: 'a-credits',

  }, {
    accessor: () => '-',
    className: 'col-credit-balance',
    Header: 'B-Credits',
    id: 'b-credits',
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

  const { items } = props;

  return (
    <ReactTable
      columns={columns}
      data={items}
      defaultSorted={[{
        id: 'displayName',
      }]}
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
    />
  );
};

OrganizationsTable.defaultProps = {
};

OrganizationsTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    organizationAddress: PropTypes.arrayOf(PropTypes.shape({
      addressLine1: PropTypes.string,
      addressLine2: PropTypes.string,
      addressLine3: PropTypes.string,
      city: PropTypes.string,
      country: PropTypes.string,
      postalCode: PropTypes.string,
      state: PropTypes.string,
      addressType: PropTypes.shape({
        addressType: PropTypes.string,
      }),
    })),
  })).isRequired,
};

export default OrganizationsTable;
