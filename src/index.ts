interface Package {
  id: number
  text: string
  url: string
  type: number
  emote: Emote[]
  ref_mid: number
}

interface Emote {
  id: number
  text: string
  url: string
  meta: Meta
  flags: Flags
}

interface Meta {
  alias?: string
}

interface Flags {
  unlocked: boolean
}

interface EmoticonResp {
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

  const packages: Package[] = []

  void (async () => {
    const roomid: number = parseInt(window.location.pathname.match(/\/(\d+)/)?.[1] ?? '0')

    const [uid, userPackages]: [number, Package[]] = await Promise.all([
      (
        await (
          await fetch(
            `https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${roomid}`,
            { credentials: 'include' }
          )
        ).json()
      ).data.uid,

      (
        await (
          await fetch(
            'https://api.bilibili.com/x/emote/user/panel/web?business=reply',
            { credentials: 'include' }
          )
        ).json()
      ).data.packages
    ])

    const roomPackages: Package[] = (await (
      await fetch(
        `https://api.bilibili.com/x/emote/creation/package/list?build=7160300&business=reply&mobi_app=android&up_mid=${uid}`,
        { credentials: 'include' }
      )
    ).json()).data.list.filter(
      (item: Package) => item.type === 11 && item.emote[0].flags.unlocked
    )

    if (roomPackages.length > 0) {
      packages.push(...roomPackages)
    }

    packages.push(...userPackages.filter((item: Package) => item.type !== 4 && item.ref_mid !== uid))
  }
  )()

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
    if (method === 'GET') {
      const { host, pathname } = new URL(url.startsWith('//') ? 'https:' + url : url)

      if (host === 'api.live.bilibili.com' && pathname === '/xlive/web-ucenter/v2/emoticon/GetEmoticons') {
        const getter = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText')?.get

        Object.defineProperty(this, 'responseText', {
          get () {
            if (responseText === null) {
              if (packages.length === 0) {
                return getter?.call(this)
              }

              const resp: EmoticonResp = JSON.parse(getter?.call(this))

              for (const pack of packages) {
                const datum: Datum = {
                  emoticons: [],
                  pkg_id: pack.id,
                  pkg_name: pack.text,
                  pkg_type: 2,
                  current_cover: pack.url,
                  recently_used_emoticons: []
                }

                for (const emote of pack.emote) {
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
        }
        )
      }
    }

    originOpen.call(this, method, url, async === undefined ? true : async, username, password)
  }
}
)()
