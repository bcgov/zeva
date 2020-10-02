import axios from 'axios';

const upload = (url, files, additionalData = {}) => {
  const data = new FormData();

  for (let i = 0; i < files.length; i++) {
    data.append('files', files[i]);
  }

  if (Object.keys(additionalData).length > 0) {
    Object.entries(additionalData).forEach(([key, value]) => {
      data.append(key, value);
    });
  }

  return axios.post(url, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default upload;
