import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

/**
 * 处理请求的异步函数
 * @param {Request} request
 * @param {Object} env
 * @param {Object} ctx
 * @returns {Promise<Response>}
 */
async function handleRequest(request, env, ctx) {
  try {
    // 从KV存储获取静态资产
    return await getAssetFromKV({
      request,
      waitUntil: ctx.waitUntil.bind(ctx),
    });
  } catch (e) {
    // 如果资产不存在，返回404
    if (e.status === 404) {
      return new Response('资源未找到', { status: 404 });
    }
    
    // 其他错误返回500
    return new Response('服务器内部错误', { status: 500 });
  }
}

export default {
  fetch: handleRequest,
}; 