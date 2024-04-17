import axios from 'axios';

const { PLEX_TOKEN, PLEX_LIBRARY } = process.env;
const PLEX_URL = process.env.PLEX_URL ?? 'http://127.0.0.1:32400';

export async function refreshPlex() {
    if (PLEX_TOKEN && PLEX_LIBRARY){
        let {data} = await axios.get(`${PLEX_URL}/library/sections?X-Plex-Token=${PLEX_TOKEN}`);

        let {Directory} = data.MediaContainer;
        let {key} = Directory.find(({title}) => title == PLEX_LIBRARY);

        if (key) {
            await axios.get(`${PLEX_URL}/library/sections/${key}/refresh?X-Plex-Token=${PLEX_TOKEN}`)
        }
    }
}