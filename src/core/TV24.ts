import MovieDBFetcher from './MovieDB'
import IMDBFetcher from './IMDB';
import * as moment from 'moment'
import { getJSON} from './helpers'
import {time12To24} from '../utils'
import to from 'await-to-js'
import {logger} from '../services/logger';
import {error} from 'util';
import * as cheerio from 'cheerio';
import {logger as Logger} from '../services/logger';
import * as async from 'async'

export class TV24 {
    private baseUrl: string;
    private tmdb: MovieDBFetcher;
    private imdb: IMDBFetcher;
    private region: string;

    constructor() {
        this.baseUrl = 'https://tv24.co.uk';
        this.tmdb = new MovieDBFetcher();
        this.imdb = new IMDBFetcher();
        this.region = 'uk'
    }

    public getRegion(): string {
        return this.region;
    }

    async getProgram(options) {
        if (!options.date){
            options.date = moment(new Date()).format('YYYY-MM-DD');
        }
        let [err, body] = await to(getJSON(`${this.baseUrl}/x/tvguide/1000014/180/${options.date}/default`));
        if (err) {
            logger.error(error);
            return [];
        }
        let channels = [];
        body.forEach((element) => {
            const $ = cheerio.load(element.schedules);
            const el = $;
            let title = $('div.info h3').text();
            let image = $('img');

            let channel = {
                title: title,
                img: $(image).attr('src'),
                program: []
            };
            $('.broadcasts  li').each((index, elem) => {
                let title = $(elem).find('span.title');
                let time = time12To24($(elem).find('span.time').text());
                let t = {
                    time: time,
                    title: title.text(),
                    link: `https://tv24.co.uk/x${$(elem).find('a.program').attr('href')}/180/100014`,
                };
                channel.program.push(t)
            });
            channels.push(channel)
        });
        return channels;
    }

    async loadDescriptions(channels) {
        let self = this;
        for (let i = 0; i < channels.length; ++i) {
            await new Promise((resolve, reject) => {
                Logger.log(channels[i].title);
                async.eachOfLimit(channels[i].program, 2, function (programItem, index, cb) {
                    self.getTranslations(programItem).then((newProgramItem) => {
                        cb(null)
                    }).catch(er => {
                        cb(null);
                        console.error(er)
                    })
                }, function (err) {
                    Logger.log('DONE: ', channels[i].title);
                    if (err) {
                        console.error(err)
                    }
                    resolve()
                })
            })
        }
    }

    async getDescription(href) {
        let [err, body] = await to(getJSON({url: href, cache: true}));
        if (err) {
            Logger.log(err);
            return {}
        }
        const $ = cheerio.load(body.contentBefore);
        let announcementBlock = $('#info-popup');
        let res: any = {
            originalTitle: $('div.info h1').text().trim(),
            overview: $('p').text().trim(),
        };
        let backdrop_path = $('div.image .actual').css('background-image');
        if (backdrop_path) {
            backdrop_path = backdrop_path.replace("url('", '').replace("')", '').replace(/\"/gi, "");
            res.backdrop_path = backdrop_path;
        }
        if (body && body.targeting) {
            res.type = body.targeting.program_type;
        }
        return res
    }

    async getTranslations(programItem) {
        let self = this;
        let description: any = {};
        programItem.translations = {en: {}};
        if (programItem.link) {
            description = await await self.getDescription(programItem.link);
        }
        let searchResults = [];
        let itemType = 'movie';
        if (description.type === 'movie') {
            searchResults = (await self.tmdb.searchMovie({query: programItem.title})).results
        }
        if (description.type === 'series') {
            searchResults = (await self.tmdb.searchTvShows({query: programItem.title})).results;
            itemType = 'series'
        }
        if (description.type != 'movie' || description.type != 'series') {
            Object.assign(programItem.translations.en, description)
        }
        if (searchResults.length > 0) {
            let foundMovie = searchResults[0];
            let enTranslations = await self.tmdb.getDetails({
                movie_id: foundMovie.id,
                lang: 'en',
                itemType
            }, foundMovie);
            if (itemType === 'series' && enTranslations.tmdb_id) {
                let rating = await self.tmdb.getTvSeriesIMDBRating(enTranslations.tmdb_id);
                enTranslations.imdb_rating = rating
            }
            if (enTranslations.imdb_id && itemType === 'movie') {
                let [err, imdbInfo] = await to(this.imdb.getMovieInfo(enTranslations.imdb_id));
                if (imdbInfo) {
                    enTranslations.imdb_rating = imdbInfo.rating;
                }
            }
            programItem.translations = {
                en: Object.assign(programItem.translations.en, enTranslations)

            }
        }
        return programItem
    }

    async getFullProgram(date?: any) {
        let channels = this.getProgram({date: date});
        return channels;
    }
}

async function test() {
    let fetcher = new TV24();
    try {
        console.time('TV24');
        let channels = await fetcher.getProgram({date: '2018-05-19'});
        await fetcher.loadDescriptions(channels);
        console.timeEnd('TV24');
        console.log(channels.length);
        let links = [];
        const fs = require('fs');

        fs.writeFileSync('channels.json', JSON.stringify(channels, null, 4));
        process.exit()
    } catch (er) {
        console.error(er)
    }

}

async function testGetDescription() {
    let fetcher = new TV24();
    let desc = await fetcher.getDescription('https://tv24.co.uk/x/b/p7r2rc-2329/180');
    console.log(desc);
}
