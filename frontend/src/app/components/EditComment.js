import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';

const EditComment = ({ commentId, comment, handleSave, handleCancel }) => {
  const [value, setValue] = useState();

  useEffect(() => {
    setValue(comment);
  }, [comment]);

  const handleChange = (editedComment) => {
    if (editedComment) {
      setValue(editedComment);
    }
  };

  return (
    <>
      <ReactQuill
        theme="snow"
        modules={{
          toolbar: [
            ['bold', 'italic'],
            [{ list: 'bullet' }, { list: 'ordered' }]
          ],
          keyboard: {
            bindings: { tab: false }
          }
        }}
        formats={['bold', 'italic', 'list', 'bullet']}
        value={value}
        onChange={handleChange}
      />
      <button
        onClick={() => {
          handleSave(commentId, value);
        }}
      >
        Save
      </button>
      <button
        onClick={() => {
          handleCancel(commentId);
        }}
      >
        Cancel
      </button>
    </>
  );
};

export default EditComment;
