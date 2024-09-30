# MongoDB interview  questions
**1) What type of databases MongoDB is?**

MongoDB is a NoSQL document oriented database. It doesn't require schema for you data, also it supports sharding and replication out of the box. 

**2) Where and in what format Mongo stores documents?**

MongoDB stores data in collections which consist of BSON documents. There is no need to create collection before inserting document, db engine will create it automatically. It's completely different approach comparing to relational databases, which demand creation of table with predefined schema before any record to be inserted. 

**3) How to create index in MongoDB?**

To create index use following database command: db.collection.createIndex(keys, options). First argument is a object with fields on which you need to create index, second argument should contains a set of options that controls creation of index.
```javascript
db.orders.createIndex({ amount: 1, createdAt: 1, category: 1 },{})
``` 

**4) Does MongoDB support transactions?**

Starting from version 4.0 MongoDB support transactions. So now Mongo can be used for situations  that require atomicity for updates to multiple documents or consistency between reads to multiple documents.

**5) What are a WiredTiger and MMAPv1?**

WiredTiger and MMAPv1 are storage engine which MongoDB uses under the hood. Until version 3.2 MMAPv1 was default storage engine, to ensure durability it writes information about all data updates to journal. WiredTiger support journaling too, but it have some other techniques to ensure durability and consistency: snapshots and checkpoints. There is possibility to disable journal, because MongoDB can recover from the last checkpoint. However it's not recommended because changes after last checkpoint can't be recovered. 

**6) How to disable journaling ?**

From MongoDB version 4.0, you cannot specify --nojournal option or storage.journal.enabled: false for replica set members that use the WiredTiger storage engine.

**7) How to count num of distinct values per field/key ?**

For such case MongoDB has special command  distinct, which returns an array of distinct values for a field. To get number just use array length field. 
```bash
> db.users.distinct('langauge');
[ "en", "ru", "uk", "de" ]
``` 

**8) How to efficiently paginate collection in MongoDB ?**

There are two approaches: using skip() and limit() or find() and limit().
skip() command take as argument number of first n documents need to be skipped in result set. limit() command is responsible for number of documents to be returned.
```javascript
db.users.find().skip(10).limit(20) //Getting second page
``` 
Second approach is to use find() command to query specific documents, for example documents which has _id field less than last document on previous page.
```bash
db.users.find().limit(10);
last_id = ...
db.users.find({'_id'> last_id}). limit(10);
``` 

**9) What is aggregation pipeline?**
The aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results.


**10) How to sort documents?**

To sort documents on specific field use $orderby query modifier. The $orderby allows sort result in ascending or descending order.
```bash
db.users.find({first_name:"John"}).sort( { age: -1 } )
``` 
**11) How to sort on array field in MongoDB?**

Use aggregation framework operator $unwind, which deconstructs an array field from given documents to set of documents for each element of array.
This query sorts employees by amount of annual bonus amount.
```bash
db.employees.aggregate(
    { $match: {
        _id : 1
    }}, 
    { $unwind: '$bonuses' },
    { $match: {
        'bonuses.type': 'annual'
    }},
    { $sort: {
        'bonuses.amount': -1
    }}
)
``` 
**12) How to get collection size?**

To get size of MongoDB collection use  db.collection.stats(). This method return statistic about your collection: number of documents in collection, size of collection,index size.
It accepts optional parameter 'scale', which determines output units for size data, by default it shown in bytes. 
```bash
db.logs.stats(1024*1024);
``` 
**13) What is cursor?**

Cursor is a pointer to the collection of documents return by db.collection.find () function. Cursor has various of useful methods like: cursor.hasNext(),cursor.count(),cursor.explain().

```javascript
var users = db.users.find( { age : { $gt:18 }});
while(users.hasNext()){
print(tojson(users.next()));
}
``` 

**14)Is there any limit on size of document?**

Mongo store documents in BSON format, max size of BSON document is a 16 megabytes.

**15) Is there any limit on number of indexes per collection?**

One collection can have no more than 64 index. If you need more indexes, you should consider split your collection.

**16) What is a capped collection? How to create capped collection?**

Capped collection is a collection with fixed size, they support high-throughput operations that insert and retrieve documents based on insertion order. If you reach maximum size of collection firstly inserted documents will be removed. Also capped collections guarantee preservation of the insertion order. To create capped collection use following syntax:
```javascript
db.createCollection("logs", { capped: true,
                              size: 1024*1024*1024,
                              max:10000})
``` 

**17) How to remove document from collection?**
There is to methods for deletion documents:db.collection.deleteMany() and db.collection.deleteOne(). First command removes all documents that the filter from a collection, second delete first matched document.
```javascript
db.users.deleteMany({createdAt:{$gte:twoWeeksAgo},emailConfirmed:false})
``` 
 
**18) What is sharding and replication in MongoDB?**
Sharding is a method for distributing db data across multiple servers. It should by used for big data sets, which doesn't fit on one machine. Replication is when same data set stored at several locations. MongoDB replica set provide redundancy and high availability, and is recommended to be used on production.
Replica set is a group of mongod instances that have same data sets. There is primary node, that receive all write operations, other nodes do only read operations.

**19) How to enable password authentication?**
First step is to create administrator user
```javascript
db.createUser(
  {
    user: "admin",
    pwd: "super_secretPassword",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  }
)
``` 
Then restart MongoDB with --auth argument
```bash
mongod --auth --port 27017 --dbpath /data/mydb
``` 

**20) What is Map-Reduce and how to use it?**

Map-Reduce is a is a programming model that allows tasks to be simultaneously performed on many distributed computers. MongoDB provides built-in mapReduce database command. There two phases
* map - takes documents and emits key-value pairs
* reduce - collects and condenses the aggregated data

```bash
> var map = function() {emit(this.movie_id,this.rating);};
> var reduce = function(movie_id,ratings) {return Array.sum(ratings);};
> db.MovieRatings.mapReduce(
{
    "result" : "totals",
    "timeMillis" : 599,
    "counts" : {
        "input" : 9,
        "emit" : 9,
        "reduce" : 3,
        "output" : 3
    },
    "ok" : 1
}
``` 
**21) What is GridFS?**

GridFS is convention  to save files that larger than 16 MB. All of the official MongoDB drivers support this convention, as does the mongofiles program.

**22) What is ObjectId and how it generated?**

ObjectId is a 12-byte BSON type which is used to uniquely identify documents within a collection. It is generated based on current timestamp, machine ID, process ID, and local counter. By default MongoDB uses ObjectId to set document _id field.
```bash
> ObjectId()
ObjectId("5baba06c2a61fbb201c19d82")
```   

**23) On what data structure MongoDB indexes are based?**

MongoDB indexes are based on B-trees. B-tree is a type of balanced tree, which provides effective data storage and search. 

**24) How to search on array field?**

To query collection on array field use following syntax:
```bash
db.post.find( { tags: ["nosql", "nosql"] } ) // Find all documents which has tags field consist of "nosql" and "mongo" in specified order.
``` 
If order is not relevant use $all operator:
```bash
db.post.find( { tags: { $all: ["nosql", "nosql"] } } )
``` 
**25) How to check if a collection exists in Mongodb?**

In mongo shell run following command:
```bash
use mydb;
db.runCommand( { listCollections: 1 } );
``` 
# 25 trickiest Express.js interview questions and answers

**1) What is middleware functions in Express.js?**

Middleware is a functions that performs some preparatory or commonly used action before passing request to main handler. For example you need to check user session on every request, so you write middleware functions, that check it, so you don't duplicate this check in all controllers.

```typescript
import * as express from 'express';
const app = express();
app.use(function(req,res,next) {
  const token=req.headers['token'] || req.cookies.token;
  let result=tokenService.verifyToken(token);
  if(result.error){
    return NotAuthorized(req,res);
  }
  req.user=result;
  return next(null,req,res);
});
``` 

**2) How to make a redirect to specific URL?**

To redirect to specific URL use response method redirect([status,] path). It accepts one two parameters: URL,redirect status code or just URL.
```typescript
res.redirect(301, 'https://domain.com');
res.redirect('https://domain.com');
``` 
**3) How to get query params?**

You can get query params in req.params object. 

```typescript
router.get('/api/user/:userId', async function (req, res, next) {
  const userId=req.params.userId;
});
``` 

**4) What is template engines and how to use them?**

A template engine allows you to use static template files in your application to render dynamic HTML responses. To use template engine use app.set() method.

```typescript
app.set('view engine', 'hbs')
``` 

**5) How to run Express.js server in production mode?**

To run Express server in production mode, you should set NODE_ENV variable to 'production'. By default server works in development mode.
```bash
$ NODE_ENV=production node bin/www
``` 

**6) How to automatically redirect HTTP traffic to HTTPS?**

There is couple of way to do it. First is to utilize res.redirect method, second to use Nginx or HAProxy as reverse proxy 

```typescript
const http = express.createServer();
http.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url); 
});
http.listen(80);
``` 
For Ngnix
```bash
location / {
    proxy_pass http://localhost:8080;
}
```

**7) How to run Express.js app in cluster mode?**

It's well know fact, that Node.js is single threaded, so your can't fully utilize multi-core system capacities running in single mode. To run multiple instance of Express.js built in 'cluster' module should be used.

```javascript
const cluster = require('cluster');
if (cluster.isMaster) {
  const cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
} else {
    const express = require('express');
    const app = express();
    app.get('/', function (req, res) {
        res.end('Rendered in cluster mode.!');
    });
    app.listen(8080);
}
```

**8) How to handle file upload?**

Express doesn't provide file upload api out the box, but you can use one of various middlewares, which are availble at NPM.
In following example we use a 'multer' package.
```typescript
import * as express from 'express'
const router = express.Router();
import * as multer from "multer"
const fs = require('fs');
const appRoot = require('app-root-path').path;
const upload = multer({ dest: appRoot+'/uploads' });
router.post('/api/v1/upload/image',upload.single('image'), function(req:any, res, next) {
  const sanitize = require("sanitize-filename");
  if(!req.file){
    return res.json({error:'No image provided'});
  }
  const newFileName=`${req.file.path}_${sanitize(req.file.originalname)}`;
  fs.rename(req.file.path, newFileName, function(err) {
    if ( err ) console.log('ERROR: ' + err);
  });
  res.send({status:"OK"});
});
export {router};
```

**9) ExpressJS how to structure an application?**

There is no official recommendation about how to structure Express.js application, so creating architecture rests on the shoulders of developer. There is some recommendation about directory structure.

```bash
├── app.js   // file where express server started
├── config   // Configuration files
├── models   // Data models for Sequlize or Mongoose
├── public   // Directory for static assets
├── routes   // The routes in you application, with controller functions
├── services // Any other service utils your application using
└── views    // Template engine views (HBS,JADE,EJS)
```

**10) How to restart Node.js application when uncaught exception happens?**

When application works in production, uptime should be as big as possible, so there is a need of service that will restart server after critical error. There is several command line utils, which can do this: forever,pm2,nodedemon. The main difference is that you start application through this util,you don't run it with 'node' command directly. Also this packages save logs of application, provides information about memory usage and current uptime.
```bash
pm2 start app.js
```
**11) Does Express.js supports basic auth?**

No, express doesn't support it out of the box, but there is library express-basic-auth, which helps to add this feature to app.

**12) What res.end() function do?**

res.end function ends response process. It can be used to quickly send response with no data or when you to signal that you write last chunk of buffered data.

```javascript
app.use(function(req, res) {
res.status(404).end();
})
```

**13)How to send JSON response?**

The easiest way to send JSON response is to use res.json(data) method. It will automatically add correct content-type to response headers and transforms passed object to JSON. However you could it on your own using res.send() and setting headers.
```javascript
router.get('/api/image-dimensions',upload.single('image'), function(req, res, next) {
const json=getImageDimension();
res.header('Content-Type', 'application/json');
res.send( json );        
})
```

**14)What res.type(type) function do?**

Function res.type(type) change the Content-Type HTTP header to the MIME type as determined by mime.lookup() for the specified type. 
```javascript
res.type('html');// => 'text/html'
```

**15)Describe main differences between and Express.js and Sails.js?**

- Sails.js is more powerful, it have own ORM, can auto-generate REST API's, built'n WebSocket support, defined application structure. Express.js can't do nothing similar without additional libraries and middlewares.
- Express.js is more flexible than Sails.js, you can build your app like a constructor. Sails.js severely limits developer ability to change application structure.
- Express.js is easier to learn, which is great for beginner programmers.
- Sails.js has powerful CLI utility  

**16)What is 'express-generator'?**

Express generator is util to generate express.js apps. Before project generation you can configure template engine,stylesheet engine, .gitignore file.

```bash
$ npm install -g express-generator
$ express --view=hbs /tmp/foo && cd /tmp/foo
```

**17)What is router?**

A router object is an isolated instance of middleware and routes. Router is a basic class to implement REST api and Website pages. router.METHOD(path, [callback, ...] callback) method is used to add route.

**18)Could route handler function be async?**

Yes, it's is possible to utilize async/await in express.js controller functions.

**19) How to send file using Node.js streams ?**

Node.js streams allows read and write buffered data. For example it's very useful when file doesn't feet in ram, so you don't reed full file, just process it in chunks.
```javascript
router.get('/api/v1/image-proxy/:name', function(req, res) {
  return require('request').get('https://imagecdn.com/'+req.params.name).pipe(res);  // res being Express response
})
```

**20) Why is important to distinguish operational and programmer errors ?**

Operation errors are not bugs, but problems with the system, like down database or full hard drive, programmer error is a bug which leads to incorrect application behaviour. It's good practise to be ready to any operational error and handle gracefully without crashing.