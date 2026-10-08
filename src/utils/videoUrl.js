// Turns an admin-entered "Video URL" into something the storefront can play.
// Shared by the Admin Reel form (validation + automatic YouTube thumbnail) and
// the public Reel viewer (embed), so both always agree on what is supported.
//
// Supported:
//   - YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
//     (also /embed/ID and /live/ID). Played through YouTube's own embed
//     player - the video is never downloaded or stored by us.
//   - A direct video file link (.mp4 / .webm / .ogg), played in a plain
//     <video> element.
// Anything else is not supported and returns null.

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

/**
 * @param {string|null|undefined} raw
 * @returns {{type:'youtube', id:string, embedUrl:string, thumbnailUrl:string}
 *   | {type:'file', url:string} | null}
 */
export function parseVideoUrl(raw) {
  const text = (raw ?? '').trim()
  if (!text) return null

  let url
  try {
    url = new URL(text)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '')
  let id = null

  if (host === 'youtu.be') {
    id = url.pathname.slice(1).split('/')[0]
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') {
      id = url.searchParams.get('v')
    } else {
      const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)
      if (match) id = match[1]
    }
    if (id === null) return null
  }

  if (id !== null) {
    if (!YOUTUBE_ID.test(id)) return null
    return {
      type: 'youtube',
      id,
      // autoplay: the viewer opens from a click. controls=0 + loop keep it
      // reel-like (the tagged-product cards sit over the control bar);
      // tapping the video still pauses/plays.
      embedUrl:
        `https://www.youtube-nocookie.com/embed/${id}` +
        `?autoplay=1&controls=0&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    }
  }

  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { type: 'file', url: url.href }
  return null
}
