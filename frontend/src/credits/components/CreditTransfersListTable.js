/*
 * Presentational component
 */
import PropTypes from 'prop-types';
import React from 'react';

import ReactTable from '../../app/components/ReactTable';

const CreditTransfersListTable = (props) => {
  const columns = [{
    accessor: 'id',
    className: 'text-right',
    Header: 'ID',
    id: 'id',
  }, {
    accessor: 'createTimestamp',
    className: 'text-center',
    Header: 'Date',
    id: 'date',
  }, {
    accessor: 'updateUser',
    className: 'text-center',
    Header: 'Last User',
    id: 'updateUser',
  }, {
    accessor: 'creditTo',
    className: 'text-left',
    Header: 'Transfer Partner',
    id: 'partner',
  }, {
    accessor: 'creditValue',
    className: 'text-right',
    Header: 'A-Credits',
    id: 'credits-a',
  }, {
    accessor: 'creditValue',
    className: 'text-right',
    Header: 'B-Credits',
    id: 'credits-b',
  }, {
    accessor: 'creditValue',
    className: 'text-right',
    Header: 'Transfer Value',
    id: 'transfer-value',
  }, {
    accessor: 'status',
    className: 'text-left',
    Header: 'Status',
    id: 'status',
  }];

  const { items } = props;

  return (
    <ReactTable
      columns={columns}
      data={items}
      defaultSorted={[{
        id: 'id',
        desc: true,
      }]}
    />
  );
};

CreditTransfersListTable.defaultProps = {};

CreditTransfersListTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CreditTransfersListTable;
