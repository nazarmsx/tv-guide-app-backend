import ViasatFetcher from './Viasat'
import {TvGidFetcher} from './TvGidFetcher'
import * as moment from 'moment';

export class MergingUaFetcher {
    private viasat: ViasatFetcher;
    private tvgid: TvGidFetcher;

    constructor() {
        this.viasat = new ViasatFetcher();
        this.tvgid = new TvGidFetcher();
    }

    public getRegion(): string {
        return 'ua';
    }

    public async getFullProgram(date: string): Promise<any> {
        let viasatProgram = await this.viasat.getFullProgram(date);
        let tvGidProgram = await this.tvgid.getFullProgram(date);
        viasatProgram = viasatProgram.filter((channel) => {
            return channel.program && channel.program.length > 3;
        });
        const stopList = ['Квартал TV', 'Оце', 'TV1000 World Kino', 'Культура (Россия К)', 'Спас', 'Рыжий', 'NewsOne', 'ОНТ', 'Eurosport 1 (Россия)', 'Eurosport 2 (Россия)', '112 Украина', 'Nickelodeon СНГ', 'Discovery Channel Europe', 'OBOZ TV', 'ID Investigation Discovery (Европа)', 'Телеканал новостей "24"', 'ТНТ Music', 'Футбол (Россия)', 'СТС'];
        tvGidProgram = tvGidProgram.filter((channel: { title: string }) => {
            let notFetched = true;
            viasatProgram.forEach((viasatChannel: { title: string }) => {
                if (channel.title.trim().replace(/ /g, '').toLowerCase() ===
                    viasatChannel.title.trim().replace(/ /g, '').toLowerCase() || stopList.indexOf(channel.title) !== -1) {
                    notFetched = false;
                }
            });
            return notFetched;
        });
        await this.viasat.loadDescriptions(viasatProgram);
        await this.tvgid.loadDescriptions(tvGidProgram);
        return viasatProgram.concat(tvGidProgram);
    }

    async loadDescriptions(program) {
        return Promise.resolve()
    }

}

async function test() {
    let fetcher = new MergingUaFetcher();
    let program = await
        fetcher.getFullProgram(moment(new Date()).format('YYYY-MM-DD'));
    const fs = require('fs');
    fs.writeFileSync('channels.json', JSON.stringify(program, null, 4));
    process.exit();
}
