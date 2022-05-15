const semver = require('semver')
const colors = require('colors')
const rootCheck = require('root-check')
const pathExists = require('path-exists').sync
const userHome = require('user-home')
const minimist = require('minimist')
const log = require('@tool-cli/log')
const pkg = require('../package.json')
const { LOWEST_NODE_VERSION } = require('./const')

class Cli {
  runCli() {
    try {
      this.checkPkgVersion()
      this.checkNodeVersion()
      this.checkRoot()
      this.checkUserHome()
      this.checkInputArgs()
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

  checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
      throw new Error(colors.red('用户主目录不存在！'))
    }
  }

  checkInputArgs() {
    const args = minimist(process.argv.slice(2))
    this.checkArgs(args)
  }

  checkArgs(args) {
    // args -> { _: [], debug: true }
    /**
     * 坑：虽然设置了log级别，但是也是不会让verbose生效的
     * 原因：因为log的初始化早于这个log级别设置操作，log的初始化是在require('@tool-cli/log)的时候，实际上是在require("npmlog")
     * 方式1:是让这个操作放在初始化之前。其实就是让环境变量在log初始化之前就完成
     * 方式2:再加上一句log.level=process.env.LOG_LEVEL,重新手动设置一次log的level
     */
    if (args.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }

    log.level = process.env.LOG_LEVEL
    log.verbose('debug', 'test debug')
  }
}

const cli = new Cli()

module.exports = cli.runCli.bind(cli)
