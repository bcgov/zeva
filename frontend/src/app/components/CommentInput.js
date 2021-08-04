import React from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';

const CommentInput = (props) => {
  const {
    handleAddComment,
    handleCommentChange,
    title,
    buttonText,
    defaultComment,
    disable,
  } = props;
  return (
    <div className="text-editor">
      <label htmlFor="comment">
        <b>{title}</b>
      </label>
      <ReactQuill
        readOnly={disable}
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
      {!disable && buttonText
      && (
      <button
        className="button mt-2"
        onClick={() => { handleAddComment(); }}
        type="button"
      >{buttonText}
      </button>
      )}
    </div>
  );
};

CommentInput.defaultProps = {
  buttonText: null,
  defaultComment: null,
  disable: false,
};
CommentInput.propTypes = {
  handleAddComment: PropTypes.func.isRequired,
  handleCommentChange: PropTypes.func.isRequired,
  defaultComment: PropTypes.shape(),
  buttonText: PropTypes.string,
  title: PropTypes.string.isRequired,
  disable: PropTypes.bool,
};
export default CommentInput;
