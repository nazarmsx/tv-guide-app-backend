const MovieDB = require('moviedb')('eca3c57f19627eb934aa6fff0dcd1a22');
import IMDBFetcher from './IMDB';
import {getJSON} from './helpers';
import * as  countries from 'i18n-iso-countries';

export default class MovieDBFetcher {
    private imdb: IMDBFetcher;
    private apiKey: string;
    private baseUrl: string;
    private imagePath: string;

    constructor() {
        this.imdb = new IMDBFetcher();
        this.apiKey = 'eca3c57f19627eb934aa6fff0dcd1a22';
        this.baseUrl = 'https://api.themoviedb.org/3';
        this.imagePath = 'https://image.tmdb.org/t/p/w500'
    }

    getMovieInfo(title: string, original: string, lang: string = 'ru', year?: number) {
        let self = this;
        return new Promise((resolve, reject) => {
            if (title === '' || title === ' '){
                return resolve({});
            }
            let search = 'searchMovie';
            let getInfo = 'movieInfo';
            if (original.indexOf('Т/с') !== -1) {
                search = 'searchTv';
                getInfo = 'tvInfo'
            }
            MovieDB[search]({query: title}, async function (err, res) {
                if (err) {
                    return reject(err)
                }
                let movieInfo = res.results.sort((a, b) => b.popularity - a.popularity)[0];
                if (year) {
                    try {
                        res.results.forEach(e => {
                            if (e.release_date) {
                                let temp = new Date(e.release_date);
                                if (year == temp.getFullYear())
                                    movieInfo = e
                            }
                        })
                    } catch (er) {

                    }
                }
                if (!movieInfo){
                    return resolve({});
                }
                let result: any = {};
                if (getInfo === 'movieInfo') {
                    result = await self.getMovieTranslations(movieInfo.id, lang, movieInfo)
                }
                if (getInfo === 'tvInfo') {
                    result = await self.getTvTranslations(movieInfo.id, lang, movieInfo)
                }
                if (result.imdb_id) {
                    let imdbInfo = await self.imdb.getMovieInfo(result.imdb_id);

                    if (imdbInfo.rating) {
                        result.imdb_rating = imdbInfo.rating
                    }
                }
                resolve(result)
            })
        })
    }

    static getTranslations() {}

    async searchMovie(options) {
        let url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(options.query)}&language=${options.lang ? options.lang : 'en-US'}&include_adult=false&include_video=false&page=1`;
        return getJSON({url: url, cache: true});
    }

    async searchTvShows(options) {
        let url = `${this.baseUrl}/search/tv?api_key=${this.apiKey}&query=${encodeURIComponent(options.query)}&language=${options.lang ? options.lang : 'en-US'}&include_adult=false&include_video=false&page=1`;
        return getJSON({url: url, cache: true});
    }

    async getDetails(options, res) {
        if (options.itemType === 'series') {
            return this.getTvTranslations(options.movie_id, options.lang ? options.lang : 'en-US', res)
        }
        let url = `${this.baseUrl}/movie/${options.movie_id}?api_key=${this.apiKey}&language=${options.lang ? options.lang : 'en-US'}&append_to_response=credits,videos`;
        let data = await getJSON({url: url, cache: true});
        return this.formatDescription(data, 'movieInfo', res, options);

    }

    async getMovieTranslations(movie_id, lang, movieInfo) {
        let self = this;
        return new Promise((resolve, reject) => {
            MovieDB.movieInfo({id: movie_id, language: lang}, function (err, res) {
                let result = self.formatDescription(res, 'movieInfo', movieInfo, {lang});
                resolve(result)

            })
        })

    }

    async getTvTranslations(tv_id, lang = 'en', movieInfo) {
        let getURl = `${this.baseUrl}/tv/${tv_id}?api_key=${this.apiKey}&language=${lang}`;
        let data = await getJSON({url: getURl, cache: true});
        data.credits = await this.getTvSeriesCrew(tv_id);
        return this.formatDescription(data, 'tvInfo', movieInfo, {lang});

    }

    async loadTvShowExternalIds(tv_id) {
        let externalIds = `${this.baseUrl}/tv/${tv_id}/external_ids?api_key=${this.apiKey}`;
        let ids: any = await getJSON({url: externalIds, cache: true});
        let result: any = {};
        if (ids.imdb_id) {
            result.imdb_id = ids.imdb_id
        }
        return result;
    }

    async getTvSeriesIMDBRating(tv_id) {
        let externalIds = await this.loadTvShowExternalIds(tv_id);
        if (externalIds && externalIds.imdb_id) {
            let imdbInfo = await this.imdb.getMovieInfo(externalIds.imdb_id);
            if (imdbInfo.rating) {
                return imdbInfo.rating;
            }
        }
        return null;
    }

    formatDescription(res, type, movieInfo, options) {
        let result: any = {};
        if (res) {
            result.backdrop_path = res.backdrop_path ? this.imagePath + res.backdrop_path : null;
            result.genres = res.genres.reduce((prev, e, index, arr) => {
                prev += e.name.toLowerCase() + (arr.length === index + 1 ? '' : ', ');
                return prev
            }, '');
            result.tmbd_title = res.title ? res.title : movieInfo.title;
            result.overview = res.overview;
            result.release_date = res.release_date;
            result.original_title = res.original_title;
            result.imdb_id = res.imdb_id;
            result.tmdb_id = res.id;
            if (type === 'movieInfo') {
                result.budget = res.budget;
                result.revenue = res.revenue;
                result.runtime = res.runtime
            }
            if (res.credits && res.credits.cast && res.credits.cast.map) {
                result.actors = res.credits.cast.slice(0, 10).map(e => e.id);
            }
            if (res.credits && res.credits.crew && res.credits.crew.map) {
                result.directors = res.credits.crew.filter(e => e.job === 'Director').map(e => e.id);
            }
            let productionCountries = type === 'tvInfo' ? res.origin_country : res.production_countries.map(e => e.iso_3166_1);
            if (productionCountries && productionCountries.length) {
                let lang = (options && options.lang) ? options.lang : 'ru';
                result.countries = productionCountries.reduce((prev, e, index, arr) => {
                    prev += countries.getName(e, lang) + (arr.length === index + 1 ? '' : ', ');
                    return prev
                }, '')
            }
            if (type === 'tvInfo') {
                result.tmbd_title = res.name;
                result.original_title = res.original_name;
                result.release_date = res.first_air_date
            }
            if (res.videos && res.videos.results && res.videos && res.videos.results.length) {
                result.youtube = res.videos.results[0].key;
            }

        }
        return result
    }

    async getActorInfo(tmdb_id: number, language: string = 'en-US') {
        let externalIds = `${this.baseUrl}/person/${tmdb_id}?api_key=${this.apiKey}&language=${language}`;
        let info: any = await getJSON({url: externalIds, cache: true});
        if (info.status_code && info.status_code === 34) {
            return {};
        }
        let firstMatch = false;
        if (info.also_known_as && info.also_known_as.forEach) {
            info.also_known_as.forEach(name => {
                if (name.match(/[а-яА-ЯЁё]/) && ['ru', 'uk'].indexOf(language) != -1 && !firstMatch) {
                    info.name = name;
                    firstMatch = true
                }
            })
        }
        let res = {
            name: info.name,
            gender: info.gender,
            imdb_id: info.imdb_id,
            profile_path: info.profile_path ? this.imagePath + info.profile_path : null,
            biography: info.biography,
            popularity: info.popularity
        };
        return res;
    }

    public async getTvSeriesCrew(tv_id: string) {
        let getURl = `${this.baseUrl}/tv/${tv_id}/credits?api_key=${this.apiKey}`;
        let data = await getJSON({url: getURl, cache: true});
        return data;
    }
}
