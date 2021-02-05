const express = require('express')
const app = express()

app.use(express.json())
app.set('port', 3000)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "*");
    next();
})

const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://mongoDB:mongoDB@cluster0.kotmn.mongodb.net', (err, client) => {
    db = client.db('Cw2')
})

// display a msg 
app.get('/', (req, res, next) => {
    // res.send('Select a collection, e.g., /collection/messages')
    res.sendFile('index.html')
})

// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

//add an object

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops)
    })
})

const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e)
        res.send(result)
    })
})


//update
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false }, (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
        })
})
//delete
app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {
            _id: ObjectID(req.params.id)
        },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ?
                { msg: 'success' } : { msg: 'error' })
        })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Express.js server running at localhost:3000')
})