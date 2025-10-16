import { Router } from 'express';
import { body, param } from 'express-validator';
import saleController from '../controllers/sale-controller';

const router = Router();

const validateCreateSale = [
  body('code')
    .notEmpty()
    .withMessage('Código da venda é obrigatório')
    .isLength({ min: 1, max: 50 })
    .withMessage('Código deve ter entre 1 e 50 caracteres'),
  body('customer')
    .notEmpty()
    .withMessage('Cliente é obrigatório')
    .isLength({ min: 1, max: 200 })
    .withMessage('Nome do cliente deve ter entre 1 e 200 caracteres'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Deve conter pelo menos um item'),
  body('items.*.productId')
    .isUUID()
    .withMessage('ID do produto deve ser um UUID válido'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número inteiro maior que 0'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Desconto deve ser um número maior ou igual a 0')
];

const validateSaleStatus = [
  param('id').isUUID().withMessage('ID deve ser um UUID válido'),
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'DELIVERED'])
    .withMessage('Status deve ser PENDING, CONFIRMED, CANCELLED ou DELIVERED')
];

router.post('/', validateCreateSale, saleController.createSale);
router.get('/', saleController.listSales);
router.get('/report', saleController.salesReport);
router.get('/:id', param('id').isUUID(), saleController.getSaleById);
router.get('/code/:code', saleController.getSaleByCode);
router.patch('/:id/status', validateSaleStatus, saleController.updateSaleStatus);
router.patch('/:id/cancel', param('id').isUUID(), saleController.cancelSale);
router.put('/sales/:id/cancel', saleController.cancelSale);


export default router;