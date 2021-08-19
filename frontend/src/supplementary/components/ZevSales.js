import React from 'react';
import ReactTable from '../../app/components/ReactTable';

const ZevSales = (props) => {
  const { details, handleInputChange } = props;
  const { zevSales } = details;

  const columns = [{
    accessor: (item) => (
      <>
        <span className="mr-2">{item.sales}</span>
        <input
          id={`sales-${item.id}`}
          size="5"
          name="zevSales"
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
    accessor: (item) => (
      <>
        <span className="mr-2">{item.modelYear}</span>
        <input
          name="zevSales"
          id={`modelYear-${item.id}`}
          onChange={handleInputChange}
          size="4"
          maxLength="4"
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
    accessor: (item) => (
      <>
        <span className="mr-2">{item.make}</span><input
          size="10"
          name="zevSales"
          id={`make-${item.id}`}
          onChange={handleInputChange}
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
    accessor: (item) => (
      <>
        <span className="mr-2">{item.model}</span><input
          size="11"
          name="zevSales"
          id={`modelName-${item.id}`}
          onChange={handleInputChange}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Model',
    headerClassName: 'font-weight-bold',
    id: 'model',
    sortable: false,
    maxWidth: 300,
  }, {
    accessor: (item) => (
      <>
        <span className="mr-2">{item.type}</span><input
          size="5"
          name="zevSales"
          id={`vehicleZevType-${item.id}`}
          onChange={handleInputChange}
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
    accessor: (item) => (
      <>
        <span className="mr-2">{item.range}</span><input
          size="4"
          name="zevSales"
          id={`range-${item.id}`}
          onChange={handleInputChange}
        />
      </>
    ),
    className: 'text-right',
    Header: 'Range',
    headerClassName: 'font-weight-bold',
    id: 'range',
    sortable: false,
    maxWidth: 150,
  }, {
    accessor: (item) => (
      <>
        <span className="mr-2">{item.zevClass}</span><input
          maxLength="3"
          size="3"
          name="zevSales"
          id={`zevClass-${item.id}`}
          onChange={handleInputChange}
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
  // Sales Model Year Make  Model Type Range ZEV Class
  return (
    <>
      <h3>{details.assessmentData && details.assessmentData.modelYear} Model Year Zero-Emission Vehicles Sales</h3>
      <div className="text-blue my-3">
        Provide additional details in the comment box at the bottom of this form if there are changes to the consumer ZEV sales details.
      </div>
      <div className="my-4">
        {zevSales
        && (
        <ReactTable
          className="supplementary-sales-table"
          columns={columns}
          data={zevSales}
          filterable={false}
        />
        )}
      </div>
    </>
  );
};

export default ZevSales;
