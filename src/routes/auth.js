const Router = require('express')
const UserAuthorizationController = require('../controller/user/authorization')

const router = Router()

router.post('/registration', UserAuthorizationController.registration)
router.post('/authorization', UserAuthorizationController.authorization)
router.post('/update', UserAuthorizationController.updateTokens)

module.exports = router
