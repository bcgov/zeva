/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React from 'react';

import CustomPropTypes from '../app/utilities/props';
import SalesListPage from './components/SalesListPage';

const SalesListContainer = (props) => {
  const { user } = props;

  return (
    <SalesListPage
      sales={[{
        credits: {
          a: 487.96,
          b: 82.26,
        },
        id: 1,
        status: 'PENDING',
        submissionDate: '2020-01-15',
        totalSales: 345,
      }, {
        credits: {
          a: 595.84,
          b: 146.25,
        },
        id: 2,
        status: 'APPROVED',
        submissionDate: '2019-10-21',
        totalSales: 412,
      }, {
        credits: {
          a: 344.32,
          b: 92.37,
        },
        id: 3,
        status: 'APPROVED',
        submissionDate: '2019-08-24',
        totalSales: 326,
      }, {
        credits: {
          a: 288.01,
          b: 72.84,
        },
        id: 4,
        status: 'APPROVED',
        submissionDate: '2019-06-18',
        totalSales: 298,
      }]}
      user={user}
    />
  );
};

SalesListContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default SalesListContainer;
