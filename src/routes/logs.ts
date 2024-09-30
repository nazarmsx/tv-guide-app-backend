import {Router} from "express";
const logsRouter = Router();
import * as api from '../models/api'
import * as async from 'async'
import * as  MiddleWares from '../middlewares';

logsRouter.get('/api/admin/logs', MiddleWares.checkAuth, MiddleWares.checkIsAdmin, async function (req, res, next) {
    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 50;
    let query: any = {};
    if (req.query.level) {
        query.title = req.query.level;
    }
    let logs = await api.Log.find(query).sort({timestamp: -1}).limit(limit).skip(offset);
    res.json({
        data: logs
    })
});

logsRouter.get('/admin/api/server-status',
    MiddleWares.checkAuth, MiddleWares.checkIsAdmin
    , function (req, res, next) {
        const sysInfo = require('systeminformation');
        async.parallel({
            disk: function (callback) {
                if (sysInfo) {
                    sysInfo.fsSize(function (diskUsage) {
                        callback(null, {used: diskUsage[0].used, total: diskUsage[0].size})
                    })
                } else {
                    callback(null, {})
                }
            },
            memory: function (callback) {
                if (sysInfo) {
                    sysInfo.mem(function (memoryUsage) {
                        callback(null, memoryUsage)
                    })
                } else {
                    callback(null, {})
                }
            },
            net: function (callback) {
                if (sysInfo) {
                    sysInfo.networkStats('ens18', function (networkStats) {
                        callback(null, networkStats)
                    })
                } else {
                    callback(null, {})
                }
            },
            networkInterfaces: function (callback) {
                if (sysInfo) {
                    sysInfo.networkInterfaces(function (networkInterfaces) {
                        callback(null, networkInterfaces)
                    })
                } else {
                    callback(null, {})
                }
            },
            cpu: function (callback) {
                if (sysInfo) {
                    sysInfo.currentLoad(function (currentLoad) {
                        callback(null, currentLoad.currentload)
                    })
                } else {
                    callback(null, {})
                }
            }
        }, function (err, results) {
            res.json(results)
        })
    });

export {logsRouter};
