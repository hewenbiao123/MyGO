const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('./config.json');
const authRouter = require('./routes/auth');

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRouter);

// 数据库连接池
const pool = mysql.createPool(config.dbConfig);

// JWT验证中间件
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: '未授权访问' });

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) return res.status(403).json({ error: '无效令牌' });
    req.userId = decoded.id;
    next();
  });
};

// 用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );
    
    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: '用户名或邮箱已存在' });
    } else {
      res.status(500).json({ error: '服务器错误' });
    }
  }
});


// 用户登录
app.post('/api/login', async (req, res) => {
    console.log('收到登录请求:', req.body); // 打印请求体
    try {
        const { username, password } = req.body;
        console.log('用户名:', username);
        
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        console.log('查询结果:', rows);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }
        
        // 2. 验证密码
        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }
        
        // 3. 生成JWT令牌
        const token = jwt.sign(
            { id: user.id, username: user.username },
            config.jwtSecret,
            { expiresIn: '24h' }
        );
        
        // 4. 返回成功响应
        res.json({ 
            token, 
            userId: user.id,
            username: user.username
        });
        
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 忘记密码
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: '邮箱未注册' });
    }
    
    // 这里应该发送密码重置邮件，简化版直接返回成功
    res.json({ message: '密码重置链接已发送到您的邮箱' });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取聊天消息
app.get('/api/messages', authenticate, async (req, res) => {
  try {
    const [messages] = await pool.execute(
      'SELECT * FROM messages WHERE sender_id = ? ORDER BY timestamp DESC LIMIT 50',
      [req.userId]
    );
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 启动HTTP服务器
const server = app.listen(config.serverPort, () => {
  console.log(`服务器运行在端口 ${config.serverPort}`);
});

// WebSocket服务器
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'message') {
        const [result] = await pool.execute(
          'INSERT INTO messages (sender_id, content) VALUES (?, ?)',
          [data.userId, data.content]
        );
        
        // 广播消息给所有客户端
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'message',
              id: result.insertId,
              senderId: data.userId,
              content: data.content,
              timestamp: new Date()
            }));
          }
        });
      }
    } catch (error) {
      console.error('WebSocket错误:', error);
    }
  });
});


