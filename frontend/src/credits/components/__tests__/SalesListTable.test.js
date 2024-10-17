import React from 'react'
import { render } from '@testing-library/react'
import jest from 'jest-mock'
import VINListTable from '../VINListTable'
import '@testing-library/jest-dom/extend-expect'

const baseProps = {
  handleCheckboxClick: jest.fn(),
  items: [
    {
      icbcVerification: null,
      id: 6,
      recordOfSale: null,
      salesDate: '2020-06-20T00:00:00',
      vehicle: {
        creditClass: 'A',
        creditValue: 1.44,
        id: 151,
        make: 'TOYOTA',
        modelName: 'PRIUS PRIME',
        modelYear: '2019',
        range: 40,
        vehicleClassCode: 'M',
        vehicleZevType: 'PHEV',
        weightKg: '0'
      },
      warnings: ['VIN_ALREADY_AWARDED'],
      xlsMake: 'TOYOTA',
      xlsModel: 'PRIUS PRIME',
      xlsModelYear: '2019.0',
      xlsVin: '123456810'
    }
  ],
  user: {
    displayName: 'Gavin McPerson',
    isGovernment: true
  },
  validatedList: [0, 1, 2],
  submission: {
    submissionDate: '2020-01-01'
  }
}
const basePropsNoError = {
  items: [
    {
      icbcVerification: null,
      id: 6,
      recordOfSale: null,
      salesDate: '2020-06-20T00:00:00',
      vehicle: {
        creditClass: 'A',
        creditValue: 1.44,
        id: 151,
        make: 'TOYOTA',
        modelName: 'PRIUS PRIME',
        modelYear: '2019',
        range: 40,
        vehicleClassCode: 'M',
        vehicleZevType: 'PHEV',
        weightKg: '0'
      },
      warnings: [],
      xlsMake: 'TOYOTA',
      xlsModel: 'PRIUS PRIME',
      xlsModelYear: '2019.0',
      xlsVin: '123456810'
    }
  ]
}
const basePropsNoMatch = {
  items: [
    {
      icbcVerification: null,
      id: 6,
      recordOfSale: null,
      salesDate: '2020-06-20T00:00:00',
      vehicle: {
        creditClass: 'A',
        creditValue: 1.44,
        id: 151,
        make: 'TOYOTA',
        modelName: 'PRIUS PRIME',
        modelYear: '2019',
        range: 40,
        vehicleClassCode: 'M',
        vehicleZevType: 'PHEV',
        weightKg: '0'
      },
      warnings: ['NO_ICBC_MATCH'],
      xlsMake: 'TOYOTA',
      xlsModel: 'PRIUS PRIME',
      xlsModelYear: '2019.0',
      xlsVin: '123456810'
    }
  ],
  validatedList: []
}

it('renders without crashing', () => {
  render(
    <VINListTable
      handleCheckboxClick={baseProps.handleCheckboxClick}
      items={baseProps.items}
      refreshContent={() => {}}
      setLoading={() => {}}
      loading={false}
      setReactTable={() => {}}
      user={baseProps.user}
      validatedList={baseProps.validatedList}
      invalidatedList={[]}
      pages={1}
      submission={baseProps.submission}
    />
  )
})

it('gives an error code of 21 if vin has already been validated', () => {
  const { getByText } = render(
    <VINListTable
      handleCheckboxClick={baseProps.handleCheckboxClick}
      items={baseProps.items}
      loading={false}
      refreshContent={() => {}}
      setLoading={() => {}}
      setReactTable={() => {}}
      user={baseProps.user}
      validatedList={baseProps.validatedList}
      invalidatedList={[]}
      pages={1}
      submission={baseProps.submission}
    />
  )
  expect(getByText('21')).toBeInTheDocument()
})

it('gives an error code of 11 if there is no matching icbc vin', () => {
  const { getByText } = render(
    <VINListTable
      handleCheckboxClick={baseProps.handleCheckboxClick}
      items={basePropsNoMatch.items}
      invalidatedList={[]}
      loading={false}
      refreshContent={() => {}}
      setLoading={() => {}}
      setReactTable={() => {}}
      user={baseProps.user}
      validatedList={basePropsNoMatch.validatedList}
      pages={1}
      submission={baseProps.submission}
    />
  )
  expect(getByText('11')).toBeInTheDocument()
})

it('gives no error code if everything matches with icbcdata', () => {
  const { queryByText } = render(
    <VINListTable
      handleCheckboxClick={baseProps.handleCheckboxClick}
      invalidatedList={[]}
      items={basePropsNoError.items}
      loading={false}
      refreshContent={() => {}}
      setLoading={() => {}}
      setReactTable={() => {}}
      user={baseProps.user}
      validatedList={baseProps.validatedList}
      pages={1}
      submission={baseProps.submission}
    />
  )
  expect(queryByText('21')).not.toBeInTheDocument()
  expect(queryByText('11')).not.toBeInTheDocument()
})
