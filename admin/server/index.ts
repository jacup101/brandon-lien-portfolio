import { networkInterfaces } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { aboutRouter } from './about.ts';
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
