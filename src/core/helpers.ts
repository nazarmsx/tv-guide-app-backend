const request = require('request');
const windows1251 = require('windows-1251');
import {logger as Logger} from '../services/logger';
import * as humanizeDuration from 'humanize-duration'
import {HTTPRequestCaching} from "../utils/caching/RequestCaching"


export function formatMovieTitle(title: string): string {
    title = title.replace('Х/ф', '');
    title = title.replace('Д/ф', '');
    title = title.replace('М/ф', '');
    title = title.replace('Т/с', '');
    title = title.replace('Д/с', '');
    title = title.replace('М/с', '');
    title = title.replace('Премьера.', '');
    title = title.replace(/"/g, '');
    return title.trim()
}

export function identifySeries(title: string): boolean {
    let types = ['Т/с', 'Д/с', 'М/с'];
    return types.some(e => title.indexOf(e) !== -1)
}

export function identifyMovie(title: string): boolean {
    let types = ['Х/ф', 'Д/ф', 'М/ф'];
    return types.some(e => title.indexOf(e) !== -1)
}

export function formatSeriesTitle(title: string): string {
    title = title.replace('Т/с', '');
    if (title.indexOf('\",') !== -1) {
        title = title.slice(0, title.indexOf('\",'));
        title = title.replace(/"/g, '')

    }
    title = title.replace(/"/g, '');
    return title.trim()
}

export function needToSearch(title: string): boolean {
    return ['Х/ф', 'Д/ф', 'М/ф', 'Т/с', 'Д/с', 'М/c'].some(e => title.indexOf(e) !== -1)
}

export async function cashedRequest(options, callback) {
    let result = await HTTPRequestCaching.getInstance().makeRequest(options);
    return callback.apply(null, result);
}

export function getHTML(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
        if (typeof options === 'string') {
            options = {url: options}
        }
        options.method = options.method ? options.method : 'GET';
        options = Object.assign(options, {agent: false, pool: {maxSockets: 300}, timeout: 15000});
        let requestType = request;
        if (options.cache) {
            requestType = cashedRequest;
        }
        let periodStart = Date.now();
        requestType(options, function (err, response, body) {
            Logger.log(`${response && response.statusCode} ${err ? err : options.method} ${options.url} ${humanizeDuration(Date.now() - periodStart, {units: ['s']})}`);
            if (err) {
                Logger.error(err);
                return reject(err)
            }
            if (options.encoding && options.encoding === 'binary') {
                body = windows1251.decode(body, {})
            }
            return resolve(body)
        })
    })
}

export function getFirstNotNull(...param) {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != null)
            return arguments[i]
    }
}

export function getJSON(options): Promise<any> {
    return new Promise((resolve, reject) => {
        if (typeof options === 'string') {
            options = {url: options}
        }
        options = Object.assign(options, {agent: false, pool: {maxSockets: 300}, timeout: 15000});

        options.method = options.method ? options.method : 'GET';
        let periodStart = Date.now();
        let requestType = request;
        if (options.cache) {
            requestType = cashedRequest;
        }
        requestType(options, function (err, response, body) {
            Logger.log(`${response && response.statusCode} ${err ? err : options.method} ${options.url} ${humanizeDuration(Date.now() - periodStart, {units: ['s']})}`);
            if (err) {
                Logger.error(err);
                return reject(err)
            }
            if (response.headers['x-ratelimit-remaining'] != null)
                console.log('rate: ' + response.headers['x-ratelimit-remaining']);
            try {
                resolve(JSON.parse(body))
            } catch (er) {
                return resolve({})
            }
        })
    })
}

export function normalizeText(str: string): string {
    return str.trim()
}

export function chunkify(a, n, balanced) {
    if (n < 2)
        return [a];
    var len = a.length, out = [], i = 0, size;
    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push(a.slice(i, i += size));
        }
    } else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, i += size));
        }
    } else {
        n--;
        size = Math.floor(len / n);
        if (len % size === 0)
            size--;
        while (i < size * n) {
            out.push(a.slice(i, i += size));
        }
        out.push(a.slice(size * n));
    }
    return out;
}

export function mergeArray(chuncks) {
    let totalLength = chuncks.reduce((pr, e) => pr + e.length, 0);
    if (totalLength === 0)
        return [];
    let res = new Array(totalLength);
    let nextIndex = 0;
    for (let nested of chuncks) {
        for (let elem of nested) {
            res[nextIndex++] = elem
        }
    }
    return res;
}

export function mergePrograms(programs, mainIndex, languages) {
    let mainProgram = programs[mainIndex];
    for (let channel of mainProgram) {
        if (channel.program.forEach && channel.program.forEach) {
            channel.program.forEach((item, index) => {
                item.translations = languages.reduce((pr, e) => {
                    pr[e.alias] = {};
                    return pr;
                }, {});
                programs.forEach((tempProgram, index) => {
                    tempProgram.forEach((tempChannel) => {

                        if (tempChannel.title === channel.title) {
                            tempChannel.program.forEach(e => {
                                if (e.time === item.time) {
                                    item.translations[languages[index].alias].title = e.title;
                                    if (item.translations && item.translations.uk && item.translations.uk.title) {
                                        item.title = item.translations.uk.title;
                                    }
                                }
                            })
                        }
                    })
                })
            })
        }
    }
    return mainProgram;
}
