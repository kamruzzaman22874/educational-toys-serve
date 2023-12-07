const express = require("express");
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.apl9htr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // const usersCollection = await client.db("educationalToysDB").collection("users");
        const toysCollection = await client.db("educationalToysDB").collection("toys")


        app.get("/alltoys", async (req, res) => {
            const cursor = await toysCollection.find().limit(20).toArray();
            res.send(cursor)

        })
        app.get('/alltoysdetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result)
        })

        app.get("/singletoy", async (req, res) => {
            let query = {}
            if (req?.query?.sellerEmail) {
                query = {
                    sellerEmail: req?.query?.sellerEmail
                }

            }
            const result = await toysCollection.find(query).toArray()
            res.send(result)
        })


        app.post("/singletoy", async (req, res) => {
            const newItem = req.body;
            const result = await toysCollection.insertOne(newItem);
            res.send(result);
        })


        app.put("/toys/:id", async (req, res) => {
            const id = req.params.id;
            const updateToy = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateMenu = {
                $set: {
                    quantity: updateToy.quantity,
                    price: updateToy.price,
                    description: updateToy.description
                },
            }
            const result = await toysCollection.updateOne(filter, updateMenu, options);
            res.send(result);
        })

        app.delete("/toys/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/showToy', async (req, res) => {
            const cursor = await toysCollection.find().toArray();
            res.send(cursor)
        })
        app.get("/searchToy/:text", async (req, res) => {
            const text = req.params.text;
            const result = await toysCollection
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                        { category: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });

        app.get('/toys/lowprice', async (req, res) => {
            const toys = await toysCollection.find().sort({ price: 1 });
            res.json(toys);
        });

        app.get('/toys/highprice', async (req, res) => {
            const toys = await toysCollection.find().sort({ price: -1 });
            res.json(toys);
        });





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Education toy running");
})
app.listen(port, () => {
    console.log(`Education toy running on port ${port}`);
})