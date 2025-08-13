import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Adiciona a propriedade 'user' ao tipo Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

const prisma = new PrismaClient()

export const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_aqui', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' })
    }
    req.user = user
    next()
  })
}

export class AuthController {
  
  // Registrar novo usuário
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role = 'USER' } = req.body

      console.log('📝 Registrando novo usuário:', email)

      // Validações básicas
      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'Dados obrigatórios',
          message: 'Nome, email e senha são obrigatórios'
        })
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Senha muito fraca',
          message: 'A senha deve ter pelo menos 6 caracteres'
        })
      }

      // Verificar se usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return res.status(409).json({
          error: 'Email já cadastrado',
          message: 'Já existe um usuário com este email'
        })
      }

      // Hash da senha
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Criar usuário
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })

      console.log('✅ Usuário criado:', user.email)

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        user
      })

    } catch (error) {
      console.error('💥 Erro ao registrar usuário:', error)
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar usuário'
      })
    }
  }

  // Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      console.log('🔐 Tentativa de login:', email)

      // Validações básicas
      if (!email || !password) {
        return res.status(400).json({
          error: 'Dados obrigatórios',
          message: 'Email e senha são obrigatórios'
        })
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        })
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        })
      }

      // Gerar JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'seu_jwt_secret_aqui',
        { expiresIn: '24h' }
      )

      // Atualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })

      console.log('✅ Login realizado:', user.email)

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })

    } catch (error) {
      console.error('💥 Erro no login:', error)
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha no login'
      })
    }
  }

  // Verificar token (para rotas protegidas)
  async verifyToken(req: Request, res: Response) {
    try {
      const user = req.user

      if (!user) {
        return res.status(401).json({
          error: 'Token inválido'
        })
      }

      // Buscar dados atualizados do usuário
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLogin: true,
          createdAt: true
        }
      })

      if (!currentUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        })
      }

      res.json({
        success: true,
        user: currentUser
      })

    } catch (error) {
      console.error('💥 Erro na verificação do token:', error)
      res.status(500).json({
        error: 'Erro interno do servidor'
      })
    }
  }

  // Listar usuários (apenas para admins)
  async getUsers(req: Request, res: Response) {
    try {
      const currentUser = req.user

      if (currentUser.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Apenas administradores podem listar usuários'
        })
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          lastLogin: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      res.json({
        success: true,
        users
      })

    } catch (error) {
      console.error('💥 Erro ao listar usuários:', error)
      res.status(500).json({
        error: 'Erro interno do servidor'
      })
    }
  }

  // Logout (opcionalmente blacklist o token)
  async logout(req: Request, res: Response) {
    try {
      // Em uma implementação mais robusta, você poderia adicionar
      // o token a uma blacklist no banco de dados ou Redis
      
      console.log('👋 Logout realizado')

      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      })

    } catch (error) {
      console.error('💥 Erro no logout:', error)
      res.status(500).json({
        error: 'Erro interno do servidor'
      })
    }
  }

  // Alterar senha
  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body
      const userId = req.user.id

      console.log('🔑 Alterando senha do usuário:', userId)

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Dados obrigatórios',
          message: 'Senha atual e nova senha são obrigatórias'
        })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'Senha muito fraca',
          message: 'A nova senha deve ter pelo menos 6 caracteres'
        })
      }

      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        })
      }

      // Verificar senha atual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)

      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Senha atual incorreta'
        })
      }

      // Hash da nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      // Atualizar senha
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      })

      console.log('✅ Senha alterada com sucesso')

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      })

    } catch (error) {
      console.error('💥 Erro ao alterar senha:', error)
      res.status(500).json({
        error: 'Erro interno do servidor'
      })
    }
  }
}