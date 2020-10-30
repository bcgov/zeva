import axios from 'axios';
import moment from 'moment-timezone';

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

const chunkUpload = (url, files) => {
  const file = files[0];
  let chunkSize = 1000000;
  const totalNumberOfChunks = Math.ceil(file.size / chunkSize, chunkSize);

  if (file.size < chunkSize) {
    chunkSize = file.size;
  }

  const filename = moment().format('YYYY-MM-DD-hh-mm-ss');
  const promises = [];

  for (let chunk = 0; chunk < totalNumberOfChunks; chunk++) {
    const data = new FormData();
    const offset = chunk * chunkSize;
    const chunkData = file.slice(offset, offset + chunkSize);
    data.set('files', chunkData, `${filename}.part.${chunk}`);

    promises.push(axios.post(url, data, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    }));
  }

  return {
    promises,
    filename,
    chunks: totalNumberOfChunks,
  };
};

export { upload, chunkUpload };
