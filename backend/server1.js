// server.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Пути к файлам
const POSTS_FILE = path.join(import.meta.dirname, './db/db.posts.json');
const COMMENTS_FILE = path.join(import.meta.dirname, './db/db.comments.json');
const PHOTOS_FILE = path.join(import.meta.dirname, './db/db.photos.json');

// Middleware
app.use(cors());
app.use(express.json());

// Статика (если нужно отдавать фронт)
app.use(express.static(path.join(import.meta.dirname, 'my-blog/build')));

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

app.post('/api/posts', async (req, res) => {
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
    };
    posts.push(newPost);
    await writeJSON(POSTS_FILE, { posts });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, body, url, rate } = req.body;

  try {
    const { posts } = await readJSON(POSTS_FILE);
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Пост не найден' });

    posts[index] = { id, title, body, url, rate };
    await writeJSON(POSTS_FILE, { posts });
    res.json(posts[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { posts } = await readJSON(POSTS_FILE);
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

app.post('/api/posts/:postId/comments', async (req, res) => {
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
      id: Date.now(), // Проще, чем Math.random()
      postId,
      title,
      rate,
      body,
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

app.post('/api/photos', async (req, res) => {
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
    const photo = { id: newId, title, url, albumId };
    photos.push(photo);
    await writeJSON(PHOTOS_FILE, { photos });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/photos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { photos } = await readJSON(PHOTOS_FILE);
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