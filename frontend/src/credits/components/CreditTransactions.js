import React from 'react';
import ReactTable from 'react-table';
const CreditTransactions = (props) => {
  const { title, items } = props;
  const columns = [{
    accessor: 'displayName',
    className: 'text-left',
    Header: 'Name',
  }, {
    accessor: (item) => (item.groups.join(', ')),
    id: 'roles',
    className: 'text-left',
    Header: 'Roles',
  }, {
    accessor: (item) => (item.isActive ? 'Active' : 'Inactive'),
    className: 'text-center',
    Header: 'Status',
    id: 'status',
  }];

  // const filterMethod = (filter, row) => {
  //   const id = filter.pivotId || filter.id;
  //   return row[id] !== undefined ? String(row[id])
  //     .toLowerCase()
  //     .includes(filter.value.toLowerCase()) : true;
  // };

  // const filterable = true;

  return (
    <div id="credit-transaction-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h2>{title}</h2>
          <p>Credit Balance: add later</p>
        </div>
      </div>
      <ReactTable
        className="searchable"
        columns={columns}
        data={items}
        // defaultFilterMethod={filterMethod}
        defaultPageSize={10}
        defaultSorted={[{
          id: 'displayName',
        }]}
        // filterable={filterable}
        getTrProps={(state, row) => {
          if (row && row.original) {
            return {
              onClick: () => {
                const { id } = row.original;
                history.push(`/users/${id}`);
              },
              className: 'clickable',
            };
          }

          return {};
        }}
        pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
      />
    </div>
  );
};
export default CreditTransactions;
