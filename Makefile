all:
	make prepare
	make linux
	make macos
	make windows
	make webapp
	make pack

prepare:
	rm -f mattermost-videofile-plugin.tar.gz
	rm -rf mattermost-videofile-plugin
	mkdir -p mattermost-videofile-plugin
	mkdir -p mattermost-videofile-plugin/client
	mkdir -p mattermost-videofile-plugin/server

linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o mattermost-videofile-plugin/server/plugin-linux-amd64 server/plugin.go

macos:
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o mattermost-videofile-plugin/server/plugin-darwin-amd64 server/plugin.go

windows:
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o mattermost-videofile-plugin/server/plugin-windows-amd64 server/plugin.go

webapp:
	mkdir -p dist
	npm install
	./node_modules/.bin/webpack --mode=production

pack:
	cp -r dist/main.js mattermost-videofile-plugin/client
	cp plugin.json mattermost-videofile-plugin/
	tar -czvf mattermost-videofile-plugin.tar.gz mattermost-videofile-plugin
