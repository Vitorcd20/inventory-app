import { Router } from 'express'
import { AuthController, authenticateToken } from '../controllers/auth-controller'

const router = Router()
const authController = new AuthController()

router.post('/register', (req, res) => authController.register(req, res))
router.post('/login', (req, res) => authController.login(req, res))

router.get('/verify', authenticateToken, (req, res) => authController.verifyToken(req, res))
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res))
router.post('/change-password', authenticateToken, (req, res) => authController.changePassword(req, res))

router.get('/users', authenticateToken, (req, res) => authController.getUsers(req, res))

export default router