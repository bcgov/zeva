import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import ReactTable from 'react-table';

const ZevSales = (props) => {
  const {
    addSalesRow,
    details,
    handleInputChange,
    salesRows,
  } = props;
  const columns = [{
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.sales}</span>
        <input
          id={`sales-${item.index}`}
          size="5"
          name="zevSales"
          defaultValue={item.original.newData ? item.original.newData.sales : ''}
          onChange={handleInputChange}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Sales',
    headerClassName: 'font-weight-bold ',
    id: 'zevSales',
    sortable: false,
    maxWidth: 150,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.modelYear}</span>
        <input
          name="zevSales"
          id={`modelYear-${item.index}`}
          onChange={handleInputChange}
          size="4"
          maxLength="4"
          defaultValue={item.original.newData.modelYear}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Model Year',
    headerClassName: 'font-weight-bold ',
    id: 'model-year',
    sortable: false,
    maxWidth: 120,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.make}</span>
        <input
          size="10"
          name="zevSales"
          id={`make-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.make}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Make',
    headerClassName: 'font-weight-bold',
    id: 'make',
    sortable: false,
    maxWidth: 200,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.model}</span>
        <input
          size="11"
          name="zevSales"
          id={`modelName-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.modelName}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Model',
    headerClassName: 'font-weight-bold',
    id: 'modelName',
    sortable: false,
    maxWidth: 300,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.zevType}</span>
        <input
          size="5"
          name="zevSales"
          id={`vehicleZevType-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.vehicleZevType}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Type',
    headerClassName: 'font-weight-bold',
    id: 'type',
    sortable: false,
    maxWidth: 200,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.range}</span>
        <input
          size="4"
          name="zevSales"
          id={`range-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.range}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Range (km)',
    headerClassName: 'font-weight-bold',
    id: 'range',
    sortable: false,
    maxWidth: 150,
  }, {
    Cell: (item) => (
      <>
        <span className="mr-2">{item.original.oldData.zevClass}</span>
        <input
          maxLength="3"
          size="3"
          name="zevSales"
          id={`zevClass-${item.index}`}
          onChange={handleInputChange}
          defaultValue={item.original.newData.zevClass}
        />
      </>
    ),
    className: 'text-right',
    Header: 'ZEV Class',
    headerClassName: 'font-weight-bold',
    id: 'zev-class',
    sortable: false,
    maxWidth: 75,
  }];
  return (
    <>
      <h3>
        {details.assessmentData && details.assessmentData.modelYear}
        Model Year Zero-Emission Vehicles Sales
      </h3>
      <div className="text-blue my-3">
        Provide additional details in the comment box at the bottom of this form if there are
        changes to the consumer ZEV sales details.
      </div>
      <div className="my-4 sales-table-container">
        {salesRows
        && (
        <ReactTable
          className="sales-table"
          columns={columns}
          data={salesRows}
          filterable={false}
          minRows={1}
          showPagination={false}
        />
        )}
        <button
          className="transfer-add-line m-2"
          onClick={() => {
            addSalesRow();
          }}
          type="button"
        >
          <FontAwesomeIcon icon="plus" /> Add another line for a new ZEV model
        </button>
      </div>
    </>
  );
};

export default ZevSales;
