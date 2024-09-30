import ViasatFetcher from './Viasat';
import * as async from 'async'
import MovieDBFetcher from './MovieDB'
const helpers = require('./helpers');
const fs = require("fs");

export default class ProgramGenerator {

    private viasat: ViasatFetcher;
    private tmdb: MovieDBFetcher;

    constructor() {
        this.viasat = new ViasatFetcher();
        this.tmdb = new MovieDBFetcher();
    }

    async generateProgram(date = new Date()) {
        let self = this;
        let channels = await this.viasat.getProgram({date, type: 18});
        let movies = [];
        let movieIndex = {};
        let counter = 0;
        channels.forEach((c, channelIndex) => {
            movies = movies.concat(c.program.map((e, index) => {
                movieIndex[counter++] = {channel: channelIndex, position: index};
                return e.title;
            }));
        });
        let res: any = await new Promise((resolve, reject) => {
            async.mapLimit(movies, 1, function (movie, cb) {
                let title = helpers.formatMovieTitle(movie);
                console.log(movie, title);
                self.tmdb.getMovieInfo(title, movie).then(desc => {
                    cb(null, desc);

                }).catch(er => {
                    console.error(er);
                    cb(null, {})
                })
            }, (err, res) => {
                if (err)
                    console.error(err);
                return resolve(res);
            })
        });
        movies.forEach((entry, index) => {
            console.log(entry, res[index])
        });
        res.forEach((e, index) => {
            let t = movieIndex[index];
            channels[t.channel].program[t.position] = Object.assign({}, channels[t.channel].program[t.position], e);
        });
        return channels;
    }
}
