interface EmoteResp {
    data: EmoteData;
}

interface EmoteData {
    packages: Package[];
}

interface Package {
    id: number;
    text: string;
    url: string;
    type: number;
    emote: Emote[];
}

interface Emote {
    id: number;
    text: string;
    url: string;
    meta: EmoteMeta;
}

interface EmoteMeta {
    alias?: string;
}


interface EmoticonResp {
    code: number;
    message: string;
    ttl: number;
    data: EmoticonData;
}

interface EmoticonData {
    fans_brand: number;
    data: Datum[];
    purchase_url: null;
}

interface Datum {
    emoticons: Emoticon[];
    pkg_id: number;
    pkg_name: string;
    pkg_type: number;
    pkg_descript: string;
    pkg_perm: number;
    unlock_identity: number;
    unlock_need_gift: number;
    current_cover: string;
    recently_used_emoticons: Emoticon[];
    top_show: TopShow;
    top_show_recent: TopShow;
}

interface Emoticon {
    emoji: string;
    descript: string;
    url: string;
    is_dynamic: number;
    in_player_area: number;
    width: number;
    height: number;
    identity: number;
    unlock_need_gift: number;
    perm: number;
    unlock_need_level: number;
    emoticon_value_type: number;
    bulge_display: number;
    unlock_show_text: string;
    unlock_show_color: string;
    emoticon_unique: string;
    unlock_show_image: string;
    emoticon_id: number;
}

interface TopShow {
    top_left: Top;
    top_right: Top;
}

interface Top {
    image: string;
    text: string;
}


(() => {
    'use strict';

    let responseText: string = null!;
    const originOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string) {
        if (
            method === "GET"
            && new URL(
                url.match(/^https?:/) ? url : "https:" + url
            ).pathname === "/xlive/web-ucenter/v2/emoticon/GetEmoticons"
        ) {
            const getter = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "responseText")?.get;

            Object.defineProperty(this, "responseText", {
                get() {
                    if (!responseText) {
                        let resp: EmoticonResp = JSON.parse(getter?.call(this));

                        let request = new XMLHttpRequest();
                        originOpen.call(request,
                            "GET",
                            "https://api.bilibili.com/x/emote/user/panel/web?business=reply",
                            false,
                        );
                        request.withCredentials = true;
                        request.send();
                        let result: EmoteResp = JSON.parse(request.responseText);

                        for (let packages of result.data.packages) {
                            if (packages.type === 4) {
                                continue;
                            }

                            let datum: Datum = {
                                emoticons: [],
                                pkg_id: packages.id,
                                pkg_name: packages.text,
                                pkg_type: 2,
                                current_cover: packages.url,
                                recently_used_emoticons: [],
                            } as unknown as Datum;

                            for (let emote of packages.emote) {
                                datum.emoticons.push({
                                    emoji: emote.meta.alias || emote.text,
                                    url: emote.url,
                                    width: 162,
                                    height: 162,
                                    perm: 1,
                                    unlock_need_level: 0,
                                    bulge_display: 1,
                                    emoticon_unique: "upower_" + emote.text,
                                    emoticon_id: emote.id,
                                } as Emoticon);
                            }

                            resp.data.data.push(datum);
                        }

                        responseText = JSON.stringify(resp);
                    }

                    return responseText;
                },
            })
        }

        return originOpen.apply(this, arguments);
    };
})();