import * as api from '../models/api'

class Channel {
    _id: string;
    title: string;
    img: string;
    type: string;
    type_name: string;
    region: string;

    constructor(channel: any) {
        this._id = channel._id;
        this.title = channel.title;
        this.img = channel.img;
        this.type = channel.type;
        this.type_name = channel.type_name;
        this.region = channel.region;
    }
}

export default class ChannelService {
    updateChannels(channels) {
        channels.forEach(channel => {
            api.Channel.findOne({title: {$in: [channel.title]}}).then(inDbChannel => {
                if (inDbChannel === null) {
                    api.Channel.create(channel);
                }
            });
        });
    }

    async getChannels(): Promise<Channel[]> {
        let channels: Channel[] = (await api.Channel.find({})).map(e => {
            return new Channel(e);
        });
        return channels;
    }

    async getChannelsV2(options: { region: string }): Promise<Channel[]> {
        return (await api.Channel.find(options)).map(e => {
            return new Channel(e);
        })
    }

    async syncChannels(program: any, region: string) {
        let inDbChannels = await this.getChannelsV2({region});
        let inDbChannelsMap = inDbChannels.reduce((pr, e: Channel) => {
            pr[e.title.toLowerCase().trim()] = true;
            return pr;
        }, {});
        for (let channel of program) {
            if (channel.title && !inDbChannelsMap[channel.title.toLowerCase().trim()]) {
                api.Channel.create({
                    title: channel.title,
                    img: channel.img,
                    type: channel.type,
                    type_name: channel.type_name,
                    region: region,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    }
}
