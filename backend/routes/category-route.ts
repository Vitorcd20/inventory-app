import { Router } from 'express';
import { body, param } from 'express-validator';
import categoryController from '../controllers/category-controller';

const router = Router();

const validateCreateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome deve ter entre 1 e 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Descrição deve ter no máximo 300 caracteres'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('ID da categoria pai deve ser um UUID válido')
];

const validateUpdateCategory = [
  param('id').isUUID().withMessage('ID deve ser um UUID válido'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome deve ter entre 1 e 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Descrição deve ter no máximo 300 caracteres'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('ID da categoria pai deve ser um UUID válido'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive deve ser um valor booleano')
];

router.post('/', validateCreateCategory, categoryController.createCategory);
router.get('/', categoryController.listCategories);
router.get('/:id', param('id').isUUID(), categoryController.getCategoryById);
router.put('/:id', validateUpdateCategory, categoryController.updateCategory);
router.delete('/:id', param('id').isUUID(), categoryController.deleteCategory);

export default router;