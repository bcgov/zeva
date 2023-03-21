import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import DetailField from '../DetailField'

afterEach(cleanup)

describe('DetailField component', () => {
  it('renders label and value correctly', () => {
    const label = 'Name'
    const value = 'John Doe'
    const { getByText } = render(<DetailField label={label} value={value} />)
    const labelElement = getByText(label)
    const valueElement = getByText(value)

    expect(labelElement).toBeDefined()
    expect(valueElement).toBeDefined()
  })

  it('renders with className correctly', () => {
    const label = 'Name'
    const value = 'John Doe'
    const className = 'highlight'
    render(
      <DetailField label={label} value={value} className={className} />
    )

    expect(document.querySelector('.' + className)).toBeDefined()
  })

  it('renders with id correctly', () => {
    const label = 'Name'
    const value = 'John Doe'
    const id = 'name-field'
    render(
      <DetailField label={label} value={value} id={id} />
    )
    expect(document.querySelector('#' + id)).toBeDefined()
  })
})
