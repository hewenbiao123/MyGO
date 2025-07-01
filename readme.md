# MyGO聊天系统



## 版本1

MyGOO文件夹下项目为前端展示项目（后端部分尚未完善）

### 使用方法：

直接打开项目chat-website目录下的login.html即可体验完整操作。



## 版本2

版本2参考开源项目：[HasChat](https://howcode.online/haschat/main)

### 环境准备：

```markdown
Node.Js >= 14.0.0
Mysql >= 5.7.0 
vue 3.5.11   //若版本不对，通过npm install vue@3.5.11修改
```

### 使用方法

#### 1.  克隆项目

```markdown
git clone https://gitee.com/howcode/has-chat.git  //web端
git clone -b main https://gitee.com/howcode/has-chat-service.git  //服务端
```

#### 2. 数据库加载

首先在本地创建数据库，名为hashchat_service

找到项目has-chat-service中store下的mysql8下的所有SQL文件，导入sql文件到数据库中

随后在项目has-chat-service下的config.js下修改数据库信息：

![{2EAB3F88-6B61-4C54-B7A0-AF4CA38765DD}](C:\Users\24127\AppData\Local\Packages\MicrosoftWindows.Client.CBS_cw5n1h2txyewy\TempState\ScreenClip\{2EAB3F88-6B61-4C54-B7A0-AF4CA38765DD}.png)

#### 3. 加载依赖

分别在两个项目下输入：

```markdown
npm install
```

#### 4.启动项目

启动服务端，在has-chat-service项目下输入命令 

```markdown
node app.js
```

启动web端，在has-chat项目下输入命令

```markdown
npm serve
```

根据地址打开网页即可



