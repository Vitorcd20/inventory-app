import { DashboardController } from '../controllers/dashboard-controller'
import { Router } from 'express'

const router = Router()
const dashboardController = new DashboardController()

router.get('/', (req, res) => dashboardController.getDashboard(req, res))
router.get('/kpis', (req, res) => dashboardController.getKPIsEndpoint(req, res))
router.post('/refresh', (req, res) => dashboardController.refreshDashboard(req, res))

export default router