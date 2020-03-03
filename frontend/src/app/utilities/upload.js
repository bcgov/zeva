import axios from 'axios';

const upload = (url, files) => {
  const data = new FormData();

  // @todo seriously, eslint. no plusplus? you and I are going to have a talk when I figure out exactly what to suppress
  for (let i = 0; i < files.length; i += 1) {
    data.append('files', files[i]);
  }

  return axios.post(url, data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
};

export default upload;
