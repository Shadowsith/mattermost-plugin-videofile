package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

// VideoFilePlugin implements the interface expected by the Mattermost server to communicate
// between the server and plugin processes.
type VideoFilePlugin struct {
	plugin.MattermostPlugin
}

type PluginSettings struct {
	MaxHeight     int  `json:"maxHeight"`
	RenderTimeout int  `json:"renderTimeout"`
	Mp4           bool `json:"mp4"`
	Webm          bool `json:"webm"`
	Mov           bool `json:"mov"`
	Avi           bool `json:"avi"`
	Wmv           bool `json:"wmv"`
	Ogv           bool `json:"ogv"`
}

const (
	routeSettings = "/settings"
)

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *VideoFilePlugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	settings := p.getSettings(w)
	res := p.handleSettingsResult(settings)
	fmt.Fprint(w, res)
}

func (p *VideoFilePlugin) getSettings(w http.ResponseWriter) PluginSettings {
	pluginSettings, ok := p.API.GetConfig().PluginSettings.Plugins["videofile"]
	settings := PluginSettings{
		MaxHeight:     350,
		RenderTimeout: 20,
		Mp4:           true,
		Webm:          true,
		Mov:           true,
		Avi:           true,
		Wmv:           true,
		Ogv:           true,
	}
	if ok {
		for k, v := range pluginSettings {
			switch k {
			case "maxheight":
				settings.MaxHeight = p.getIntVal(v)
				break

			case "rendertimeout":
				settings.RenderTimeout = p.getIntVal(v)
				break

			case "mp4":
				settings.Mp4 = p.getBoolVal(v)
				break

			case "webm":
				settings.Webm = p.getBoolVal(v)
				break

			case "mov":
				settings.Mov = p.getBoolVal(v)
				break

			case "avi":
				settings.Avi = p.getBoolVal(v)
				break

			case "wmv":
				settings.Wmv = p.getBoolVal(v)
				break

			case "ogv":
				settings.Ogv = p.getBoolVal(v)
				break
			}
		}
	}
	return settings
}

func (p *VideoFilePlugin) getIntVal(v interface{}) int {
	val, ok := strconv.Atoi(fmt.Sprintf("%v", v))
	if ok != nil {
		val = 20
	}
	return val
}

func (p *VideoFilePlugin) getBoolVal(v interface{}) bool {
	val, ok := v.(bool)
	if !ok {
		val = true
	}
	return val
}

func (p *VideoFilePlugin) handleSettingsResult(settings PluginSettings) string {
	json, err := json.Marshal(&settings)
	if err != nil {
		return "{}"
	} else {
		return string(json)
	}
}

// This example demonstrates a plugin that handles HTTP requests which respond by greeting the
// world.
func main() {
	plugin.ClientMain(&VideoFilePlugin{})
}
