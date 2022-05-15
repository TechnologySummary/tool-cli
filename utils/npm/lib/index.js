const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

class Npm {
  getNpmInfo(moduleName, registry = this.getDefaultRegistry()) {
    if (!moduleName) return null

    const npmInfoUrl = urlJoin(registry, moduleName)

    return axios
      .get(npmInfoUrl)
      .then((res) => {
        if (res.status !== 200) return null
        return res.data
      })
      .catch((err) => Promise.reject(err))
  }

  getDefaultRegistry(isOriginal = false) {
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
  }

  async getNpmSemverVersions(baseVersion, moduleName, registry) {
    const versions = await this.getNpmVersions(moduleName, registry)

    const semverVersions = this.getSemverVersions(baseVersion, versions).sort((a, b) =>
      b - a > 0 ? 1 : -1
    )

    return semverVersions[0]
  }

  async getNpmVersions(moduleName, registry) {
    const data = await this.getNpmInfo(moduleName, registry)

    if (!data) return []

    return Reflect.ownKeys(data.versions)
  }

  getSemverVersions(baseVersion, versions) {
    // ^：大于或等于
    // ^1.0.0 大于或等于1.0.0版本
    return versions.filter((version) => semver.satisfies(version, `^${baseVersion}`))
  }
}

const npm = new Npm()

module.exports = npm
