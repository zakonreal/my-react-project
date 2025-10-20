// server.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Пути к файлам
const POSTS_FILE = path.join(__dirname, './db/db.posts.json');
const COMMENTS_FILE = path.join(__dirname, './db/db.comments.json');
const PHOTOS_FILE = path.join(__dirname, './db/db.photos.json');
const USERS_FILE = path.join(__dirname, './db/db.users.json');

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Статика (если нужно отдавать фронт)
app.use(express.static(path.join(__dirname, 'my-blog/build')));

// Утилита: чтение JSON
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Ошибка чтения файла:', err);
        throw new Error('Ошибка сервера');
    }
}

// Утилита: запись JSON
async function writeJSON(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Ошибка записи файла:', err);
        throw new Error('Ошибка сервера');
    }
}

// Middleware аутентификации
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Нет токена, доступ запрещен' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Неверный или истёкший токен' });
    }
};

// Middleware проверки администратора
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Требуются права администратора' });
    }
};

// Пагинация
function paginate(data, page, limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const result = {};
    if (endIndex < data.length) {
        result.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
        result.previous = { page: page - 1, limit };
    }
    result.data = data.slice(startIndex, endIndex);
    return result;
}

// === АУТЕНТИФИКАЦИЯ ===

// Регистрация
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, isAdmin = false } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username и password обязательны' });
        }

        const { users } = await readJSON(USERS_FILE);

        // Проверяем, существует ли пользователь
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем пользователя
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username,
            password: hashedPassword,
            isAdmin
        };

        users.push(newUser);
        await writeJSON(USERS_FILE, { users });

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username, isAdmin: newUser.isAdmin },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Устанавливаем токен в cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 часа
            sameSite: 'strict'
        });

        res.status(201).json({
            message: 'Пользователь создан успешно',
            user: { id: newUser.id, username: newUser.username, isAdmin: newUser.isAdmin }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username и password обязательны' });
        }

        const { users } = await readJSON(USERS_FILE);

        // Ищем пользователя
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(400).json({ error: 'Неверные учетные данные' });
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Неверные учетные данные' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user.id, username: user.username, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Устанавливаем токен в cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 часа
            sameSite: 'strict'
        });

        res.json({
            message: 'Вход выполнен успешно',
            user: { id: user.id, username: user.username, isAdmin: user.isAdmin }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Выход
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Выход выполнен успешно' });
});

// Проверка аутентификации
app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

// === POSTS ===

app.get('/api/posts', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const { posts } = await readJSON(POSTS_FILE);
        const paginated = paginate(posts, pageNum, limitNum);

        res.json(paginated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/posts/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { posts } = await readJSON(POSTS_FILE);
        const post = posts.find(p => p.id === id);
        if (!post) return res.status(404).json({ error: 'Пост не найден' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
    const { title, body, url, rate } = req.body;

    // Валидация
    if (!title || !body || !url || rate === undefined) {
        return res.status(400).json({ error: 'Поля title, body, url и rate обязательны.' });
    }
    if (typeof title !== 'string' || title.length < 1 || title.length > 50) {
        return res.status(400).json({ error: 'Поле title — строка от 1 до 50 символов.' });
    }
    if (typeof body !== 'string' || body.length < 1 || body.length > 1000) {
        return res.status(400).json({ error: 'Поле body — строка от 1 до 1000 символов.' });
    }
    if (typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ error: 'URL должен начинаться с http.' });
    }
    if (!Number.isInteger(rate) || rate < 1 || rate > 10) {
        return res.status(400).json({ error: 'Rate — целое число от 1 до 10.' });
    }

    try {
        const { posts } = await readJSON(POSTS_FILE);
        const newPost = {
            id: posts.length ? Math.max(...posts.map(p => p.id)) + 1 : 1,
            title,
            body,
            url,
            rate,
            userId: req.user.userId // Добавляем ID пользователя
        };
        posts.push(newPost);
        await writeJSON(POSTS_FILE, { posts });
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/posts/:id', authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, body, url, rate } = req.body;

    try {
        const { posts } = await readJSON(POSTS_FILE);
        const index = posts.findIndex(p => p.id === id);
        if (index === -1) return res.status(404).json({ error: 'Пост не найден' });

        // Проверяем, что пользователь является автором поста или администратором
        if (posts[index].userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Недостаточно прав для редактирования' });
        }

        posts[index] = { ...posts[index], title, body, url, rate };
        await writeJSON(POSTS_FILE, { posts });
        res.json(posts[index]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { posts } = await readJSON(POSTS_FILE);
        const post = posts.find(p => p.id === id);

        if (!post) return res.status(404).json({ error: 'Пост не найден' });

        // Проверяем, что пользователь является автором поста или администратором
        if (post.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Недостаточно прав для удаления' });
        }

        const updated = posts.filter(p => p.id !== id);
        await writeJSON(POSTS_FILE, { posts: updated });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === SEARCH ===

app.get('/api/posts-search', async (req, res) => {
    const { term, page = 1, limit = 10 } = req.query;
    if (!term) return res.status(400).json({ error: 'Параметр term обязателен' });

    try {
        const { posts } = await readJSON(POSTS_FILE);
        const filtered = posts.filter(p =>
            p.title.toLowerCase().includes(term.toLowerCase()) ||
            p.body.toLowerCase().includes(term.toLowerCase())
        );
        const paginated = paginate(filtered, parseInt(page), parseInt(limit));
        res.json(paginated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === COMMENTS ===

app.get('/api/posts/:postId/comments', async (req, res) => {
    const postId = parseInt(req.params.postId);
    try {
        const { comments } = await readJSON(COMMENTS_FILE);
        res.json(comments.filter(c => c.postId === postId));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts/:postId/comments', authMiddleware, async (req, res) => {
    const { title, rate, body } = req.body;
    const postId = parseInt(req.params.postId);

    if (!Number.isInteger(rate) || rate < 1 || rate > 10) {
        return res.status(400).json({ error: 'Rate — целое число от 1 до 10.' });
    }
    if (typeof title !== 'string' || title.length > 30) {
        return res.status(400).json({ error: 'Title — не более 30 символов.' });
    }
    if (typeof body !== 'string' || body.length > 500) {
        return res.status(400).json({ error: 'Body — не более 500 символов.' });
    }

    try {
        const { comments } = await readJSON(COMMENTS_FILE);
        const newComment = {
            id: Date.now(),
            postId,
            title,
            rate,
            body,
            userId: req.user.userId // Добавляем ID пользователя
        };
        comments.push(newComment);
        await writeJSON(COMMENTS_FILE, { comments });
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === PHOTOS ===

app.get('/api/photos', async (req, res) => {
    try {
        const { photos } = await readJSON(PHOTOS_FILE);
        res.json(photos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/photos', authMiddleware, async (req, res) => {
    const { title, url, albumId } = req.body;
    if (!title || !url || !albumId) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (!url.startsWith('http')) {
        return res.status(400).json({ error: 'URL должен начинаться с http' });
    }

    try {
        const { photos } = await readJSON(PHOTOS_FILE);
        const newId = photos.length ? Math.max(...photos.map(p => p.id)) + 1 : 1;
        const photo = { id: newId, title, url, albumId, userId: req.user.userId };
        photos.push(photo);
        await writeJSON(PHOTOS_FILE, { photos });
        res.status(201).json(photo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/photos/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const { photos } = await readJSON(PHOTOS_FILE);
        const photo = photos.find(p => p.id === id);

        if (!photo) return res.status(404).json({ error: 'Фото не найдено' });

        // Проверяем, что пользователь является автором фото или администратором
        if (photo.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Недостаточно прав для удаления' });
        }

        const updated = photos.filter(p => p.id !== id);
        await writeJSON(PHOTOS_FILE, { photos: updated });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});