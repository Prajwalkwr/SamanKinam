import connectDB from './config/connectDB.js';
import CartProductModel from './models/cartproduct.model.js';

async function cleanupCartItems() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Finding cart items with null productId...');
    const cartItemsWithNullProduct = await CartProductModel.find({
      productId: null
    });

    console.log(`Found ${cartItemsWithNullProduct.length} cart items with null productId`);

    if (cartItemsWithNullProduct.length > 0) {
      const deleteResult = await CartProductModel.deleteMany({
        productId: null
      });

      console.log(`✓ Deleted ${deleteResult.deletedCount} cart items with null productId`);
    } else {
      console.log('No cart items with null productId found');
    }

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupCartItems();