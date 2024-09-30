import * as moment from 'moment'
import * as cheerio from 'cheerio';
import * as async from 'async'
import ChannelService from '../controllers/channels'
import {
    getFirstNotNull,
    formatMovieTitle,
    needToSearch,
    identifySeries,
    identifyMovie,
    formatSeriesTitle,
    getHTML,
    mergePrograms
} from '../core/helpers'
import to from 'await-to-js'
import IMDBFetcher from './IMDB'
import {logger as Logger} from '../services/logger';
import MovieDBFetcher from './MovieDB'

export default class ViasatFetcher {
    private tmdb: MovieDBFetcher;
    private channelService: ChannelService;
    private imdb: IMDBFetcher;
    private region: string;
    private baseUrl: string = 'https://viasat.ua';

    constructor() {
        this.tmdb = new MovieDBFetcher();
        this.channelService = new ChannelService();
        this.imdb = new IMDBFetcher();
        this.region = 'ua'
    }

    public getRegion(): string {
        return this.region;
    }

    async getProgram(options) {
        let self = this;
        if (!options.date){
            options.date = moment(new Date()).format('YYYY-MM-DD');
        }
        if (options.lang === undefined) {
            options.lang = 'ru';
        }
        const lang = options.lang;
        let url = `https://viasat.ua/api${lang ? '/' + lang : ''}/program`;
        let form = `date=${options.date}&_token=sU1Y55h8SjRfhhJSrOMPgmBpMCjX206r7n9QhXkc&time=0`;
        Logger.log(`EXECUTING POST: ${url}`, form);
        let [err, body] = await to(getHTML({
            url,
            method: 'POST',
            form: form
        }));
        if (err) {
            Logger.error(err);
            return []
        }
        const $ = cheerio.load(body);
        let channels = [];
        $('div.program-block').each((index, el) => {
            let image = $(el).find('div.channel-img img');
            let link: any = $(el).find('div.channel-img a');
            link = link ? $(link).attr("href") : "";
            let title = $(image).attr('title');
            if (title && title.trim) {
                title = title.trim()
            }
            let channel = {
                title: title,
                img: self.baseUrl + $(image).attr('src'),
                program: [],
                link: link
            };
            $(el).find('div.program-item p').each((index, elem) => {
                let text = $(elem).text().trim().replace(/ +(?= )/g, '');
                let t = {
                    time: text.substr(0, 5),
                    title: text.substr(text.indexOf(' ') + 1),
                    link: $(elem).find('a').eq(0).attr('href')
                };
                if (t.title && t.title.trim) {
                    t.title = t.title.replace(/\n/g, '').trim()
                }
                channel.program.push(t)
            });
            channels.push(channel)
        });
        for (let i = 0; i < channels.length; ++i) {
            if (channels[i].title === '' && channels[i].link) {
                let [err, body] = await to(getHTML({url: channels[i].link, cache: true}));
                if (!err && body) {
                    let $ = cheerio.load(body);
                    let title = $('div.post__title h1').first();
                    if (title) {
                        channels[i].title = title.text().trim();
                    }

                }
            }
        }
        return channels
    }

    async loadDescriptions(channels) {
        let self = this;
        for (let i = 0; i < channels.length; ++i) {
            if (channels[i].link) {
                let channelInfo = await this.getChannelInfo(channels[i].link);
                if (channelInfo.title) {
                    channels[i].title = channelInfo.title;
                }
            }
            await new Promise((resolve, reject) => {
                Logger.log(channels[i].title);
                async.eachOfLimit(channels[i].program, 3, function (programItem, index, cb) {
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
        let [err, body] = await to(getHTML({url: href, cache: true}));
        if (err) {
            Logger.log(err);
            return {}
        }
        const $ = cheerio.load(body);
        let announcementBlock = $('section.announcement-info');
        let res = {
            originalTitle: $(announcementBlock).find('h1').text(),
            backdrop_path: $(announcementBlock).find('img').attr('src'),
            overview: $(announcementBlock).find('.text-block-wrap').text(),
        };
        if (res.overview) {
            res.overview = res.overview.trim().replace(/ +(?= )/g, '');
        }
        return res
    }

    async getChannelInfo(link: string): Promise<{ title?: string }> {
        let [err, body] = await to(getHTML({url: link, cache: true, expireTime: Date.now() + 7 * 24 * 60 * 60 * 1000}));
        if (err) {
            Logger.log(err);
            return {}
        }
        const $ = cheerio.load(body);
        let header = $("div.post__title h1");
        if (header) {
            let title = header.text().trim();
            return {title};
        }
    }

    async getTranslations(programItem) {
        let self = this;
        let formattedTitle = formatMovieTitle(programItem.title);
        if (programItem.link) {
            programItem.translations = {
                uk: await self.getDescription(programItem.link.replace('/ru', '/ua')),
            };
            programItem.translations.ru = programItem.translations.uk;
            formattedTitle = getFirstNotNull(programItem.translations.uk.originalTitle, programItem.translations.ru.originalTitle, formattedTitle);
            if (formattedTitle.length === 0) {
                formattedTitle = formatMovieTitle(programItem.title)
            }

        } else {
            programItem.translations = {ru: {}, uk: {}}
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

    async fetchChannels() {
        let self = this;
        let channels = await self.getProgram({});
        channels.forEach(channel => {
            delete channel.program;

            channels.push(channel)
        });
        let channelMap = channels.reduce((pr, e) => {
            if (!pr[e.title])
                pr[e.title] = e;
            return pr
        }, {});
        return Object.keys(channelMap).map(e => channelMap[e])
    }

    async getFullProgram(date?: any) {
        let channelsInfo = await this.channelService.getChannelsV2({region: this.getRegion()});
        let channelTitleMap = channelsInfo.reduce((pr, e: any) => {
            pr[e.title.toLowerCase().trim()] = e;
            return pr
        }, {});
        let languages = [{name: '', alias: 'uk'}, {name: 'ru', alias: 'ru'}];
        let programs = await Promise.all([this.getProgram({date, lang: ''}), this.getProgram({date, lang: 'ru'})]);
        let channels = mergePrograms(programs, 1, languages);
        channels.forEach((e, index, arr) => {
            let formattedTitle = e.title.toLowerCase().trim();
            if (channelTitleMap[formattedTitle]) {
                arr[index]._id = channelTitleMap[formattedTitle]._id;
                arr[index].img = channelTitleMap[formattedTitle].img ? channelTitleMap[formattedTitle].img : arr[index].img;
            }
        });
        return channels;
    }
}


