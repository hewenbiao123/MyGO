const fs = require('fs');
const path = require('path');

const basePath = path.join('C:', 'Users', '24127', 'Desktop', '软件工程项目', 'MyGOO', 'chat-website');

// 创建目录
const dirs = [
  'public/assets/css',
  'public/assets/js',
  'public/assets/images',
  'server/routes',
  'database'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(basePath, dir), { recursive: true });
});

// 创建空文件
const files = [
  'public/login.html',
  'public/register.html',
  'public/forgot-pwd.html',
  'public/chat.html',
  'public/index.html',
  'server/config.json',
  'server/server.js',
  'database/init.sql',
  'README.md'
];

files.forEach(file => {
  fs.writeFileSync(path.join(basePath, file), '');
});

console.log('目录结构创建完成！');