import React from 'react'
import Comment from '../Comment'
import renderer from 'react-test-renderer'
import { advanceTo } from 'jest-date-mock'

describe('Comment component', () => {
  beforeEach(() => {
    advanceTo(new Date(2021, 11, 31, 17, 0, 0)) // Mock the current date/time
  })

  it('renders correctly with comments', () => {
    const commentArray = [
      {
        id: 1,
        createUser: { displayName: 'John Doe' },
        createTimestamp: '2022-01-01T01:00:00.000Z',
        comment: 'A sample comment'
      },
      {
        id: 2,
        createUser: { displayName: 'Jane Doe' },
        createTimestamp: '2022-01-02T02:00:00.000Z',
        comment: 'Another sample comment'
      }
    ]
    const component = renderer.create(<Comment commentArray={commentArray} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders correctly with empty commentArray', () => {
    const component = renderer.create(<Comment />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
