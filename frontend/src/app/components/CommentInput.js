import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import ReactQuill from 'react-quill';

const CommentInput = (props) => {
  const {
    handleAddComment, handleCommentChange, title, buttonText, defaultComment
  } = props;
  return (

    <div className="text-editor">
      <label htmlFor="comment">
        <b>{title}</b>
      </label>
      <ReactQuill
        defaultValue={defaultComment ? defaultComment.comment : ''}
        theme="snow"
        modules={{
          toolbar: [
            ['bold', 'italic'],
            [{ list: 'bullet' }, { list: 'ordered' }],
          ],
        }}
        formats={['bold', 'italic', 'list', 'bullet']}
        onChange={handleCommentChange}
      />
      <button
        className="button mt-2"
        onClick={() => { handleAddComment(); }}
        type="button"
      >{buttonText}
      </button>
    </div>
  );
};

CommentInput.defaultProps = {
};
CommentInput.propTypes = {
};
export default CommentInput;
