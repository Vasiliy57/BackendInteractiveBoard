const express = require('express')
const authRoute = require('./src/routes/auth')
const cors = require('cors')

const PORT = 3001
const app = express()

app.use(cors({ origin: true }))

app.use(express.json())
app.use('/auth', authRoute)

// app.use('/auth', test)

app.listen(PORT, () => {
  console.log('Has been started', PORT)
})
