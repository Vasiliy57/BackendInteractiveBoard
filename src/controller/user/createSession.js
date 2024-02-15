const uniqid = require('uniqid')
const db = require('../../../db')

async function createSession(id) {
  const accessToken = uniqid('access-token-')
  const refreshToken = uniqid('refresh-token-')
  const refreshExpire = 0
  const accessExpire = 0
  const userId = id
  try {
    db.query(
      'INSERT INTO session (accessToken, accessExpire, refreshToken, refreshExpire, userId) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [accessToken, accessExpire, refreshToken, refreshExpire, userId]
    )
  } catch (error) {
    console.log(error.message)
  }
}
module.exports = createSession
