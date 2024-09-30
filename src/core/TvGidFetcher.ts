import * as moment from 'moment'
import * as cheerio from 'cheerio';
import * as async from 'async'
import * as helpers from './helpers';
import {
    getFirstNotNull,
    formatMovieTitle,
    needToSearch,
    identifySeries,
    identifyMovie,
    formatSeriesTitle,
    mergePrograms
} from '../core/helpers'
import MovieDBFetcher from './MovieDB'
import ChannelService from '../controllers/channels';
import IMDBFetcher from './IMDB';
import to from 'await-to-js'
import {logger as Logger} from '../services/logger';

export class TvGidFetcher {
    private baseUrl: string;
    private tmdb: MovieDBFetcher;
    private imdb: IMDBFetcher;
    private region: string;

    constructor() {
        this.baseUrl = 'https://tvgid.ua';
        this.tmdb = new MovieDBFetcher();
        this.imdb = new IMDBFetcher();
        this.region = 'ua'
    }

    async getProgram(options) {
        if (!options.date){
            options.date = new Date();
        }
        options.date = moment(options.date).format('DDMMYYYY');
        const url = `${this.baseUrl}${options.lang ? '/' + options.lang : ''}/tv-program/all/${options.date}/tmall/`;
        let html = await helpers.getHTML({url: url, encoding: 'binary'});
        const $ = cheerio.load(html);
        let data = [];
        let channelService = new ChannelService();
        let channels = await channelService.getChannelsV2({region: this.getRegion()});
        $('table td.title-channel').each(function (index, elem) {
            let temp = {
                title: $(this).find('a').text().trim(),
                program: [],
                img: undefined,
                type: undefined,
                _id: undefined
            };
            channels.forEach(channel => {
                if (channel.title.toLowerCase().trim() === temp.title.toLowerCase().trim()) {
                    temp.img = channel.img;
                    temp.type = channel.type;
                    temp._id = channel._id;

                }
            });
            $(this).closest(`table[width=\'100%\']`).find('tr').each(async function (index, childRow) {
                let time = $(childRow).find('td.time').text();
                if (time !== null && time !== '') {
                    let programItem = {
                        time,
                        title: null,
                        link: null
                    };
                    let item = $(childRow).find('td.item');
                    let link = $(item).find('a');
                    programItem.title = $(link).text();
                    if ($(link).attr('href'))
                        programItem.link = $(link).attr('href');

                    if (!temp.program.some(e => programItem.time === e.time)) {
                        temp.program.push(programItem)
                    }
                }
            });
            if (TvGidFetcher.filterChannels(temp.title)) {
                data.push(temp)
            }
        });
        return data
    }

    public getRegion(): string {
        return this.region;
    }

    async getFullProgram(date?: any) {
        let languages = [{name: '', alias: 'uk'}, {name: 'ru', alias: 'ru'}];
        let programs = await Promise.all([this.getProgram({date, lang: ''}), this.getProgram({date, lang: 'ru'})]);
        return mergePrograms(programs, 1, languages);
    }

    static filterChannels(title) {
        return true;
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
        return channels;

    }

    async getDescription(url, options) {
        url = `${this.baseUrl}${(options.lang ? '/' + options.lang : '')}${url}`;
        Logger.log(`EXECUTING GET: ${url}`);
        let html = await helpers.getHTML({
            url
            , encoding: 'binary'
        });
        const $ = cheerio.load(html);
        let res = {
            title: null,
            backdrop_path: null,
            genres: null,
            release_date: null,
            overview: null
        };
        let elem;
        let title = $('h1.h1small').text();
        if (title) {
            res.title = title
        }
        elem = $('div#ncnt');
        let img = $(elem).find('img').attr('src');
        if (img) {
            res.backdrop_path = img.indexOf("http") === -1 ? 'http:' + img : img;
        }
        let genres = getNextData($(elem).find('img').eq(0).next(), 'prev').toLowerCase();
        if (genres) {
            res.genres = genres
        }
        if (options.title) {
            res.title = options.title;
        }
        let release_date = $(elem).text().match(/\d+/g);
        if (release_date && release_date.length) {
            res.release_date = parseInt(release_date[0])
        }
        let overview = getNextData($(elem).find('p strong').last(), "next");
        if (overview) {
            res.overview = overview
        }
        return res;
    }

    async getTranslations(programItem) {
        let self = this;
        let formattedTitle = formatMovieTitle(programItem.title);
        if (programItem.link) {
            programItem.translations = {
                uk: await self.getDescription(programItem.link.replace("/ru", ""), {title: programItem.translations.uk.title}),
                ru: await self.getDescription(programItem.link, {title: programItem.translations.ru.title})
            };
            formattedTitle = getFirstNotNull(programItem.translations.uk.originalTitle, programItem.translations.ru.originalTitle, formattedTitle);
            if (formattedTitle.length === 0) {
                formattedTitle = formatMovieTitle(programItem.title)
            }

        }
        let searchResults = [];
        let itemType = 'movie';
        if (needToSearch(programItem.title)) {
            if (identifyMovie(programItem.title)) {
                searchResults = (await self.tmdb.searchMovie({query: formattedTitle})).results;
                Logger.log(programItem.title, 'formattedTitle:', formattedTitle)
            }
            if (identifySeries(programItem.title)) {
                itemType = 'series';
                searchResults = (await self.tmdb.searchTvShows({query: formatSeriesTitle(programItem.title + '')})).results;
                Logger.log(programItem.title, 'formattedTitle:', formatSeriesTitle(programItem.title + ''))
            }
        }
        if (searchResults.length > 0) {
            let foundMovie = searchResults[0];
            let ukTranslations = await self.tmdb.getDetails({
                movie_id: foundMovie.id,
                lang: 'uk',
                itemType
            }, foundMovie);
            let ruTranslations = await self.tmdb.getDetails({
                movie_id: foundMovie.id,
                lang: 'ru',
                itemType
            }, foundMovie);
            if (itemType === 'series' && ruTranslations.tmdb_id) {
                let rating = await self.tmdb.getTvSeriesIMDBRating(ruTranslations.tmdb_id);
                ukTranslations.imdb_rating = rating;
                ruTranslations.imdb_rating = rating
            } else if (itemType === 'movie') {
                let imdb_id = getFirstNotNull(ruTranslations.imdb_id, ukTranslations.imdb_id);
                if (imdb_id) {
                    let [err, imdbInfo] = await to(this.imdb.getMovieInfo(imdb_id));
                    if (imdbInfo) {
                        programItem.translations.ru.imdb_rating = imdbInfo.rating;
                        programItem.translations.uk.imdb_rating = imdbInfo.rating
                    }
                }
            }
            programItem.translations = {
                ru: Object.assign(programItem.translations.ru, ruTranslations),
                uk: Object.assign(programItem.translations.uk, ukTranslations)
            }
        }
        return programItem
    }
}

function getNextData(elem, node) {
    try {
        return elem.eq(0)['0'][node].data ? elem.eq(0)['0'][node].data : ""
    } catch (er) {
        return "";
    }
}
