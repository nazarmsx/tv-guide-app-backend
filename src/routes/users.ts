import * as express from 'express'
const router = express.Router();
import * as multer from "multer"
const fs = require('fs');
const appRoot = require('app-root-path').path;
const upload = multer({dest: appRoot + '/uploads'});
import * as  MiddleWares from '../middlewares';

router.post('/api/v1/upload/image', upload.single('image'), MiddleWares.checkAuth, MiddleWares.checkIsAdmin, function (req: any, res, next) {
    const sanitize = require("sanitize-filename");
    if (!req.file) {
        return res.json({error: 'No image provided'});
    }
    const newFileName = `${req.file.path}_${sanitize(req.file.originalname)}`;
    fs.rename(req.file.path, newFileName, function (err) {
        if (err) console.log('ERROR: ' + err);
    });
    const imageUrl = `${process.platform === 'win32' ? 'http://localhost:5000' : 'https://tv.ua-blog.com'}/uploads/${req.file.filename}_${sanitize(req.file.originalname)}`;
    res.send({
        status: "OK", data: {
            imageUrl: imageUrl
        }
    });
});


export {router};
