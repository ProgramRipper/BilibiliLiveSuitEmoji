interface EmoteResp {
  data: EmoteData
}

interface EmoteData {
  packages: Package[]
}

interface Package {
  id: number
  text: string
  url: string
  type: number
  emote: Emote[]
}

interface Emote {
  id: number
  text: string
  url: string
  meta: EmoteMeta
}

interface EmoteMeta {
  alias?: string
}

interface EmoticonResp {
  code: number
  message: string
  ttl: number
  data: EmoticonData
}

interface EmoticonData {
  fans_brand: number
  data: Datum[]
  purchase_url: null
}

interface Datum {
  emoticons: Emoticon[]
  pkg_id: number
  pkg_name: string
  pkg_type: number
  current_cover: string
  recently_used_emoticons: Emoticon[]
}

interface Emoticon {
  emoji: string
  url: string
  width: number
  height: number
  perm: number
  unlock_need_level: number
  bulge_display: number
  emoticon_unique: string
  emoticon_id: number
}

(() => {
  'use strict'

  let responseText: string | null = null
  const originOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string,
    async?: boolean,
    username?: string,
    password?: string
  ) {
    if (
      method === 'GET' &&
      new URL(
        url.match(/^https?:/) === null ? 'https:' + url : url
      ).pathname === '/xlive/web-ucenter/v2/emoticon/GetEmoticons'
    ) {
      const getter = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText')?.get

      Object.defineProperty(this, 'responseText', {
        get () {
          if (responseText === null) {
            const resp: EmoticonResp = JSON.parse(getter?.call(this))

            const request = new XMLHttpRequest()
            originOpen.call(request,
              'GET',
              'https://api.bilibili.com/x/emote/user/panel/web?business=reply',
              false
            )
            request.withCredentials = true
            request.send()
            const result: EmoteResp = JSON.parse(request.responseText)

            for (const packages of result.data.packages) {
              if (packages.type === 4) {
                continue
              }

              const datum: Datum = {
                emoticons: [],
                pkg_id: packages.id,
                pkg_name: packages.text,
                pkg_type: 2,
                current_cover: packages.url,
                recently_used_emoticons: []
              }

              for (const emote of packages.emote) {
                const emoticon: Emoticon = {
                  emoji: emote.meta.alias === undefined ? emote.text : emote.meta.alias,
                  url: emote.url,
                  width: 162,
                  height: 162,
                  perm: 1,
                  unlock_need_level: 0,
                  bulge_display: 1,
                  emoticon_unique: 'upower_' + emote.text,
                  emoticon_id: emote.id
                }
                datum.emoticons.push(emoticon)
              }

              resp.data.data.push(datum)
            }

            responseText = JSON.stringify(resp)
          }

          return responseText
        }
      })
    }

    originOpen.call(this, method, url, async === undefined ? false : async, username, password)
  }
})()
