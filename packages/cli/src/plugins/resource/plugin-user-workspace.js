/*
 * 
 * Detects and fully resolve requests to the user's workspace.  
 * This sets the default value for requests in Greenwood.
 *
 */
const fs = require('fs');
const path = require('path');
const { ResourceInterface } = require('../../lib/resource-interface');

class UserWorkspaceResource extends ResourceInterface {
  constructor(compilation, options) {
    super(compilation, options);
    this.extensions = ['*'];
  }

  getBareUrlPath(url) {
    // get rid of things like query string parameters
    return url.replace(/\?(.*)/, '');
  }

  async shouldResolve(url = '/') {
    const bareUrl = this.getBareUrlPath(url);

    return Promise.resolve(fs.existsSync(this.compilation.context.userWorkspace, bareUrl) || bareUrl === '/');
  }

  async resolve(url = '/') {
    return new Promise(async (resolve, reject) => {
      try {
        const workspaceUrl = path.join(this.compilation.context.userWorkspace, this.getBareUrlPath(url));
        
        resolve(workspaceUrl);
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = {
  type: 'resource',
  name: 'plugin-user-workspace',
  provider: (compilation, options) => new UserWorkspaceResource(compilation, options)
};