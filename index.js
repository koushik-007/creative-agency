const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ylujz.mongodb.net/creative-agency?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('creative-agency'));
app.use(fileUpload());



app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db("creative-agency").collection("customerOrders");
    const reviewsCollection = client.db("creative-agency").collection("reviews");
    const serviceCollection = client.db("creative-agency").collection("services");
    const adminEmailCollection = client.db("creative-agency").collection("adminEmail");
    app.post('/addService', (req, res) => {
        
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const projectName = req.body.projectName;
        const projectDetails = req.body.projectDetails;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        console.log(req.body)
        orderCollection.insertOne({ name, email, projectName, projectDetails, price, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    
    app.get('/serviceList', (req, res) => {
        const email = req.query.email;
        orderCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addReviews', (req, res) => {
        const review = req.body;
        console.log(review);
        reviewsCollection.insertOne(review)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/clientData', (req, res) => {
        orderCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.get('/showReviews', (req, res) => {
        reviewsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addService', (req, res) => {
        
        const file = req.files.file;
        const serviceTitle = req.body.serviceTitle;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        console.log(req.body, image)
        serviceCollection.insertOne({ serviceTitle, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminEmailCollection.find({email: email})
        .toArray((err, admin) => {
            res.send(admin.length>0);
        })
    })
    app.post('/makeAdmin', (req, res)=>{
        const email = req.body;
        adminEmailCollection.insertOne(email)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

});


app.listen(process.env.PORT || 5000)