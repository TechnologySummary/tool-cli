const semver = require('semver')
const colors = require('colors')
const rootCheck = require('root-check')
const log = require('@tool-cli/log')
const pkg = require('../package.json')
const { LOWEST_NODE_VERSION } = require('./const')

class Cli {
  runCli() {
    try {
      this.checkPkgVersion()
      this.checkNodeVersion()
      this.checkRoot()
    } catch (e) {
      log.error(e.message)
    }
  }

  checkPkgVersion() {
    const pkgVersion = pkg.version
    log.notice('当前tool-cli版本:', pkgVersion)
  }

  checkNodeVersion() {
    // 获取当前版本号
    const curNodeVersion = process.version
    // 对比当前版本号和脚手架允许的最低版本号
    if (!semver.gte(curNodeVersion, LOWEST_NODE_VERSION)) {
      throw new Error(colors.red('当前node版本号低于tool-cli支持的最低node版本号'))
    }
  }

  checkRoot() {
    rootCheck()
    // root check后，再次输出用户uid
    // 然后可以在命令行启动cli的时候使用sudo变换成root用户，发现确实降级成普通501用户而不是0root用户
    // console.log(process.getuid())
  }
}

const cli = new Cli()

module.exports = cli.runCli.bind(cli)
