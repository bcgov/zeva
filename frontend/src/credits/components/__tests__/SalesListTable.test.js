import React from 'react';
import { render } from '@testing-library/react';
import jest from 'jest-mock';
import SalesListTable from '../SalesListTable';
import '@testing-library/jest-dom/extend-expect';

const baseProps = {
  handleCheckboxClick: jest.fn(),
  items:
    [
      {
        credits: 0.55,
        icbcVerification: {
          icbcVehicle: {
            id: 797,
            make: 'KIA',
            modelName: 'OPTIMA EX PREMIUM PLUG-IN 4DR',
            modelYear: {
              effectiveDate: '2019-01-01',
              expirationDate: '2019-12-31',
              name: '2019',
            },
          },
        },
        id: 6,
        referenceNumber: null,
        saleDate: '2020-06-20',
        validationStatus: 'VALIDATED',
        vehicle:
        {
          id: 151,
          make: 'Toyota',
          modelName: 'PRIUS PRIME',
          modelYear: '2020',
          range: 40,
          vehicleClassCode: 'M',
          vehicleZevType: 'PHEV',
          weightKg: '0',
        },
        vin: 'KADSA1234568150',
        vinValidationStatus: 'UNCHECKED',
      }],
  user: {
    displayName: 'Gavin McPerson',
    isGovernment: true,
  },
  validatedList: [0, 1, 2],
};
const basePropsNoError = {
  items:
    [
      {
        credits: 0.55,
        icbcVerification: {
          icbcVehicle: {
            id: 797,
            make: 'Toyota',
            modelName: 'PRIUS PRIME',
            modelYear: {
              effectiveDate: '2019-01-01',
              expirationDate: '2019-12-31',
              name: '2020',
            },
          },
        },
        id: 6,
        referenceNumber: null,
        saleDate: '2020-06-20',
        validationStatus: 'VALIDATED',
        vehicle:
        {
          id: 151,
          make: 'Toyota',
          modelName: 'PRIUS PRIME',
          modelYear: '2020',
          range: 40,
          vehicleClassCode: 'M',
          vehicleZevType: 'PHEV',
          weightKg: '0',
        },
        vin: 'KADSA1234568150',
        vinValidationStatus: 'UNCHECKED',
      }],
};
const basePropsNoMatch = {
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
        vin: '123456810',
        vinValidationStatus: 'UNCHECKED',
      }],
  validatedList: [],
};
it('renders without crashing', () => {
  render(<SalesListTable
    handleCheckboxClick={baseProps.handleCheckboxClick}
    items={baseProps.items}
    user={baseProps.user}
    validatedList={baseProps.validatedList}
  />);
});
it('gives an error code of 21 if icbc model year doesnt match', () => {
  const { getByText } = render(<SalesListTable
    handleCheckboxClick={baseProps.handleCheckboxClick}
    items={baseProps.items}
    user={baseProps.user}
    validatedList={baseProps.validatedList}
  />);
  expect(getByText('21')).toBeInTheDocument();
});

it('gives an error code of 11 if there is no matching icbc vin', () => {
  const { getByText } = render(<SalesListTable
    handleCheckboxClick={baseProps.handleCheckboxClick}
    items={basePropsNoMatch.items}
    user={baseProps.user}
    validatedList={basePropsNoMatch.validatedList}
  />);
  expect(getByText('11')).toBeInTheDocument();
});
it('gives an error code of 0 if everything matches with icbcdata', () => {
  const { queryByText, getByText } = render(<SalesListTable
    handleCheckboxClick={baseProps.handleCheckboxClick}
    items={basePropsNoError.items}
    user={baseProps.user}
    validatedList={baseProps.validatedList}
  />);
  expect(getByText('0')).toBeInTheDocument();
  expect(queryByText('21')).not.toBeInTheDocument();
  expect(queryByText('11')).not.toBeInTheDocument();
});
