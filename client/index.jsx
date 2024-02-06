import React from 'react';
import axios from 'axios';
import { renderToStaticMarkup } from 'react-dom/server';

class PluginSettings {
    constructor(data) {
        /**
         * @type {number}
         */
        this.maxHeight = data.maxHeight == null ? 350 : data.maxHeight;
        /**
         * @type {number}
         */
        this.renderTimeout = data.renderTimeout == null ? 20 : data.renderTimeout;
        /**
         * @type {boolean}
         */
        this.mp4 = data.mp4 == null ? true : data.mp4;
        /**
         * @type {boolean}
         */
        this.webm = data.webm == null ? true : data.webm;
        /**
         * @type {boolean}
         */
        this.mov = data.mov == null ? true : data.mov;
        /**
         * @type {boolean}
         */
        this.avi = data.avi == null ? true : data.avi;
        /**
         * @type {boolean}
         */
        this.wmv = data.wmv == null ? true : data.wmv;
        /**
         * @type {boolean}
         */
        this.ogv = data.ogv == null ? true : data.ogv;
        /**
         * @type {string[]}
         */
        this.supportedFileTypes = [
            'mp4',
            'webm',
            'mov',
            'avi',
            'wmv',
            'ogv'
        ];
    }
}


class PostMessageAttachmentComponent extends React.Component {
    static plugin;
    /**
     * @type {PluginSettings}
     */
    static settings;

    constructor(props) {
        super(props);
        this.postId = props.postId;
        this.msg = null;
        this.fileType = null;
        this.fileUrl = null;
        this.customId = null;
        this.postMessageId = this.postId + '_message';
        /**
         * @type {PluginSettings}
         */
        this.settings = PostMessageAttachmentComponent.settings;
    }

    render() {
        setTimeout(() => {
            this.afterRender();
        }, this.settings.renderTimeout);
        return (null);
    }

    /**
     * @returns {boolean}
     */
    isFilePostMessage() {
        if (this.msg.getElementsByClassName('post-image__details')[0] == null) {
            return false;
        }
        return true;
    }

    /**
     * @returns {string}
     */
    getFileType() {
        return this.msg.getElementsByClassName('post-image__type')[0]
            .innerHTML.toLowerCase().trim();
    }

    /**
     * @returns {boolean}
     */
    isRendered() {
        const parent = this.msg.parentElement;
        this.customId = this.postId + `_custom_${this.fileType}_video_container`;
        if (parent.children[1] != null) {
            if (parent.children[1].id == this.customId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @returns {string}
     */
    getFileUrl() {
        const a = this.msg.getElementsByTagName('a')[1];
        return a.href.replace('?download=1', '');
    }

    /**
     * @returns {HTMLDivElement}
     */
    getHtmlVideoElement() {
        let maxHeight = this.settings.maxHeight;
        try {
            if (PostMessageAttachmentComponent.plugin.props.maxHeight != null && maxHeight == null) {
                maxHeight = PostMessageAttachmentComponent.plugin.props.maxHeight;
            }
        } catch {
        }
        const css = `
                    .videofile-mh {
                        max-height: ${maxHeight}px;
                    }`;
        const node = document.createElement('div');
        node.setAttribute('id', this.customId);

        const fileType = this.getVideoUrlType(this.fileUrl);

        const html =
            <>
                <style>{css}</style>
                <video controls="true" class="videofile-mh">
                    <source src={this.fileUrl} type={fileType} />
                </video>
            </>;
        node.innerHTML = renderToStaticMarkup(html);
        return node;
    }

    /**
    * 
    * @param {string} url 
    * @returns {string}
    */
    getVideoUrlType(url) {
        try {
            const split = url.split('.');
            switch (split[split.length - 1]) {
                case 'webm':
                    return 'video/mp4';

                case 'mov':
                    return 'video/quicktime';

                case 'avi':
                    return 'video/x-msvideo';

                case 'wmv':
                    return 'video/x-ms-wmv';

                case 'ogv':
                    return 'video/ogv';

                case 'mp4':
                    return 'video/mp4';
            }
        } catch {
            return 'video/mp4';
        }
    }

    /**
     * @returns void
     */
    afterRender() {
        /**
         * @type HTMLDivElement
         */
        this.msg = document.getElementById(this.postMessageId);
        try {
            if (!this.isFilePostMessage()) {
                return;
            }
            this.fileType = this.getFileType();
            if (!this.settings.supportedFileTypes.includes(this.fileType)) {
                return;
            }
            for (const ft of this.settings.supportedFileTypes) {
                if (this.fileType == ft && !this.settings[ft]) {
                    return;
                }
            }
            if (this.isRendered()) {
                return;
            }
            this.fileUrl = this.getFileUrl();
            this.msg.parentElement.append(this.getHtmlVideoElement());
        } catch (err) {
            console.log('err', err);
        }
    }

}


class VideoFilePlugin {
    static apiUrl = '/plugins/videofile';

    initialize(registry, store) {
        const plugin = store.getState().plugins.plugins.videofile;
        PostMessageAttachmentComponent.plugin = plugin;
        axios.get(`${VideoFilePlugin.apiUrl}/settings`)
            .then(res => {
                /**
                 * @type {PluginSettings}
                 */
                const settings = new PluginSettings(res.data);
                PostMessageAttachmentComponent.settings = settings;
                registry.registerPostMessageAttachmentComponent(
                    PostMessageAttachmentComponent
                );
            })
            .catch(err => {
                /**
                 * @type {PluginSettings}
                 */
                const settings = new PluginSettings();
                PostMessageAttachmentComponent.settings = settings;
                registry.registerPostMessageAttachmentComponent(
                    PostMessageAttachmentComponent
                );
            });
    }

    uninitialize() {
        // No clean up required.
    }
}

window.registerPlugin('videofile', new VideoFilePlugin());