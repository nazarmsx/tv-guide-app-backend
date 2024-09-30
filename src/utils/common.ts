import * as api from '../models/api'

export function formatBytes(num: number) {
    const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    if (!Number.isFinite(num)) {
        return num;
    }
    const neg = num < 0;
    if (neg) {
        num = -num;
    }
    if (num < 1) {
        return (neg ? '-' : '') + num + ' B';
    }
    const exponent = Math.min(Math.floor(Math.log10(num) / 3), UNITS.length - 1);
    const numStr = Number((num / Math.pow(1000, exponent)).toPrecision(3));
    const unit = UNITS[exponent];
    return (neg ? '-' : '') + numStr + ' ' + unit;
}

export function time12To24(time: string): string {
    let hours = Number(time.match(/^(\d+)/)[1]);
    let minutes = Number(time.match(/:(\d+)/)[1]);
    if (time.indexOf('pm') !== -1 && hours < 12)
        hours = hours + 12;
    if (time.indexOf('am') !== -1 && hours == 12)
        hours = hours - 12;
    let sHours = hours.toString();
    let sMinutes = minutes.toString();
    if (hours < 10)
        sHours = "0" + sHours;
    if (minutes < 10)
        sMinutes = "0" + sMinutes;
    return `${sHours}:${sMinutes}`;
}


let categoriesCache = null;

export async function getCategories() {
    if (!categoriesCache) {
        categoriesCache = await api.Category.find({});
    }
    return categoriesCache;
}

export function getCategoryBySlug(slug, categories) {
    let res = null;
    categories.forEach(e => {
        if (e.slug === slug)
            res = e
    });
    return res
}


export function getCategoryInfo(id, lang, parent_id, categories) {
    let res = [];
    categories.forEach(e => {
        if (e._id == id) {
            let parentSlug = '';
            categories.forEach(k => {
                if (k._id == e.parent_id) {
                    parentSlug = k.slug
                }
            });
            res.push({
                name: e.name, link: `/${lang}/category/${parentSlug}/${e.slug}`
            })
        }
        if (e._id == parent_id) {
            res.push({
                name: e.name, link: `/${lang}/category/${e.slug}`
            })
        }
    });

    return res
}


export function getLinksObject(obj, type: string) {
    let res = [];
    let languages = ['en', 'ru'];
    let names = ['English', 'Русский'];

    languages.forEach(function (elem, index) {
        res.push({link: '/' + elem + `/${type}/` + obj.translations[elem].slug, name: names[index], lang: elem})
    });
    return res
}

export function getRegionByIp(ip: string) {
    const geoip = require('geoip-lite');
    return geoip.lookup(ip);
}
