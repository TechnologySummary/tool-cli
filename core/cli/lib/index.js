const path = require('path')
const fs = require('fs')
const semver = require('semver')
const colors = require('colors')
const rootCheck = require('root-check')
const pathExists = require('path-exists').sync
const userHome = require('user-home')
const minimist = require('minimist')
const dotenv = require('dotenv')
const commander = require('commander')
const log = require('@tool-cli/log')
const npm = require('@tool-cli/npm')
const pkg = require('../package.json')
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('./const')

class Cli {
  constructor() {
    this.program = new commander.Command()
  }

  runCli() {
    try {
      this.checkPkgVersion()
      this.checkNodeVersion()
      this.checkRoot()
      this.checkUserHome()
      // this.checkInputArgs()
      this.checkEnv()
      this.checkGlobalUpdate()
      this.registerCommand()
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
  }

  checkEnv() {
    const dotenvPath = path.resolve(userHome, '.env')
    if (!pathExists(dotenvPath)) {
      this.createFile(dotenvPath)
    }
    /**
     * 通过dotenv配合我们自定义的.env，会将我们在.env中写的环境变量注入的process.env当中
     * 之后我们就可以使用process.env.环境变量进行一系列操作
     */
    dotenv.config({
      // 将环境变量的文件路径设置在用户主目录下 - /Users/jaylen/.env
      path: dotenvPath
    })
    this.createDefaultEnv()
    /**
     * 虽然我们想要在debug模式下能够输出verbose指定的内容
     * 但是对于process.env.CLI_HOME，假如脚手架的使用者没有在.env中指定这个CLI_HOME，那么输出就是undefined
     * 因此，我们需要给这个地方添加默认的环境变量，防止用户没配置这个环境变量就直接拿来使用
     */
    log.verbose('环境变量', process.env.CLI_HOME_PATH)
  }

  async checkGlobalUpdate() {
    const { name: pkgName, version: pkgVersion } = pkg
    const latestVersion = await npm.getNpmSemverVersions(pkgVersion, pkgName)

    if (latestVersion && semver.gt(latestVersion, pkgVersion)) {
      log.warn(
        colors.yellow(`请手动更新${pkgName}，当前版本：${pkgVersion}，最新版本：${latestVersion}
          更新命令：npm install -g ${pkgName}
      `)
      )
    }
  }

  createFile(filePath) {
    fs.writeFileSync(filePath, '', (err) => {
      if (err) {
        throw new Error(colors.red(`${filePath}创建失败！`))
      }
    })
  }

  createDefaultEnv() {
    const defaultEnvConfig = {
      home: userHome
    }

    if (process.env.CLI_HOME) {
      defaultEnvConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
      defaultEnvConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME)
    }

    process.env.CLI_HOME_PATH = defaultEnvConfig['cliHome']
  }

  registerCommand() {
    this.program
      .name(Reflect.ownKeys(pkg.bin)[0])
      .usage('<command> [options]')
      .version(pkg.version)
      .option('-d, --debug', '是否开启调试模式', false)

    this.program.on('option:debug', () => {
      if (this.program.debug) {
        process.env.LOG_LEVEL = 'verbose'
      } else {
        process.env.LOG_LEVEL = 'info'
      }
      log.level = process.env.LOG_LEVEL
    })

    this.program.on('command:*', (obj) => {
      const availableCommands = this.program.commands.map((cmd) => cmd.name())
      log.error(
        colors.red(`未知的命令：${obj[0]}，可用的命令：${availableCommands.join(',')}`)
      )
    })

    if (minimist(process.argv.slice(2))._.length === 0) {
      this.program.outputHelp()
      console.log()
    }

    this.program.parse(process.argv)
  }
}

const cli = new Cli()

module.exports = cli.runCli.bind(cli)
