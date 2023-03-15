import React, { useState } from 'react'
import EditComment from './EditComment'
import moment from 'moment-timezone'
import parse from 'html-react-parser'
import PropTypes from 'prop-types'

const EditableCommentList = ({
  comments,
  user,
  handleCommentEdit,
  handleCommentDelete,
  enableEditing
}) => {
  const [commentIdsBeingEdited, setCommentIdsBeingEdited] = useState([])
  const handleEditClick = (commentId) => {
    setCommentIdsBeingEdited((prev) => {
      return [...prev, commentId]
    })
  }

  const handleSave = (commentId, commentText) => {
    handleCommentEdit(commentId, commentText)
    handleCancel(commentId)
  }

  const handleCancel = (commentId) => {
    setCommentIdsBeingEdited((prev) => {
      return prev.filter((id) => {
        return id !== commentId
      })
    })
  }

  const handleDelete = (commentId) => {
    handleCommentDelete(commentId)
    handleCancel(commentId)
  }

  const commentElements = []
  for (const comment of comments) {
    const commentId = comment.id
    const beingEdited = commentIdsBeingEdited.includes(commentId)
    const userEditable = comment.createUser.id === user.id
    if (beingEdited) {
      commentElements.push(
        <div key={commentId}>
          <EditComment
            commentId={commentId}
            comment={comment.comment}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleDelete={handleDelete}
          />
        </div>
      )
    } else {
      commentElements.push(
        <div key={commentId}>
          <b>{'Comments - '}</b>
          {userEditable && enableEditing && (
            <button
              className="inline-edit"
              onClick={() => {
                handleEditClick(commentId)
              }}
            >
              [edit]
            </button>
          )}
          {comment.createUser.displayName},{' '}
          {moment(comment.updateTimestamp).format('YYYY-MM-DD h[:]mm a')} :{' '}
          {parse(comment.comment)}
          <br />
        </div>
      )
    }
  }
  return (
    <div className="bcgov-callout" role="alert">
      <span>{commentElements}</span>
    </div>
  )
}
EditableCommentList.defaultProps = {
  enableEditing: true

}

EditableCommentList.propTypes = {
  enableEditing: PropTypes.bool
}
export default EditableCommentList
