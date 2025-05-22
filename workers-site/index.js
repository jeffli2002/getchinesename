/**
 * Cloudflare Pages Worker脚本
 * 处理所有请求并返回构建的Next.js应用
 */

import { getAssetFromKV, NotFoundError } from '@cloudflare/kv-asset-handler';

/**
 * 自定义缓存键生成器
 * @param {Request} request
 * @returns {Request}
 */
function customKeyModifier(request) {
  // 从URL中提取有效部分
  let url = new URL(request.url);
  
  // 忽略查询参数
  url.search = '';
  
  // 创建基于URL的新请求
  let newRequest = new Request(url.toString(), request);
  
  return newRequest;
}

/**
 * 处理传入的请求
 * @param {Request} request 客户端请求
 * @param {Object} env 环境变量
 * @param {Object} ctx 执行上下文
 * @returns {Promise<Response>}
 */
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const options = {
    ASSET_NAMESPACE: env.__STATIC_CONTENT,
    ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
    cacheControl: {
      bypassCache: false,
      edgeTTL: 30 * 24 * 60 * 60, // 30天
      browserTTL: 24 * 60 * 60, // 1天
    },
    mapRequestToAsset: req => customKeyModifier(req),
  };

  try {
    // 处理API请求
    if (url.pathname.startsWith('/api/')) {
      // 对于API请求，可以在这里添加自定义逻辑
      // 例如，转发到另一个Worker或返回404
      return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    // 处理_next/data请求(静态生成数据)
    if (url.pathname.startsWith('/_next/data/')) {
      options.cacheControl.edgeTTL = 60 * 60; // 1小时
      options.cacheControl.browserTTL = 60 * 5; // 5分钟
    }

    // 处理静态资源
    if (url.pathname.startsWith('/_next/static/')) {
      options.cacheControl.edgeTTL = 60 * 60 * 24 * 365; // 1年
      options.cacheControl.browserTTL = 60 * 60 * 24 * 30; // 30天
    }

    // 获取静态资产
    const page = await getAssetFromKV(
      {
        request,
        waitUntil: ctx.waitUntil.bind(ctx),
      },
      options
    );

    // 根据路径自定义缓存控制
    const pathname = new URL(request.url).pathname;
    
    // 允许页面缓存5分钟，避免过度请求
    if (pathname === '/' || pathname.endsWith('.html')) {
      page.headers.set('Cache-Control', 'public, max-age=300');
    }
    
    return page;
  } catch (e) {
    // 如果是404错误，尝试返回自定义404页面
    if (e instanceof NotFoundError) {
      try {
        const notFoundResponse = await getAssetFromKV(
          {
            request: new Request(`${url.origin}/404.html`, request),
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          options
        );
        
        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 404,
        });
      } catch (e) {
        // 如果找不到自定义404页面，使用默认404
        return new Response('Not Found', { status: 404 });
      }
    }
    
    // 其他错误
    return new Response('Internal Error', { status: 500 });
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
}; 