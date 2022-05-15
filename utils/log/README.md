# Log

## 自定义新方法

`npmlog`是通过`log.addLevel`这个方法添加输出方法的，比如`npmlog.info('cli', 'test cli)`，能够这么使用的原因是因为有这么一段代码

```js
npmlog.addLevel('info', 2000,{ fg: 'green', bg: 'black'})
```

## Log Level

在npmlog源码当中，有一段代码`log.level='info'`，意思是只有大于等于info这个级别的log才被输出，小于这个级别的不会输出。这里log的级别是2000，所以小于2000的log都不会输出。