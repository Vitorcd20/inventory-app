// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  console.log('Cleared existing data')

  const accessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      description: 'Jewelry and accessories category'
    }
  })

  console.log('Created main category')

  const rings = await prisma.category.create({
    data: {
      name: 'Rings',
      description: 'Various types of rings',
      parentId: accessories.id
    }
  })

  const bracelets = await prisma.category.create({
    data: {
      name: 'Bracelets',
      description: 'Bracelets and bangles',
      parentId: accessories.id
    }
  })

  const necklaces = await prisma.category.create({
    data: {
      name: 'Necklaces',
      description: 'Necklaces and chains',
      parentId: accessories.id
    }
  })

  console.log('Created subcategories')

  await prisma.product.createMany({
    data: [
      // Rings
      {
        code: 'RING001',
        title: 'Gold Ring 18k',
        description: '18k gold ring with polished finish',
        categoryId: rings.id,
        quantity: 12,
        unitPrice: 150.00,
        salePrice: 220.00,
        minStock: 5
      },
      {
        code: 'RING002',
        title: 'Silver Ring 925',
        description: '925 silver ring with zirconia stone',
        categoryId: rings.id,
        quantity: 18,
        unitPrice: 45.00,
        salePrice: 75.00,
        minStock: 8
      },
      
      {
        code: 'BRAC001',
        title: 'Leather Bracelet',
        description: 'Genuine leather bracelet with steel clasp',
        categoryId: bracelets.id,
        quantity: 25,
        unitPrice: 20.00,
        salePrice: 35.00,
        minStock: 10
      },
      {
        code: 'BRAC002',
        title: 'Silver Chain Bracelet',
        description: '925 silver chain bracelet 20cm',
        categoryId: bracelets.id,
        quantity: 15,
        unitPrice: 65.00,
        salePrice: 95.00,
        minStock: 6
      },

      {
        code: 'NECK001',
        title: 'Silver Venetian Chain',
        description: '925 silver venetian chain 60cm',
        categoryId: necklaces.id,
        quantity: 10,
        unitPrice: 80.00,
        salePrice: 120.00,
        minStock: 4
      },
      {
        code: 'NECK002',
        title: 'Gold Chain 18k',
        description: '18k gold cartier chain 50cm',
        categoryId: necklaces.id,
        quantity: 6,
        unitPrice: 350.00,
        salePrice: 500.00,
        minStock: 2
      }
    ]
  })

  console.log('Created products')

  const sale = await prisma.sale.create({
    data: {
      code: 'SALE001',
      customer: 'John Doe',
      status: 'CONFIRMED',
      totalValue: 295.00
    }
  })

  const ring = await prisma.product.findFirst({ where: { code: 'RING001' } })
  const bracelet = await prisma.product.findFirst({ where: { code: 'BRAC002' } })

  if (ring && bracelet) {
    await prisma.saleItem.createMany({
      data: [
        {
          saleId: sale.id,
          productId: ring.id,
          quantity: 1,
          unitPrice: 220.00,
          subtotal: 220.00
        },
        {
          saleId: sale.id,
          productId: bracelet.id,
          quantity: 1,
          unitPrice: 95.00,
          subtotal: 95.00
        }
      ]
    })

    await prisma.product.update({
      where: { id: ring.id },
      data: { quantity: { decrement: 1 } }
    })

    await prisma.product.update({
      where: { id: bracelet.id },
      data: { quantity: { decrement: 1 } }
    })
  }

  console.log('Created sample sale')

  const categoryCount = await prisma.category.count()
  const productCount = await prisma.product.count()
  const saleCount = await prisma.sale.count()

  console.log('Seed completed successfully!')
  console.log(`Created:`)
  console.log(`   - ${categoryCount} categories (1 main + 3 subcategories)`)
  console.log(`   - ${productCount} products`)
  console.log(`   - ${saleCount} sale`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })