import * as cheerio from 'cheerio';
import {getHTML} from './helpers'
import to from 'await-to-js'
import {logger as Logger} from '../services/logger';

export default class IMDBFetcher {
    async getMovieInfo(imdb_id: string) {

        return this.makeRequest(imdb_id);
    }

    async makeRequest(id: string): Promise<any> {
        let [err, html] = await to(getHTML({
            url: 'https://imdb.com/title/' + id + '/',
            cache: true,
            expireTime: Date.now() + 7 * 24 * 60 * 60 * 1000
        }));
        if (err) {
            Logger.error('IMDBFetcher.makeRequest Error');
            Logger.error(err);
            return {};
        }
        let body = html.replace(/(\r\n|\n|\r)/gm, '').replace(/ +(?= )/g, '');
        var $ = cheerio.load(body);
        var title = $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > h1').text().replace(/\(\d+\)/g, '').trim();
        var originalTitle = $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > div.originalTitle').text().replace(/\(\d+\)/g, '').trim();
        originalTitle = originalTitle.replace(/\(original title\)/g, '').trim();
        var year = $('#titleYear > a').text();
        var contentRating = $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > div > meta').attr('content');
        var runtime = $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > div > time').text().trim();
        var description = $('#title-overview-widget > div.plot_summary_wrapper > div.plot_summary > div.summary_text').text().trim();
        var rating = $('#title-overview-widget > div.vital > div.title_block > div > div.ratings_wrapper > div.imdbRating > div.ratingValue > strong > span').text();
        var poster = $('#title-overview-widget > div.vital > div.slate_wrapper > div.poster > a > img').attr('src');
        var director = $('#title-overview-widget > div.plot_summary_wrapper > div.plot_summary > div:nth-child(2) > span > a > span').text();
        var metascore = $('#title-overview-widget > div.plot_summary_wrapper > div.titleReviewBar > div:nth-child(1) > a > div > span').text();
        var writer = $('#title-overview-widget > div.plot_summary_wrapper > div.plot_summary > div:nth-child(3) > span:nth-child(2) > a > span').text();
        var languageArray = $('#titleDetails > div:nth-child(5) > a');
        var language = '';
        var cast = [];
        $('div#main_bottom > div#titleCast > table.cast_list  tr > td.itemprop > a > span').each(function () {
            cast.push($(this).text());
        });
        if (languageArray.length === 1) {
            language = $(languageArray[0]).text()
        } else {
            for (var i = 0; i < languageArray.length; i++) {
                if (i < languageArray.length - 1) {
                    language += $(languageArray[i]).text() + ', '
                } else {
                    language += $(languageArray[i]).text()
                }
            }
        }
        var genre: any;

        if ($('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > div').text().split('|')[2] != null) {
            genre = $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > div').text().split('|')[2].split(',')
        } else {
            genre = null // I need fix this! If you need this feature for unreleased movies, please create an issue and I'll make it my priority
        }

        if (description === '') {
            description = $('#title-overview-widget > div.minPosterWithPlotSummaryHeight > div.plot_summary_wrapper > div.plot_summary.minPlotHeightWithPoster > div.summary_text').text().trim()
        }

        if (poster === null) {
            poster = $('#title-overview-widget > div.minPosterWithPlotSummaryHeight > div.poster > a > img').attr('src')
        }

        if (director === '') {
            director = $('#title-overview-widget > div.minPosterWithPlotSummaryHeight > div.plot_summary_wrapper > div.plot_summary.minPlotHeightWithPoster > div:nth-child(2) > span > a > span').text()
        }

        if (writer === '') {
            writer = $('#title-overview-widget > div.minPosterWithPlotSummaryHeight > div.plot_summary_wrapper > div.plot_summary.minPlotHeightWithPoster > div:nth-child(3) > span:nth-child(2) > a > span').text()
        }

        return {
            title: title || 'N/A',
            originalTitle: originalTitle || 'N/A',
            year: year || 'N/A',
            contentRating: contentRating || 'N/A',
            runtime: runtime || 'N/A',
            description: description,
            rating: rating || 'N/A',
            poster: poster || 'N/A',
            genre: genre || ['N/A'],
            director: director || 'N/A',
            metascore: metascore || 'N/A',
            writer: writer || 'N/A',
            language: language || 'N/A',
            actors: cast
        };
    }
}

async function test() {
    let fetcher = new IMDBFetcher();
    for (var i = 0; i < 2; ++i) {
        let desc = await fetcher.getMovieInfo('tt0381849');
        Logger.log(i, desc)

    }
}
