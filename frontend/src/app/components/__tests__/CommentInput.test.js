import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import CommentInput from '../CommentInput'

jest.mock('react-quill', () => {
  return jest.fn(props => {
    return (
      <textarea
        data-testid={props['data-testid']}
        readOnly={props.readOnly}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
      />
    )
  })
})

describe('CommentInput component', () => {
  it('renders correctly', () => {
    const title = 'Comment Title'
    const buttonText = 'Add Comment'
    const handleCommentChange = jest.fn()
    const handleAddComment = jest.fn()
    const { getByTestId, getByText } = render(
      <CommentInput
        title={title}
        handleCommentChange={handleCommentChange}
        handleAddComment={handleAddComment}
        buttonText={buttonText}
        testid="comment-input"
        buttontestid="add-comment-button"
      />
    )

    expect(getByTestId('comment-input')).toBeTruthy()
    expect(getByText(buttonText)).toBeTruthy()
  })

  it('calls handleCommentChange when the textarea changes', () => {
    const title = 'Comment Title'
    const buttonText = 'Add Comment'
    const handleCommentChange = jest.fn()
    const handleAddComment = jest.fn()
    const { getByTestId } = render(
      <CommentInput
        title={title}
        handleCommentChange={handleCommentChange}
        handleAddComment={handleAddComment}
        buttonText={buttonText}
        testid="comment-input"
        buttontestid="add-comment-button"
      />
    )

    const commentInput = getByTestId('comment-input')
    fireEvent.change(commentInput, { target: { value: 'Hello World' } })
    expect(handleCommentChange).toHaveBeenCalled()
  })

  it('calls handleAddComment when the button is clicked', () => {
    const title = 'Comment Title'
    const buttonText = 'Add Comment'
    const handleCommentChange = jest.fn()
    const handleAddComment = jest.fn()
    const { getByText } = render(
      <CommentInput
        title={title}
        handleCommentChange={handleCommentChange}
        handleAddComment={handleAddComment}
        buttonText={buttonText}
        data-testid="comment-input"
        buttontestid="add-comment-button"
      />
    )

    const addCommentButton = getByText(buttonText)
    fireEvent.click(addCommentButton)
    expect(handleAddComment).toHaveBeenCalled()
  })
})
