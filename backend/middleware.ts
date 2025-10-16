import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Estender a interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso requerido',
      message: 'Você precisa estar logado para acessar este recurso'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_aqui')
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token inválido',
      message: 'Seu token de acesso expirou ou é inválido'
    })
  }
}

// Middleware para verificar roles específicas
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado' 
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: `Você precisa ter uma das seguintes permissões: ${roles.join(', ')}`
      })
    }

    next()
  }
}

// Middleware para verificar se é admin
export const requireAdmin = requireRole(['ADMIN'])

// Middleware para verificar se é admin ou manager
export const requireManager = requireRole(['ADMIN', 'MANAGER'])