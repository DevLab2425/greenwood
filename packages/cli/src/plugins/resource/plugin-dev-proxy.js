/*
 *
 * Manages routing devServer.proxy entries to their destination.
 *
 */
import { ResourceInterface } from '../../lib/resource-interface.js';

class DevProxyResource extends ResourceInterface {
  constructor(compilation, options) {
    super(compilation, options);
  }

  async shouldServe(url) {
    const proxies = this.compilation.config.devServer.proxy || {};
    const hasMatches = Object.entries(proxies).reduce((acc, entry) => {
      return acc || url.pathname.indexOf(entry[0]) >= 0;
    }, false);

    return url.protocol.startsWith('http:') && hasMatches;
  }

  async serve(url, request) {
    const { pathname } = url;
    const proxies = this.compilation.config.devServer.proxy;
    const proxyBaseUrl = Object.entries(proxies).reduce((acc, entry) => {
      return pathname.indexOf(entry[0]) >= 0
        ? `${entry[1]}${pathname}`
        : acc;
    }, pathname);
    const requestProxied = new Request(`${proxyBaseUrl}${url.search}`, {
      method: request.method,
      headers: request.header
    });
    const response = await fetch(requestProxied);
    const filteredResponseHeaders = new Headers();

    // filter out content-encoding to make sure browsers do not try and decode responses
    // https://github.com/ProjectEvergreen/greenwood/issues/1159
    response.headers.forEach((value, key) => {
      if (key !== 'content-encoding') {
        filteredResponseHeaders.set(key, value);
      }
    });

    return new Response(response.body, { headers: filteredResponseHeaders });
  }
}

const greenwoodPluginDevProxy = {
  type: 'resource',
  name: 'plugin-dev-proxy',
  provider: (compilation, options) => new DevProxyResource(compilation, options)
};

export { greenwoodPluginDevProxy };