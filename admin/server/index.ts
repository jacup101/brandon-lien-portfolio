import { networkInterfaces } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { aboutRouter } from './about.ts';
import { fetchAsset } from './backend.ts';
import { router } from './routes.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.ADMIN_PORT) || 4787;
// Listens on all interfaces (not just localhost) so other devices on the
// LAN can reach it. Only do this on networks you trust — anyone who can
// reach this host on this port can use the tool. Set ADMIN_HOST=127.0.0.1
// to go back to localhost-only.
const HOST = process.env.ADMIN_HOST || '0.0.0.0';

function externalAddresses(): { name: string; address: string }[] {
  return Object.entries(networkInterfaces()).flatMap(([name, ifaces]) =>
    (ifaces ?? [])
      .filter((iface) => iface.family === 'IPv4' && !iface.internal)
      .map((iface) => ({ name, address: iface.address }))
  );
}

const app = express();
app.use(express.json());
app.use('/api/about', aboutRouter);
app.use('/api', router);
app.use('/site-assets', express.static(path.join(__dirname, '../../public')));

// Proxies an image out of site-assets-backend's R2 bucket for remote-mode
// collections — those store an R2 key (e.g. "brandon-site/<uuid>.jpg") in
// place of a local /assets/... path, and there's nothing under public/ to
// serve directly. Auth stays server-side here (Service Token), so the
// browser never needs Access credentials of its own.
app.get('/remote-image', async (req, res) => {
  const key = String(req.query.key ?? '');
  if (!key) {
    res.status(400).json({ error: 'key is required.' });
    return;
  }
  try {
    const upstream = await fetchAsset(key);
    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }
    res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

app.use(express.static(path.join(__dirname, '../public')));

app.listen(PORT, HOST, () => {
  console.log(`Post-sound admin tool listening on ${HOST}:${PORT}`);
  console.log(`  http://127.0.0.1:${PORT}  (this machine)`);
  for (const { name, address } of externalAddresses()) {
    const label = name.startsWith('tailscale') ? 'Tailscale' : `LAN, ${name}`;
    console.log(`  http://${address}:${PORT}  (${label})`);
  }
  if (HOST !== '127.0.0.1') {
    console.log('Reachable by any device that can reach this host on this port.');
  }
});
