class Package {
  constructor({ targetPath, storePath, packageName, packageVersion }) {
    this.targetPath = targetPath // pkg路径
    this.storePath = storePath // pkg存储路径
    this.packageName = packageName // pkg名字
    this.packageVersion = packageVersion // pkg版本
  }

  // 判断当前pkg是否存在
  exists() {}

  // 安装pkg
  install() {}

  // 更新pkg
  update() {}

  // 获取入口文件路径
  getRootFilePath() {}
}

module.exports = Package
