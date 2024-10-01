import axios from 'axios'

const download = (url, params, filenameOverride) =>
  axios
    .get(url, {
      responseType: 'blob',
      ...params
    })
    .then((response) => {
      let filename = ''
      const contentDisposition = response.headers['content-disposition']
      if (filenameOverride) {
        filename = filenameOverride
      } else if (contentDisposition) {
        filename = response.headers['content-disposition'].replace(
          'attachment; filename=',
          ''
        )
        filename = filename.replace(/"/g, '')
      }

      const objectURL = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = objectURL
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
    })

export default download
