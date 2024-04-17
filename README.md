# SpotDL-Shortcut
Wrapper for [Spotify Downloader](https://github.com/spotDL/spotify-downloader) for the purpose of providing an iOS shortcut to the share sheet.

## Usage

```bash
docker run -d --name=spotdl-shortcut \
-e AUTH_TOKEN=<auth token> \
-e MUSIC_DIR=/music \
-v <Local Music Dir>:/music \
-p 2095:2095 \
-e PLEX_TOKEN=<Plex Token> \
-e PLEX_LIBRARY=<Plex Music Library Name> \
-e PLEX_URL=<Plex Server URL> \
nikorag/spotdl-shortcut:main
```

## Shortcut

iOS shortcut available [here](https://www.icloud.com/shortcuts/ac2c25f941fd4615a9d4eb42efaf8b56)