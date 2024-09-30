import * as api from '../../models/api'
import * as moment from 'moment'
import ViasatFetcher from '../Viasat'

async function fetchAll() {
    let fetcher = new ViasatFetcher();
    try {
        let program = await fetcher.getFullProgram(moment(new Date()).format('YYYY-MM-DD'));
        await fetcher.loadDescriptions(program);
        let date = moment(new Date()).format('YYYY-MM-DD');
        let inDbProgram = await api.Program.findOne({date: date});
        if (inDbProgram) {
            api.Program.updateOne(
                {'_id': inDbProgram._id,},
                {
                    '$set': {
                        program: program,
                        'updated': new Date()
                    }
                },
                function (err, doc) {
                }
            )
        } else {
            let createdData = {
                created: new Date(),
                updated: new Date(),
                date,
                program: program
            };
            api.Program.collection['insert'](createdData).then(createdQuestion => {
                process.exit()

            })
        }

    } catch (er) {
        console.error(er)
    }
}
