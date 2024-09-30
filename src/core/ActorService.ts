import * as api from '../models/api'
import {chunkify, mergeArray} from '../core/helpers'
import MovieDBFetcher from './MovieDB'
import * as async from 'async'
import {logger as Logger} from '../services/logger';

export class ActorService {
    private tmdb: MovieDBFetcher;

    constructor() {
        this.tmdb = new MovieDBFetcher()

    }

    public async findAndUpdateActorsInDatabase(actorIds: number[]) {
        let chunks = chunkify(actorIds, Math.floor(actorIds.length / 200), true);
        let inDbActors = mergeArray(await Promise.all(chunks.map(e => api.Actor.find({tmdb_id: {$in: e}}, {
            tmdb_id: 1,
            updatedAt: 1
        }).lean())));

        let inDbActorsMap = inDbActors.reduce((pr, e) => {
            pr[e.tmdb_id] = true;
            return pr;
        }, {});
        let needToLoadInfo = actorIds.filter(e => !inDbActorsMap[e]);
        let self = this;
        let toInsert = [];
        await new Promise((resolve, reject) => {
            async.eachOfLimit(needToLoadInfo, 1, async function (actorId: number, index) {
                let actorInfo = await self.formatActor(actorId);
                await new Promise((resolve, reject) => {
                    setTimeout(function () {
                        resolve();
                    }, 500)
                });
                toInsert.push(actorInfo);
            }, function (err) {
                if (err) {
                    Logger.log(err);
                }
                resolve()
            })
        });

        await api.Actor.create(toInsert)
    }

    public async formatActor(tmdb_id: number) {
        let languages = ['en', 'ru', 'uk'];
        let info = await Promise.all(languages.map(lang => this.tmdb.getActorInfo(tmdb_id, lang)));
        let res: any = {
            tmdb_id: tmdb_id,
            name: '',
            translations: {},
            createdAt: Date.now(),
            updatedAt: Date.now(),
            popularity: 0
        };
        info.forEach((e, index) => {
            res.translations[languages[index]] = e;
        });
        if (res.translations.en.name) {
            res.name = res.translations.en.name;
            res.popularity = res.translations.en.popularity;
        }

        return res;
    }

    public extractActorIdsFromProgram(program: any): number[] {
        let actorIdsMap = {};
        for (let channel of program) {
            for (let programItem of channel.program) {
                let cast = [];
                for (let lang in programItem.translations) {

                    let translation = programItem.translations[lang];
                    if (translation.actors) {
                        cast = cast.concat(translation.actors)
                    }
                    if (translation.directors) {
                        cast = cast.concat(translation.directors)
                    }
                }
                cast.forEach(e => actorIdsMap[e] ? false : actorIdsMap[e] = true)
            }
        }
        return Object.keys(actorIdsMap).map(e => parseInt(e));
    }
}
