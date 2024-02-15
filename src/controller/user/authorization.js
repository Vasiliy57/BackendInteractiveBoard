const uniqid = require('uniqid')
const db = require('../../../db')

class UserAuthorizationController {
  async registration(req, res) {
    console.log(req.body)
    try {
      const { email, login, password } = req.body

      const { rows: existingEmail } = await db.query(
        'SELECT email FROM people WHERE email = $1',
        [email]
      )

      if (existingEmail[0]) {
        res
          .status(500)
          .json({ message: 'Such an email address already exists !!!' })
      } else {
        const { rows: user } = await db.query(
          'INSERT INTO people (login, email, password) VALUES($1,$2,$3) RETURNING *',
          [login, email, password]
        )

        const accessToken = uniqid()
        const refreshToken = uniqid()
        const currentDate = Math.floor(new Date().getTime() / 1000)
        const refreshExpire = currentDate + 2592000 // 1 месяц
        const accessExpire = currentDate + 172800 // 2 дня
        const userId = user[0].id

        const { rows: session } = await db.query(
          'INSERT INTO session (access_token, access_expire, refresh_token, refresh_expire, user_id) VALUES($1,$2,$3,$4,$5) RETURNING *',
          [accessToken, accessExpire, refreshToken, refreshExpire, userId]
        )
        console.log(user[0])
        res.status(200).json({
          user: {
            id: user[0].id,
            email: user[0].email,
            login: user[0].login,
          },
          session: {
            refreshToken: session[0].refresh_token,
            accessToken: session[0].access_token,
          },
        })
      }
    } catch (error) {
      console.log(error.message)
      res.status(500).json()
    }
  }

  async authorization(req, res) {
    console.log(req.body)
    try {
      const { email, password } = req.body

      const { rows: user } = await db.query(
        'SELECT id,login,email FROM people WHERE email = $1 AND password = $2',
        [email, password]
      )

      if (user[0]) {
        const accessToken = uniqid()
        const refreshToken = uniqid()
        const currentDate = Math.floor(new Date().getTime() / 1000)
        const refreshExpire = currentDate + 2592000 // 1 месяц
        // const refreshExpire = currentDate + 1 // 1 месяц
        const accessExpire = currentDate + 172800 // 2 дня
        const userId = user[0].id

        await db.query('DELETE FROM session WHERE user_id = $1', [userId])

        const { rows: session } = await db.query(
          'INSERT INTO session (access_token, access_expire, refresh_token, refresh_expire, user_id) VALUES($1,$2,$3,$4,$5) RETURNING *',
          [accessToken, accessExpire, refreshToken, refreshExpire, userId]
        )

        res.status(200).json({
          user: user[0],
          session: {
            refreshToken: session[0].refresh_token,
            accessToken: session[0].access_token,
          },
        })
      } else {
        const message = {
          message:
            'Such a user has not been found, check the email and password !!!',
        }
        res.status(500).json(message)
      }
    } catch (error) {
      console.log(error.message)
      res.status(500).json(error)
    }
  }
  async updateTokens(req, res) {
    try {
      const { id, accessToken, refreshToken } = req.body

      const {
        rows: [session],
      } = await db.query('SELECT * FROM session WHERE user_id = $1', [id])
      const currentDate = Math.floor(new Date().getTime() / 1000)

      const validSession =
        session?.refresh_token === refreshToken &&
        session?.access_token === accessToken &&
        session?.refresh_expire > currentDate

      if (validSession) {
        const accessToken = uniqid()
        const refreshToken = uniqid()
        const refreshExpire = currentDate + 2592000 // 1 месяц
        const accessExpire = currentDate + 172800 // 2 дня
        const userId = id

        await db.query('DELETE FROM session WHERE user_id = $1', [userId])

        const {
          rows: [newSession],
        } = await db.query(
          'INSERT INTO session (access_token, access_expire, refresh_token, refresh_expire, user_id) VALUES($1,$2,$3,$4,$5) RETURNING *',
          [accessToken, accessExpire, refreshToken, refreshExpire, userId]
        )

        res.status(200).json(newSession)
      } else {
        res.status(403).json({ message: 'Access is denied !!!' })
      }
    } catch (error) {
      console.log(error.message)
      res.status(500).json()
    }
  }
}

module.exports = new UserAuthorizationController()
