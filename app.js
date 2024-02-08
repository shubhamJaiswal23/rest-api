const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =
  'mongodb+srv://udemy3602021:<password>@cluster0.byocklw.mongodb.net/?retryWrites=true&w=majority';

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

// Connect to database and start the server
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );

    // Start the server after successful connection
    app.listen(4500, () => {
      console.log('Server is running on http://localhost:4500');
    });
  } catch (error) {
    console.log('Error', error);
  }
}

run().catch(console.dir);

//REST-API

// Define routes after successful connection

//Send Product
app.post('/api/v1/product/new', async (req, res) => {
  const db = client.db('E-Commerce');
  const collection = db.collection('Products');

  //extracting data from request body
  // const { name, description, price } = req.body;
  try {
    // Insert data into the collection
    await collection.insertOne(req.body);
    res.status(201).json({
      success: true,
      message: 'Product inserted successfully'
    });
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while inserting the product'
    });
  }
});

// Define a GET route to fetch data from the database
app.get('/api/v1/products', async (req, res) => {
  const db = client.db('E-Commerce');
  const collection = db.collection('Products');

  try {
    // Fetch all documents from the collection
    const products = await collection.find({}).toArray();
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching products'
    });
  }
});

// Define a PUT route to update a product by its ID

app.put('/api/v1/products/:id', async (req, res) => {
  const db = client.db('E-Commerce');
  const collection = db.collection('Products');
  const productId = req.params.id;
  const updatedProductData = req.body;

  // Validate the provided ID format
  if (!ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format'
    });
  }

  try {
    // Check if the product with the given ID exists
    const existingProduct = await collection.findOne({
      _id: new ObjectId(productId)
    });

    if (!existingProduct) {
      // If the product does not exist, return a 404 response
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update the product with the given ID
    const result = await collection.updateOne(
      { _id: new ObjectId(productId) }, // Use ObjectId to convert string ID to MongoDB ObjectId
      { $set: updatedProductData }
    );

    if (result.modifiedCount === 0) {
      // If no document was modified, it means the product with the given ID was not found
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the product'
    });
  }
});

// Define a DELETE route to delete a product by its ID

app.delete('/api/v1/products/:id', async (req, res) => {
  const db = client.db('E-Commerce');
  const collection = db.collection('Products');
  const productId = req.params.id;

  // Validate the provided ID format
  if (!ObjectId.isValid(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID format'
    });
  }

  try {
    // Check if the product with the given ID exists
    const existingProduct = await collection.findOne({
      _id: new ObjectId(productId)
    });

    if (!existingProduct) {
      // If the product does not exist, return a 404 response
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete the product with the given ID
    const result = await collection.deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 0) {
      // If no document was deleted, it means the product with the given ID was not found
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the product'
    });
  }
});
