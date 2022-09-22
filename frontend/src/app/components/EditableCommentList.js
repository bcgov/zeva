import React, { useState } from 'react';
import EditComment from './EditComment';
import moment from 'moment-timezone';
import parse from 'html-react-parser';
import axios from 'axios';
import ROUTES_CREDIT_REQUESTS from '../../app/routes/CreditRequests';

const EditableCommentList = ({ comments, user, handleCommentEdit }) => {
  const [commentIdsBeingEdited, setCommentIdsBeingEdited] = useState([]);

  const handleEditClick = (commentId) => {
    setCommentIdsBeingEdited((prev) => {
      return [...prev, commentId];
    });
  };

  const handleSave = (commentId, commentText) => {
    axios
      .patch(ROUTES_CREDIT_REQUESTS.UPDATE_COMMENT.replace(':id', commentId), {
        comment: commentText
      })
      .then((response) => {
        handleCommentEdit(response.data);
      })
      .finally(() => {
        setCommentIdsBeingEdited((prev) => {
          return prev.filter((id) => {
            return id !== commentId;
          });
        });
      });
  };

  const handleCancel = (commentId) => {
    setCommentIdsBeingEdited((prev) => {
      return prev.filter((id) => {
        return id !== commentId;
      });
    });
  };

  const commentElements = [];
  for (const comment of comments) {
    const commentId = comment.id;
    const beingEdited = commentIdsBeingEdited.includes(commentId);
    const userEditable = comment.createUser.id == user.id;
    if (beingEdited) {
      commentElements.push(
        <div key={commentId}>
          <EditComment
            commentId={commentId}
            comment={comment.comment}
            handleSave={handleSave}
            handleCancel={handleCancel}
          />
        </div>
      );
    } else {
      commentElements.push(
        <div key={commentId}>
          <b>{'Comments - '}</b>
          {userEditable && (
            <button
              className="inline-edit"
              onClick={() => {
                handleEditClick(commentId);
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
      );
    }
  }
  return (
    <div className="bcgov-callout" role="alert">
      <span>{commentElements}</span>
    </div>
  );
};

export default EditableCommentList;
