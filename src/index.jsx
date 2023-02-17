import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';


class PostMessageAttachmentComponent extends React.Component {
    static plugin = null;

    constructor(props) {
        super(props);
        this.postId = props.postId;
        this.msg = null;
        this.fileType = null;
        this.fileUrl = null;
        this.customId = null;
        this.postMessageId = this.postId + '_message';
    }

    render() {
        setTimeout(() => {
            this.afterRender();
        }, 200);
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
            if (parent.children[1].id == customId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @returns string
     */
    getFileUrl() {
        const a = this.msg.getElementsByTagName('a')[1];
        return a.href.replace('?download=1', '');
    }

    /**
     * @returns HTMLDivElement
     */
    getHtmlVideoElement() {
        let maxHeight = 350;
        try {
            if (PostWillRenderEmbed.plugin.props.maxHeight != null) {
                maxHeight = PostWillRenderEmbed.plugin.props.maxHeight;
            }
        } catch {
        }
        const css = `
                    .mp4file-mh {
                        max-height: ${maxHeight}px;
                    }`;
        const node = document.createElement('div');
        node.setAttribute('id', this.customId);
        const html =
            <>
                <style>{css}</style>
                <video controls="true" class="mp4file-mh">
                    <source src={this.fileUrl} type="video/mp4" />
                </video>
            </>;
        node.innerHTML = renderToStaticMarkup(html);
        return node;
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
            if (this.fileType != 'mp4') {
                return;
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

class Mp4FilePlugin {
    initialize(registry, store) {
        const plugin = store.getState().plugins.plugins.mp4file;
        PostMessageAttachmentComponent.plugin = plugin;
        registry.registerPostMessageAttachmentComponent(
            PostMessageAttachmentComponent
        );
    }

    uninitialize() {
        // No clean up required.
    }
}

window.registerPlugin('mp4file', new Mp4FilePlugin());