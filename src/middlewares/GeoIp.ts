import {getRegionByIp} from "../utils"

export function regionExtract(req, res, next) {
    if (req.headers['x-forwarded-for']) {
        let res = getRegionByIp(req.headers['x-forwarded-for']);
        if (res) {
            req.region = res.country.toLowerCase();
        }
        next()
    }
}
