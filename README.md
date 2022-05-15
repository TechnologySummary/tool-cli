# Tool-Cli

## 模块功能

- 核心模块：core
- 命令模块：commands
- 模型模块：models
- 工具模块：utils

## 问题

1. 为什么全局安装`@vue/cli`（`npm install -g @vue/cli`）后添加到系统中的可执行命令时`vue`

   注册到系统中的可执行命令`vue`，这个名称的制定实际上是在package.json当中有一个`bin`属性，通过该属性`bin: { vue: 'vue.js '}`这样的方式指定系统可执行命令是`vue`的。

2. `npm install -g @vue/cli`全局安装`@vue/cli`发生了什么？
   - 将`@vue/cli`从npm下载下来，放置到全局的node下面的node_modules下
   - `@vue/cli`此时已经下载到了node_modules文件夹下了，接下来程序会去解析@vue/cli包的package.json当中的bin属性。
     - 如果解析发现bin属性存在指定的值`vue: vue.js`，那么接下来它会到node被安装的地方找到node主目录，到主目录里头找到bin目录，然后创建一个软链接，名字就是`vue`，即bin当中的vue属性。因为程序会根据bin属性指定的值`vue: vue.js`，所以程序会将软链接目标指向@vue/cli包目录下的bin文件夹下的`vue.js`。

3. 执行vue命令的时候，发生了什么？为什么vue命令指向的是一个js文件，我们却可以通过vue命令来执行它？
   我们通过`which vue`可以找到vue实际的执行文件路径，使用这个执行文件去执行，跟我们直接使用vue命令执行是完全等效的。执行vue命令实际上就是去环境变量当中寻找vue命令对应的可执行文件-就是`node/bin/vue`,即安装到node主目录bin文件下的vue。而这个可执行文件实际上指向的就是`@vue/cli/bin/vue.js`这个js文件。
   但是我们知道，直接在命令行执行js文件是不可行的，因为没有指定js解释器就没办法去解析js文件运行。如果我们想要执行，可以使用`node xxx.js`,这里node就是js的一个解释器。可是我们知道，在我们使用vue命令的时候，并没有通过node xx.js这种方式执行，为什么那么神奇呢？原因就在于`@vue/cli/bin/vue.js`这个文件的顶部写了一句话`#! /usr/bin/env node`，就是这句话让一切变得神奇。将这个加入到我们自己写的js文件，我们的js文件也可以不通过指定解释器直接执行起来。其实是在文件里头顺便把解释器指定好了。过程就是系统在直接运行js文件的时候，js文件会通过`#! /usr/bin/env node`告诉系统到环境变量当中找node这个命令，找到node命令之后通过node命令执行js文件。相当于在命令行使用`/usr/bin/env node index.js`，在`/usr/bin/env`整个环境变量当中寻找`node`环境变量，然后传入index.js执行。但是通过`./index.js`这种方式执行也不是很优雅，我们想要的结果是能够像vue一样直接通过输入`vue`的方式来执行这个index.js文件，要怎么做呢？

    因为通过命令行输入命令，这些命令会去$PATH指定的值所在的路径去寻找对应的命令文件，所以我们可以将想要执行的命令加入PATH环境变量，命令作为一个软链接指向'./index.js'，就可以实现我们想要的效果。（由于PATH环境变量所指定的值当中可以加入node的bin目录，在输入命令的时候，就会顺着尝试来这里寻找相关命令，然后可以在bin下边创建一个软链接，让它指向index.js）

    PATH 环境变量的作用是告诉你可执行文件可能是在哪些路径路径下，然后寻着这些路径去查找。which命令的作用是查找出指定的可执行命令文件所在的路径。
  
4. 本地调试项目
   项目要想本地调试，可以到项目主目录里头，通过`npm link`就可以把package的bin中的相关值注册到node的bin目录当中，这时候就可以使用命令了。
5. 本地调试某个包

- 方法1: 到该包目录下，执行npm link，就可以将包以软链接的形式注册到node_modules当中了。接下来就可以在其他包当中，直接以包名引用这个包了。
   但是为了之后上线发布使用，我们还需要手动在package.json当中添加该依赖包。比如

   ```json
   "dependences": {
     "lib": "^1.0.0"
   }
   ```

   当准备发布上线的时候，再次`npm unlink`解除链接即可。

- 方法2: 设置dependences的时候使用`"@tool-cli/lib": file: 相对路径`的方式，然后注册下node_modules包即可。
