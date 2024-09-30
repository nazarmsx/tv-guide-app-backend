import IMDBFetcher from '../IMDB'

async function test() {
    let fetcher = new IMDBFetcher();
    for (var i = 0; i < 50; ++i) {
        let desc = await fetcher.getMovieInfo('tt0381849');
        console.log(i, desc)

    }
}

test().catch(er => {
    console.error(er)
});

process.on('unhandledRejection', err => {
    console.log("Caught unhandledRejection");
    console.log(err);
});
