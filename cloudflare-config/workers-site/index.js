import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

/**
 * Cloudflare Pages优化配置
 */
addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  const url = new URL(event.request.url)
  let options = {}

  /**
   * 为了提高性能，我们禁用缓存在开发环境中，
   * 但在生产环境中启用缓存
   */
  if (DEBUG) {
    options.cacheControl = {
      bypassCache: true,
    }
  } else {
    options.cacheControl = {
      browserTTL: 60 * 60 * 24, // 24小时
      edgeTTL: 60 * 60 * 24 * 7, // 7天
      bypassCache: false,
    }
  }

  try {
    // 首先尝试从KV存储中获取资产
    const page = await getAssetFromKV(event, options)

    // 允许设置自定义缓存控制和其他响应头
    const response = new Response(page.body, page)

    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // 对于HTML页面，我们添加安全头部
    if (response.headers.get('content-type') && response.headers.get('content-type').includes('text/html')) {
      response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;")
    }

    return response
  } catch (e) {
    // 如果是404错误，尝试提供自定义404页面
    if (e.status === 404) {
      // 处理Next.js客户端路由的所有路径，返回index.html
      if (url.pathname.startsWith('/')) {
        try {
          // 返回主页，让客户端路由处理
          const notFoundResponse = await getAssetFromKV(event, {
            mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req),
          })
          
          return new Response(notFoundResponse.body, {
            ...notFoundResponse,
            status: 200, // 返回200而不是404，让客户端路由处理
          })
        } catch (e) {
          // 如果主页也不可用，返回默认404
        }
      }
    }

    return new Response(e.message || e.toString(), { status: e.status || 500 })
  }
} 