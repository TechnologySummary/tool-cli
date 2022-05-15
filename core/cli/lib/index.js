const pkg = require('../package.json')
const log = require('@tool-cli/log')

class Cli {
  runCli() {
    this.checkPkgVersion()
  }

  checkPkgVersion() {
    const version = pkg.version
    log.notice('当前tool-cli版本:', version)
  }
}

const cli = new Cli()

module.exports = cli.runCli.bind(cli)
