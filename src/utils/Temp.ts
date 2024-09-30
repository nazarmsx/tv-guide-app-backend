const fs = require('fs');
const request = require('request');
import SEO from './SEO'
import * as api from '../models/api'

function download(uri, filename) {
    return new Promise((resolve, reject) => {
        request.head(uri, function (err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', () => {
                resolve();
            });
        });
    })

}

export class ImageTransfer {
    async moveImage(url: string, name: string) {
        const sanitize = require("sanitize-filename");
        const crypto = require('crypto');
        const cacheKey = crypto.createHash('md5').update(Date.now() + '').digest("hex");
        const appRoot = require('app-root-path').path;
        const newFileName = `${cacheKey}_${name.toLowerCase()}.${sanitize(url.split('.').pop())}`;
        const imageUrl = `${SEO.getCanonicalUrl()}/uploads/${newFileName}`;
        await download(url, `${appRoot}/uploads/` + newFileName);
        return imageUrl;
    }

}

async function updateChannelsImages() {
    let channels: any = await api.Channel.find({region: 'ua'});
    let transfer = new ImageTransfer();
    const getSlug = require('speakingurl').createSlug('_', 'en');
    for (let channel of channels) {
        if (channel.img && channel.img.indexOf('viasat.ua') != -1) {
            channel.img = await transfer.moveImage(channel.img, getSlug(channel.title));
            await channel.save();
        }
    }
}
