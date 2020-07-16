import React from 'react';
import { render } from '@testing-library/react';
import SalesListTable from '../SalesListTable';
import '@testing-library/jest-dom/extend-expect';
import jest from 'jest-mock';

it('renders without crashing', () => {
  const baseProps = {
    handleCheckboxClick: jest.fn(),
    items:
    [
      {
        credits: 0.55,
        icbcVerification: null,
        id: 6,
        referenceNumber: null,
        saleDate: '2020-06-20',
        validationStatus: 'VALIDATED',
        vehicle:
        {
          id: 151,
          make: 'Toyota',
          modelName: 'PRIUS PRIME',
          modelYear: '2019',
          range: 40,
          vehicleClassCode: 'M',
          vehicleZevType: 'PHEV',
          weightKg: '0',
        },
        vin: '123456815.0',
        vinValidationStatus: 'UNCHECKED',
      }],
    submission:
    {
      records:
      [
        {
          credits: 0.55,
          icbcVerification: null,
          id: 6,
          referenceNumber: null,
          saleDate: '2020-06-20',
          validationStatus: 'VALIDATED',
          vehicle:
          {
            id: 151,
            make: 'Toyota',
            modelName: 'PRIUS PRIME',
            modelYear: '2019',
            range: 40,
            vehicleClassCode: 'M',
            vehicleZevType: 'PHEV',
            weightKg: '0',
          },
        },
      ],
      submissionDate: '2020-06-25',
    },
    user: {
      displayName: 'Gavin McPerson',
    },
    validatedList: [0, 1, 2],
  };
  render(<SalesListTable baseProps />);
});
