import React from 'react'
import { render } from '@testing-library/react'
import Disclaimer from '../Disclaimer'

describe('Disclaimer component', () => {
  it('should render without crashing', () => {
    render(<Disclaimer />)
  })

  it('should render the disclaimer text', () => {
    render(<Disclaimer />)
    const contentElement = document.getElementById('content')
    expect(contentElement.textContent).toEqual(
      'This information does not replace or constitute legal advice. Users are responsible for ensuring compliance with the Zero-Emissions Vehicles Act and Regulations.'
    )
  })
})
