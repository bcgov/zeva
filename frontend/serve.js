const express = require('express')
const fallback = require('express-history-api-fallback')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))

const root = `${__dirname}/public/build`
app.use(express.static(root))
app.use(fallback('index.html', { root }))
app.listen(3000)
