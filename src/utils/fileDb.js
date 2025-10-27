import { promises as fs } from 'fs';

export async function readJSON(path, fallback = []) {
  try {
    const data = await fs.readFile(path, 'utf-8');
    return data.trim() ? JSON.parse(data) : fallback;
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(new URL('.', import.meta.url).pathname, { recursive: true }).catch(() => {});
      await fs.writeFile(path, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    throw err;
  }
}

export async function writeJSON(path, data) {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}
