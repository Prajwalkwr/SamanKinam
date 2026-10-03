import bcryptjs from 'bcryptjs'
import mongoose from 'mongoose'
import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import CategoryModel from '../models/category.model.js'
import ProductModel from '../models/product.model.js'
import UserModel from '../models/user.model.js'

// Fixed ids keep the seeded data identical across serverless instances that each run their own in-memory database
const defaultAdminId = '66a000000000000000000001'

export const catalogCollections = ['categories', 'subcategories', 'products', 'paymentsettings']
const catalogFile = fileURLToPath(new URL('../data/catalog.json', import.meta.url))

const seedCatalogSnapshot = async () => {
  if (!existsSync(catalogFile)) return false

  const catalog = mongoose.mongo.BSON.EJSON.parse(readFileSync(catalogFile, 'utf8'), { relaxed: false })
  for (const name of catalogCollections) {
    const documents = catalog[name] || []
    const collection = mongoose.connection.db.collection(name)
    if (documents.length > 0 && await collection.countDocuments() === 0) {
      await collection.insertMany(documents, { ordered: false })
      console.log(`Seeded ${documents.length} ${name} from data/catalog.json.`)
    }
  }
  return true
}

const defaultCategories = [
  { _id: '66a000000000000000000101', name: 'Atta, Rice & Dal', image: 'https://res.cloudinary.com/dljwfy0pe/image/upload/v1725888087/binkeyit/rqs2ac9wwpdkcbzd7om6.png' },
  { _id: '66a000000000000000000102', name: 'Baby Care', image: 'https://res.cloudinary.com/dljwfy0pe/image/upload/v1725882539/binkeyit/xgw4tbydzhakirfzm8fo.png' },
  { _id: '66a000000000000000000103', name: 'Bakery & Biscuits', image: 'https://res.cloudinary.com/dljwfy0pe/image/upload/v1725882610/binkeyit/uz3opyestu20xwosazao.png' },
  { _id: '66a000000000000000000104', name: 'Fruits & Vegetables', image: 'https://res.cloudinary.com/dljwfy0pe/image/upload/v1725955316/binkeyit/lmvmyyjdm6vdgwhqazve.png' }
]

const defaultProducts = [
  {
    _id: '66a000000000000000000201',
    name: 'Whole Wheat Atta',
    image: ['https://res.cloudinary.com/dljwfy0pe/image/upload/v1725888087/binkeyit/rqs2ac9wwpdkcbzd7om6.png'],
    unit: '5 kg',
    stock: 80,
    price: 525,
    discount: 5,
    description: 'Premium whole wheat atta for everyday cooking',
    more_details: { brand: 'Saman Kinam', category: 'Atta, Rice & Dal' }
  },
  {
    _id: '66a000000000000000000202',
    name: 'Baby Diaper Pack',
    image: ['https://res.cloudinary.com/dljwfy0pe/image/upload/v1725882539/binkeyit/xgw4tbydzhakirfzm8fo.png'],
    unit: '1 pack',
    stock: 45,
    price: 415,
    discount: 10,
    description: 'Soft and comfortable baby diapers for daily use',
    more_details: { brand: 'Saman Kinam', category: 'Baby Care' }
  },
  {
    _id: '66a000000000000000000203',
    name: 'Classic Chocolate Cookies',
    image: ['https://res.cloudinary.com/dljwfy0pe/image/upload/v1725882610/binkeyit/uz3opyestu20xwosazao.png'],
    unit: '200 g',
    stock: 50,
    price: 156,
    discount: 8,
    description: 'Crispy chocolate cookies with rich cocoa flavour',
    more_details: { brand: 'Saman Kinam', category: 'Bakery & Biscuits' }
  },
  {
    _id: '66a000000000000000000204',
    name: 'Fresh Organic Apples',
    image: ['https://res.cloudinary.com/dljwfy0pe/image/upload/v1725955316/binkeyit/lmvmyyjdm6vdgwhqazve.png'],
    unit: '1 kg',
    stock: 60,
    price: 210,
    discount: 0,
    description: 'Fresh organic apples sourced locally',
    more_details: { brand: 'Saman Kinam', category: 'Fruits & Vegetables' }
  }
]

export const seedWebsiteData = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'

    const existingAdmin = await UserModel.findOne({ role: 'ADMIN' })

    if (!existingAdmin) {
      const existingByEmail = await UserModel.findOne({ email: adminEmail })
      if (!existingByEmail) {
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(adminPassword, salt)

        await new UserModel({
          _id: defaultAdminId,
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          verify_email: true,
          status: 'Active'
        }).save()

        console.log(`Seeded default admin account: ${adminEmail} / ${adminPassword}`)
      }
    }

    const categoryCount = await CategoryModel.countDocuments()
    const productCount = await ProductModel.countDocuments()

    const seededSnapshot = categoryCount === 0 && productCount === 0 && await seedCatalogSnapshot()

    if (!seededSnapshot && categoryCount === 0) {
      const categories = await CategoryModel.insertMany(defaultCategories)
      console.log(`Seeded ${categories.length} default categories.`)
    }

    if (!seededSnapshot && productCount === 0) {
      const categories = await CategoryModel.find()
      if (categories.length > 0) {
        const productsToInsert = defaultProducts.map((product) => {
          const category = categories.find((cat) => cat.name === product.more_details.category)
          return {
            ...product,
            category: category ? [category._id] : [],
            subCategory: []
          }
        })

        const products = await ProductModel.insertMany(productsToInsert)
        console.log(`Seeded ${products.length} default products.`)
      }
    }

    // Ensure text index is created for product search
    await ProductModel.collection.createIndex({ name: 'text', description: 'text' }, { weights: { name: 10, description: 5 } })
    console.log('Text index ensured for ProductModel')
  } catch (error) {
    console.error('Failed to seed website data:', error)
  }
}
