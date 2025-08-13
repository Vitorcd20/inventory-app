import { Router } from 'express';
import { body, param } from 'express-validator';
import productController from '../controllers/product-controller';

const router = Router();

const validateCreateProduct = [
  body('code')
    .notEmpty()
    .withMessage('Código é obrigatório')
    .isLength({ min: 1, max: 50 })
    .withMessage('Código deve ter entre 1 e 50 caracteres'),
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('categoryId')
    .isUUID()
    .withMessage('ID da categoria deve ser um UUID válido'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantidade deve ser um número inteiro maior ou igual a 0'),
  body('unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Preço unitário deve ser um número maior ou igual a 0'),
  body('salePrice')
    .isFloat({ min: 0 })
    .withMessage('Preço de venda deve ser um número maior ou igual a 0'),
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estoque mínimo deve ser um número inteiro maior ou igual a 0'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
];

const validateUpdateProduct = [
  param('id').isUUID().withMessage('ID deve ser um UUID válido'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('ID da categoria deve ser um UUID válido'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantidade deve ser um número inteiro maior ou igual a 0'),
  body('unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço unitário deve ser um número maior ou igual a 0'),
  body('salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço de venda deve ser um número maior ou igual a 0'),
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estoque mínimo deve ser um número inteiro maior ou igual a 0'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive deve ser um valor booleano')
];

const validateStock = [
  param('id').isUUID().withMessage('ID deve ser um UUID válido'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número inteiro maior que 0'),
  body('operation')
    .optional()
    .isIn(['ADD', 'SUBTRACT', 'SET'])
    .withMessage('Operação deve ser ADD, SUBTRACT ou SET')
];

router.post('/', validateCreateProduct, productController.createProduct);
router.get('/', productController.listProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/:id', param('id').isUUID(), productController.getProductById);
router.get('/code/:code', productController.getProductByCode);
router.put('/:id', validateUpdateProduct, productController.updateProduct);
router.delete('/:id', param('id').isUUID(), productController.deleteProduct);
router.patch('/:id/stock', validateStock, productController.updateStock);

export default router;