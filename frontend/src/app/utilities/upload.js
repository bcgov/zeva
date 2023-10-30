import axios from 'axios'
import moment from 'moment-timezone'

const upload = (url, files, additionalData = {}) => {
  const data = new FormData()

  for (let i = 0; i < files.length; i++) {
    data.append('files', files[i])
  }

  if (Object.keys(additionalData).length > 0) {
    Object.entries(additionalData).forEach(([key, value]) => {
      data.append(key, value)
    })
  }

  return axios.post(url, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

const uploadPartialData = (
  url,
  filename,
  fileData,
  chunk,
  chunkSize,
  totalNumberOfChunks,
  resolve,
  reject
) => {
  if (chunk < totalNumberOfChunks) {
    const data = new FormData()
    const offset = chunk * chunkSize
    const chunkData = fileData.slice(offset, offset + chunkSize)
    data.set('files', chunkData, `${filename}.part.${chunk}`)

    axios
      .post(url, data, {
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      })
      .then(() => {
        uploadPartialData(
          url,
          filename,
          fileData,
          chunk + 1,
          chunkSize,
          totalNumberOfChunks,
          resolve,
          reject
        )
      })
      .catch((error) => {
        reject(error)
      })
  } else {
    resolve({
      filename,
      chunks: totalNumberOfChunks
    })
  }
}

const chunkUpload = (url, files) => {
  const file = files[0]
  let chunkSize = 10000000
  const totalNumberOfChunks = Math.ceil(file.size / chunkSize, chunkSize)

  if (file.size < chunkSize) {
    chunkSize = file.size
  }

  const chunk = 0

  const filename = moment().format('YYYY-MM-DD-hh-mm-ss')

  return new Promise((resolve, reject) => {
    uploadPartialData(
      url,
      filename,
      file,
      chunk,
      chunkSize,
      totalNumberOfChunks,
      resolve,
      reject
    )
  })
}

const getFileUploadPromises = (urlToGetPresignedUrl, files, updateProgressBars) => {
  const result = []
  files.forEach((file, index) => {
    const uploadPromise = new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const blob = reader.result
        axios.get(urlToGetPresignedUrl).then((response) => {
          const { url: uploadUrl, minioObjectName } = response.data
          axios.put(uploadUrl, blob, {
            headers: {
              Authorization: null
            },
            onUploadProgress: (progressEvent) => {
              if (updateProgressBars) {
                updateProgressBars(progressEvent, index)
              }
              resolve({
                filename: file.name,
                mimeType: file.type,
                minioObjectName,
                size: file.size
              })
            }
          })
            .catch((error) => {
              reject(error)
            })
        })
      }
      reader.readAsArrayBuffer(file)
    })
    result.push(uploadPromise)
  })
  return result
}

export { upload, chunkUpload, getFileUploadPromises }
