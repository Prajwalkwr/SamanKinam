import bcryptjs from 'bcryptjs'
import CategoryModel from '../models/category.model.js'
import ProductModel from '../models/product.model.js'
import UserModel from '../models/user.model.js'

const defaultCategories = [
  { name: 'Atta, Rice & Dal', image: 'https://res.cloudinary.com/dljwfy0pe/image/upload/v1725888087/binkeyit/rqs2ac9wwpdkcbzd7om6.png' },
  { name: 'Baby Care', image: 'https://res.cloudinary.com/dljwfy0pe/image/upload/v1725882539/binkeyit/xgw4tbydzhakirfzm8fo.png' },
  { name: 'Bakery & Biscuits', image: 'https://res.cloudinary.com/dljwfy0pe/image/upload/v1725882610/binkeyit/uz3opyestu20xwosazao.png' },
  { name: 'Fruits & Vegetables', image: 'https://res.cloudinary.com/dljwfy0pe/image/upload/v1725955316/binkeyit/lmvmyyjdm6vdgwhqazve.png' }
]

const defaultProducts = [
  {
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

    if (categoryCount === 0) {
      const categories = await CategoryModel.insertMany(defaultCategories)
      console.log(`Seeded ${categories.length} default categories.`)
    }

    if (productCount === 0) {
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
  } catch (error) {
    console.error('Failed to seed website data:', error)
  }
}
