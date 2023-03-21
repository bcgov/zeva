import React from 'react'
import { render, cleanup } from '@testing-library/react'
import AutocompleteInput from '../AutocompleteInput'

require('@babel/core')
require('@babel/polyfill')

afterEach(cleanup)

describe('autocomplete input', () => {
  const handleInputChange = (event) => {
    const { value } = event.target
    const input = value.trim()
    return { name: input }
  }

  it('renders without crashing', () => {
    render(
      <AutocompleteInput
        label="Model"
        id="modelName"
        name="modelName"
        defaultValue="test"
        mandatory
        possibleChoicesList={['one', 'two', 'three']}
        handleInputChange={handleInputChange}
      />
    )
  })
})
