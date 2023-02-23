import React from 'react'
import { render } from '@testing-library/react'
import ActionBarGov from '../ActionBarGov'

const vehicles = []
const handle = (msg) => {
  console.log(msg)
}

it('renders without crashing', () => {
  render(
    <ActionBarGov
      handleClear={() => {
        handle('clear')
      }}
      handleSubmit={() => {
        handle('submit')
      }}
      setFiltered={() => {
        handle('setFiltered')
      }}
      filtered={[{ 1: 'test' }]}
      vehicles={vehicles}
    />
  )
})
