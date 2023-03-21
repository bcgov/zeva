import React from 'react'
import { render } from '@testing-library/react'
import DisplayComment from '../DisplayComment'

describe('DisplayComment component', () => {
  it('should render comments properly', () => {
    const commentArray = [
      {
        id: 1,
        createUser: {
          displayName: 'John'
        },
        createTimestamp: '2022-02-21T10:00',
        comment: '<p>Hello world!</p>'
      },
      {
        id: 2,
        createUser: {
          displayName: 'Mary'
        },
        createTimestamp: '2022-02-22T11:00',
        comment: '<p>Hi there!</p>'
      }
    ]
    const { getAllByText } = render(<DisplayComment commentArray={commentArray} />)
    expect(getAllByText(/Comments/)).toBeTruthy()
    expect(getAllByText(/John/)).toBeTruthy()
    expect(getAllByText(/Mary/)).toBeTruthy()
    expect(getAllByText(/2022-02-21 10:00 am/)).toBeTruthy()
    expect(getAllByText(/2022-02-22 11:00 am/)).toBeTruthy()
    expect(getAllByText(/Hello world!/)).toBeTruthy()
    expect(getAllByText(/Hi there!/)).toBeTruthy()
  })

  it('should render nothing when commentArray is empty', () => {
    const { container } = render(<DisplayComment />)
    expect(container.querySelector('span').firstChild).toBeNull()
  })
})
