mkdir -p dist
npm install
./node_modules/.bin/webpack --mode=production
rm -f mattermost-mp4file-plugin.tar.gz
rm -rf mattermost-mp4file-plugin
mkdir -p mattermost-mp4file-plugin
cp -r dist/main.js mattermost-mp4file-plugin/
cp plugin.json mattermost-mp4file-plugin/
tar -czvf mattermost-mp4file-plugin.tar.gz mattermost-mp4file-plugin