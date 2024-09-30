# TypeScript interview  questions
**1) How to cast in TypeScript ?**

Type assertion should be used. 
```typescript
let array: any = [1,2,3,4,5];
let arrayLength: number = (<Array[]>array).length;

//or

let array: any = [1,2,3,4,5];
let strLength: number = (array as Array[]).length;
```
Both variants are equivalent, however if you using typescript in JSX `as` keyword is more convenient.

**2) How to check object type?**

Using Javascript  `instanceof` operator 
```typescript
class Animal{
  private name:string;
}
let bird=new Animal();
console.log(bird instanceof Animal)// true
```
**3) How to install TypeScript ?**

Typescript is available in NPM and Yarn
```bash
npm install -g typescript
```
**4) How to compile single file ?**
```typescript
//helo.ts
console.log('Hello world!')
```
```bash
$  tsc hello.ts
```
**5) How to declare array ?**

Array is one of basic types, to declare it following syntax should be used:
```typescript
// SomeType[]
let array: number[] = [1, 2, 3];
interface Person{
  name:string;
}
let employees:Array<Person>=[{name:'John Doe'}] //declaring array of objects
```
**6) How to check whether variable is undefined and/or null ?**

Most simple way, is to use ( something == null ) operator. It return true, if something is null or undefined.
Also ! operator can be used.
```typescript
let obj:any={};
let nullValue:any=null;
let undefinedValue=obj.someProp;
console.log(nullValue==null)//true
console.log(undefinedValue==null)//true

if(!nullValue || !undefinedValue){
  console.log(true)
}
```

**7) How to create enum like type in TypeScript?**

Using `enum` keyword. Enum body consists of zero or many elements. Each element has name & value. Value can be declared as constant or computed.
```typescript
enum Status {
    New=1,
    Pending,
    InProgress,
    Done
}
console.log(Status.Pending)//2
```
**8) How to override method?**
Just implement needed method in derived class. Method in base class should have public or protected modificator.
```typescript
class Shape{
  public paint(){
    throw new Error("Abstract method execution.")
  }
}
class Square  extends Shape{
  private height:number;
  constructor (height:number){
    super();
    this.height=height;
  }
  paint(){
    console.log('|Square|')
  }
}
let obj:Shape=new Square(5);
obj.paint(); // |Square| 
```

**9) How to debug TypeScript?**

There is no recommended way to do it. Most popular is to use ts-node library, which give you ablity to require *.ts files directly in JavaScript file or run ts file. Also using `V8 Inspector Protocol` we can debug Node.js application in Chrome,  using powerful chrome dev tools.
```javascript
require('ts-node').register();
require('./MyAwesomeClass');
```
```bash
ts-node script.ts
``` 

**10) How to import module?**

Any file that containing import/export keyword is considered as module. There is two types of exports: default and named. To import default export write this : import * as Module from './SomeModule'. To import named export -  import {SomeFunc} from './SomeModule'.

```typescript
//Module A 
export default class MyClass{
  someProp:any;
  someMethod(){
  }
}
//Module B
import MyClass from './ModuleA'
import * as moment from "moment";
```

**11) How to name interface?**

According to official coding guidelines, you should use PascalCase  for types names. Also don't use  "I" prefix in interface names. For interface implementation Impl suffix can be added(something like WritableImpl)

**12) What is union type ?**

Variable should be declared with union type if  it can be set with values of different types. It can be usefull when you need to return correct result or null value, for example in find function.

**13) What is decorator and how they can be used ?**

Decorator is a function, which provides a way to add annotation and meta-programming syntax to class and member-functions declaration. Decorator can be attached to a class declaration, property declaration, method, get/set accessors, or parameter. Syntax is very simple, similar to Java anotations.
```typescript
@Entity
export default class MyClass{
  @Prop("primaryKey")
  private id:number;
}
```

**14) How to access member of super class?**
To call base class constructor just run super(). To call base class method use following syntax: 
```typescript
class Abstract{
  public method(){
  }
}
class Concrete  extends Abstract{
  paint(){
    super.method();
  }
}
```

**15) How to use forEach and for..of in TypeScript?**

There is no difference between how to use in JavaScript, except you can specify type for array elem. Also there will be compiler error if you try run forEach method for object or string.
```typescript
let notArray='dsd';
notArray.forEach(e=>{}) // Compilation error - Unresolved function forEach
let array:number[]=[1,2,3];
array.forEach(e=>e.toExponential(2)) // Compiler knows that has number type 
```

**16) What types of access modificators are available ?**

There is three types: public,private,protected. By default all class property & methods are public, but it's better to add this explicitly, in order to make code more readable.
Use protected modificator if you want grant access to all descendant classes, this is useful in complex OOP design. Finally, use private to encapsulate details for implementation, it helps to protect class client from it's inner structure changes. Note that, all this access checks will work only at compile time, because JS don't support access modificators.

**17) What is duck typing ?**

Duck typing consider two object have the same type, if they have same set of properties. Declaring object with literal is equal to creating object with new operator

**18)  What is generics ? How to use them?**

Generic is a some generalized type, which can substituted by any concrete type like string or number. Generics allow to write universal function, with type safety, without using "any" type. There is generic functions,classes, or interfaces, for example you can write Container<T> class, which implement basic collection operations, regardless type of stored elements.
```typescript
function loggingObject<T>(arg: T): T {
     console.log(arg.toString());
     return arg;
}
```

**19) How to use namespaces with TypeScript external modules?**

Namespaces helps organize your code by grouping logically-related types,classes,functions, also using namespaces prevent name conflicts in different modules. 
External modules are already exist in a FS, so we have to load them by path and filename, so there's a logical organization scheme for us to use. Name conflicts can be solved by using 'import as'
 
**20) How to pass options to TypeScript compiler?**

Through command line arguments or tsconfig.json file. If file tsconfig.json located in some directory, that mean's this root of TypeScript project. There are such options available: compilerOptions,files,typeRoots, include, exclude.

**21) There is some way to automatically recompile project if some file changed?**

Yes, run tsc command with -w argument, also pass --no-initial-compille option if you want only watch changes.

**22) How to use JSX in TS project?**

To use JSX you need, save your code in files with *.jsx extension and enable jsx option in tsconfig.json. There is three JSX modes react,preserve, react-native 

# Node.js interview  questions

**1) How to stop/exit from Node.js application?**

Use global object process.exit method - process.exit(1). However it's no more recommended practice [https://nodejs.org/api/process.html#process_process_exit_code], because process.exit() will close application despite some events exist in event loop. To exit from Node.js gracefully use following syntax
```javascript
process.exitCode = 1;
```
To stop execution from terminal use ctrl - c combination.

**2)How to set environment variables ?**
 
Environment variables can be specified before starting application, using following syntax:
```bash
NODE_ENV=production PORT=3000 $ [runtime] [program_name]
```
Finally, get environment variables from process.env
 
**3) How to use async/await in node.js ?**

Since 7.6.0 Node version async/await is available by default. In older version you need to specify –harmony-async-await option. If you are using typescript, set "target" property  to "es6" in tsconfig.json and your code will automatically transpiled.

**4)How to get query string variables in Express.js request handler ?**

Query string store in req.query object in key/value pairs. Also it's possible to extract query params from any url using standard node package "url".
```typescript
import * as url from "url";
const queryParams=url.parse("https://stackoverflow.com/search?query=nodejs")
console.log(queryParams.query)// nodejs
```  
**5)How to check Node.js version installed ?**
Using -v or -version command line argument.
```bash
$ node -v
v8.1.4
```

**6)How to close close socket connection in "net" module?**

Method net.createConnection() returns a Socket object which has destroy(), which handle correct socket closing.

**7)Write simple web-server which serve html files.**
```typescript
import * as connect from 'connect';
import * as  serveStatic from 'serve-static';
connect().use(serveStatic(__dirname)).listen(process.argv[3]?process.argv[3]:3000, function(){
    console.log(`Server running on ${process.argv[3]?process.argv[3]:3000}`);
});
```

**8)Why using blocking/sync operations is bad practise in Node.js?**

Node.js is single threaded, therefore one sync operation can block event loop, and all other will be stopped. Imagine you serving http requests, you received file read request & start reading this file - until you file read operation complete you can't handle no more request. Such practise may work in development, but not in production. Fortunately, node provide both synchronous and asynchronous API, for example : readFile and readFileSync.

**9)What is Continuation-passing style(CPS)? Why it is so popular in Node.js?**

CPS is a style when function don't return result of execution directly, it return result to specified callback function.  As you already know, asynchronous programming is key principle in JS, so naturally it widely used in Node. For example, for IO operations like file reading/writing. But CPS has one serious problem, it's very easy lead to callback hell problem.

**10)How to created a module?**

 At first create some file 'lib.js', then add export expression, that's all. If you are write in TypeScript use import/export.
```typescript
var exports=module.exports={};
exports.someFunc=function someFunc() {
  console.log(`Node is awesome!`)
}
// another file
const utils=require('./lib.js');
utils.someFunc();
```

**11) What is the difference between setTimeout vs process.nexttick & setImmediate?**

setImmediate() push the callback ahead of the job queue, so it will be executed before setTimeout(fn,0).
process.nextTick() will be processed after the current operation completes, regardless of the current phase of the event loop.
```typescript
setTimeout(()=>console.log('setTimeout'),0)
setImmediate(()=>console.log('setImmediate'))
process.nextTick(()=>console.log('nextTick'))
// will print nextTick setTimeout setImmediate

```
**12) What is a cluster module? How it helps scaling Node apps?**

Cluster module is built-in module which provides utilities for forking your single thread app and fully utilize multiple core system power. Using this module unlimited number of child processes can be created, moreover IPC communication is available.

**13)How to manage project dependencies?**

Project dependencies are managed via package.json file. There is two main package managers: NPM and Yarn. To add some dependency just run command npm install "moment", after this you can import this utility in your code. Also in package.json file you can specify development dependencies, to add as little overhead in production as possible, for this add --save-dev option when installing module.

**14)How to copy file in Node.js?**
The most elegant way, is to use createReadStream & createWriteStream methods, or utilize 'fs-extra' package, which provides many useful functions, not available in built-in 'fs' module
```typescript
const fs = require('fs');
fs.createReadStream('dbDump.zip').pipe(fs.createWriteStream('dbDumpCopy.zip'));
const fs = require('fs-extra')

fs.copy('dbDump.zip', 'dbDumpCopy.zip')
  .then(() => console.log('File was successfully copied!'))
  .catch(err =>console.error)
```
**15) How to enable gzip compression for HTTP server ?**

If you are using Express.js framework, there is "compression" middleware available.
```typescript
import * as compression  from 'compression'
import * as express from 'express';
const app = express();
function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    return false
  }
  return compression.filter(req, res)
}
app.use(compression({filter: shouldCompress}))
```
**16)How to hash string with md5 function?**
Using built-in module "crypto".
```typescript
let message = "I love node and express.js";
const crypto = require('crypto');
let hashed=crypto.createHash('md5').update(message).digest("hex");
```
**16)Write functions which loads image from URL?**
```typescript
import * as fs from 'fs';
import * as request from'request';

function downloadImage(uri, filename){
  return new Promise((resolve,reject)=>{
    request.head(uri, function(err, result, body){
      if(err){
        return reject(err);
      }
      request(uri).pipe(fs.createWriteStream(filename)).on('close',()=> resolve());
    });
  })
}

downloadImage('https://docs.npmjs.com/images/npm.svg', 'npm-logo.svg').then(()=>console.log('Images saved.')).catch(er=>console.error);
```
**17)What is stream in Node.js?**

Stream - is a concept first introduced in UNIX to pass data from one program to another for I/O operations. This feature helps make programs more independent & specific, consequently chaining several programs results become easier. Another great feature that stream allow to process big files, which doesn't fit in RAM. To implement such functionality in Node.js use 'stream' module.
There is 4 types of streams: readable,writable,duplex,transform. Streams can manipulate with Buffer or string data. Example of writable streams are: HTTP requests,responses,TCP sockets.

**18)How to do Base64 encoding/decoding ?**

Using buffer toString method, any data can be encoded: image,text, binary data.
```typescript
let base64Data=Buffer.from("I love JS!").toString('base64'); //SSBsb3ZlIEpTIQ==
let decodedData=Buffer.from(base64Data, 'base64').toString('utf8'); // I love JS!
```
**19) How to run cron jobs in Node.js?**

To run simple cron job setInterval can be used, for more complex intervals external lib like 'node-cron' should be used, it supports  GNU crontab like syntax.

```typescript
import * as cron from 'node-cron';
cron.schedule('5 8 * * Sun', function(){
  console.log('Running every sunday');
});
```

**20)How to automatically restart a node server on crash or system reboot?**

To automatically you node application on system start use Linux 'upstart' utility.
To restart application oun crash use forever or pm2 CLI tool.

# ES6 interview questions

**1)How declare constant variable in ES6?**

Use 'const' keyword instead of 'var' or 'let'. Constant variable can't be reassigned, however content on which it points can. If you try to re-assigne 'TypeError: Assignment to constant variable.' will be thrown
**2)What is blocked scoped variables?**

Before ES6, in JS were exist only function scoped variables, which can cause some tricky to find errors. Therefore blocked scoped variables were introduced, they work like in C++ or Java. 
To declare block scoped variable use 'let' keyword instead of 'var'.
```typescript
if(2+2){
  var functionScope='functionScope'
  let blockedScope='blockedScope'
}
console.log(functionScope)// 'functionScope'
console.log(blockedScope)// ReferenceError: blockedScope is not defined
```
**3) What is arrow function? How it differ from usual function ?**
Arrow function is more compact version of ordinary JS function. 'function' key word is no more required to declare function, you just only need use => syntax.
```typescript
[1,2,3].map(e=>e*2) // [2,4,6]
```
The main difference between arrow function and function expression is that, first doesn't have own 'this',arguments,super. It's also known as lexical this.

**4)How to set default parameters in JS?**

The syntax is similar to other languages: argumentName = someValue.
```typescript
function join(arr,separator=','){ return arr.join(separator)}
```

**5)What is rest parameter?**
This argument aggregate all arguments passed after required arguments, previously some manipulation with 'arguments' array need to get this values, so this feature is very helpful.
```typescript
function push(arr,elem,...otherElems){
  arr.push(elem);
  
  if(otherElems.length){
    otherElems.forEach(e=>push(arr,e))
  }
}
push([],1,2,3); // [1,2,3]
```
**6)What is spread operator ?**
Spread operator split collection into separate function arguments, this allow to call function which accepts three params, with one param.
```typescript
const day = [2015, 10, 12];
const dayOff = new Date(...day);
let firstArray=[4,5,6]
let secondArray=[1,2,3,...firstArray] // [1,2,3,4,5,6]
```

**7)How to use template string literal in ECMAScript 6**
Just wrap string expression in '`some string`' quotes ( grave accent). String expression allows to use variables inside them, this simply code, which use string concatenation to format. Also it is possible to create multiline temlates, '\n' is no needed now.
```typescript
let user={'name':'John Doe',balance:0}
let message=`Hello ${user.name} your balance getting low. 
Balance: ${user.balance}`;
```
**8)What new features were added to literal in ES?**
Binary and octal literal is supported now. Unicode within strings and regular expressions support were extended.
```typescript
console.log(0b100000000 === 256) //true
console.log(0o400 === 256) //true
console.log("ㅎ" === "\u{314E}") //true
console.log("ㅎ".codePointAt(0) == 0x314E) //true
```
**9) What is property shorthands in object literals?**

In ES6 variable name can be used as object key, it makes object declaration more compact.
```typescript
let someVar=10;
let obj={name:'Test',someVar}
```
**10) How to declare object with computed property name?**
```typescript
function generateId(){
  return Math.ceil(Date.now()+Math.random())+'';
}
let userIds={
  [generateId]:{name:'John Doe'}
}
```
**11)What is destructuring assignment?**

Destructuring is more compact and easy way to extract multiple values in single variables. There is object and array destructuring.
```typescript
let user={firstName:'John',lastName:'Snow'}; //object destructuring 
let {firstName,lastName}=user;

let [users,orders]=await Promise.all([loadUsers(),loadOrders()]);
// instead of 
let results=await Promise.all([loadUsers(),loadOrders()]);
let users=results[0];
let orders=results[1];
```
**12) How to define class in new OOP style?**
```javascript
class Rectangle{
  constructor(height,width){
    this.height=height;
    this.width=width;
  }
  getArea(){
    return this.height*this.width;
  }
}
```
**13) How to extend some class in ECMAScript 6 ?**
Use extends keyword. No more programmatic actions with prototypes required.
```javascript
class Square extends Rectangle{
  constructor(height){
    super(height,height);
  }
}
```
**14) How to access member of super class?**
To call base class constructor just run super(). To call base class method or property use following syntax: 

```javascript
class Square extends Rectangle{
  constructor(height){
    super(height,height);
  }
  draw(){
    super.draw()
  }
}
```
**14) What is static members of class in ES6?**

To declare static member function use 'static' keyword, such member function belongs to class, not to object. To call static member you need get it from class name: SomeClass.getInstance(); Unfortunately static properties still not available in current standard, so you need use TypeScript or write a hack.
```javascript
class StaticTest{
  static  getInstance(){
    if(!StaticTest.instanse){
      StaticTest.instanse=new StaticTest();
    }
    return  StaticTest.prototype;
  }
}
console.log(StaticTest.getInstance())
```

**15) How to export class in ES6?**
There is two types of export: named & default. To export class use following syntax:
```typescript
class ExportedClass{}
export default ExportedClass;

//or
export {ExportedClass};
```

**16) Implement zip array function in JS**
```javascript
Array.prototype.zip=function ( ...arrays){
   return this.map((val, i) => arrays.reduce((a, array) => [...a, array[i]], [val]));
}
console.log([1, 2, 3].zip([4, 5, 6])) //[[1, 4], [2, 5], [3, 6]]
```
**17) Implement zip array function in JS**
```javascript
Array.prototype.zip=function ( ...arrays){
   return this.map((val, i) => arrays.reduce((a, array) => [...a, array[i]], [val]));
}
console.log([1, 2, 3].zip([4, 5, 6])) //[[1, 4], [2, 5], [3, 6]]
```
**18)What is typed array? Where is better to use it than ordinary array?**
Types array allows to store raw binary data in order to improve performance. As you know ordinary arrays can store any data, and change size dynamically, consequently computing large amount of data take time. In recent years webapps became more complex, they need to work with video,audio data, handle WebSocket connections, so it's obvious that we need some way to handle binary data fast.
There is 4 classes of typed arrays: ArrayBuffer,Uint32Array,Uint8Array,Float32Array.

**19)How to copy properties from one object to another in ES6?**
Use Object.assign(dest,source1,{}) method, it copies all enumerable from one or more objects to dest object.
```javascript
let dest={};
Object.assign(dest,{prop:'val'},{prop2:'val2'})// {prop:'val',prop2:'val2'}
```
**20) How to find element in Array ?**
There are two new functions to search element of array: find and findIndex. Array.prototype.find() return first matched value in array, Array.prototype.findIndex() return index of first found value. If there is no such element undefined will be returned. 
```javascript
console.log([1,2,3,4,5].find(e => e > 4)) //5
console.log([1,2,3,4,5].findIndex(e => e > 4)) //4
```
**21)What String.prototype.repeat() function do?**
"some string".repeat(n) return string concatenated 'n' times.
```javascript
console.log("TypeScript ".repeat(3)) // "TypeScript TypeScript TypeScript "
```
**22)What new method to searching in string were added in ECMAScript 6?**

* String.prototype.startsWith() - determines whether string is started with specified substring.
* String.prototype.endsWith() - determines whether string is ended with specified substring.
* String.prototype.includes() - determines whether string contain specified substring.

All new methods have similar syntax, they have one required parameter - search string, and one optional - start index.
 
**23)How to check whether number is NaN or finite?**
In ES6 were introduced Number.isNaN and Number.isFinite methods.
```javascript
console.log(Number.isNaN(NaN))//true
console.log(Number.isFinite(-Infinity))//true
```
**24)How to use promise in ES6?**
There is no transpilers or libraries required, ES6 support promises be default. 

**25)What is Proxy in ECMAScript6 ?**

Proxy is a object which intercept access attempts for another object, and can modify them.
Syntax:
```javascript
let proxy = new Proxy(target, handler)
```