/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React from 'react';
import SalesDetailsPage from './components/SalesDetailsPage';

import CustomPropTypes from '../app/utilities/props';

const SalesDetailsContainer = (props) => {
  const { user } = props;

  return (
    <SalesDetailsPage
      details={[{
        class: 'A',
        credits: 1.74,
        zevType: 'B',
        make: 'Hyundai',
        modelName: 'IONIQ ELECTRIC',
        modelYear: 2020,
        range: 200,
        sales: 53,
        submissionDate: '2020-01-15',
        total: 92.22,
        zevType: 'BEV',
      }, {
        class: 'A',
        credits: 3.08,
        zevType: 'B',
        make: 'Hyundai',
        modelName: 'KONA ELECTRIC',
        modelYear: 2020,
        range: 415,
        sales: 64,
        submissionDate: '2019-10-21',
        total: 197.12,
        zevType: 'BEV',
      }, {
        class: 'B',
        credits: 0.59,
        zevType: 'B/X',
        make: 'Hyundai',
        modelName: 'IONIQ ELECTRIC PLUS',
        modelYear: 2020,
        range: 47,
        sales: 32,
        submissionDate: '2019-10-21',
        total: 18.88,
        zevType: 'PHEV',
      }, {
        class: 'B',
        credits: 0.58,
        zevType: 'B/X',
        make: 'Hyundai',
        modelName: 'SONATA PLUG-IN',
        modelYear: 2019,
        range: 45,
        sales: 29,
        submissionDate: '2019-10-21',
        total: 16.82,
        zevType: 'PHEV',
      }, {
        class: 'A',
        credits: 2.89,
        zevType: 'B',
        make: 'Kia',
        modelName: 'NIRO EV',
        modelYear: 2019,
        range: 385,
        sales: 47,
        submissionDate: '2019-10-21',
        total: 135.83,
        zevType: 'BEV',
      }, {
        class: 'A',
        credits: 1.61,
        zevType: 'B',
        make: 'Kia',
        modelName: 'SOUL EV',
        modelYear: 2019,
        range: 179,
        sales: 39,
        submissionDate: '2019-10-21',
        total: 62.79,
        zevType: 'BEV',
      }, {
        class: 'B',
        credits: 0.56,
        zevType: 'B/X',
        make: 'Kia',
        modelName: 'NIRO PLUG-IN',
        modelYear: 2019,
        range: 42,
        sales: 41,
        submissionDate: '2019-10-21',
        total: 22.96,
        zevType: 'PHEV',
      }, {
        class: 'B',
        credits: 0.59,
        zevType: 'B/X',
        make: 'Kia',
        modelName: 'OPTIMA PLUG-IN',
        modelYear: 2019,
        range: 47,
        sales: 40,
        submissionDate: '2019-10-21',
        total: 23.60,
        zevType: 'PHEV',
      }]}
      user={user}
    />
  );
};

SalesDetailsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default SalesDetailsContainer;
