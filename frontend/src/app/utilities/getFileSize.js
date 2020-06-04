const getFileSize = (bytes) => {
  if (bytes === 0) {
    return '0 bytes';
  }

  const k = 1000;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i > 4) { // nothing bigger than a terrabyte
    i = 4;
  }

  const filesize = parseFloat((bytes / k ** i).toFixed(1));

  return `${filesize} ${sizes[i]}`;
};

export default getFileSize;
