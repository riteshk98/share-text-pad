import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { WebSocketServer } from 'ws';
import type WebSocket from 'ws';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import { setupWSConnection } from 'y-websocket/bin/utils';

const COLLAB_PREFIX = '/collaboration/';

const collaborationPlugin: FastifyPluginAsync = async (app) => {
  const wss = new WebSocketServer({ noServer: true });

  const onUpgrade = (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    const rawUrl = request.url ?? '';
    if (!rawUrl.startsWith(COLLAB_PREFIX)) {
      return;
    }

    const parsed = new URL(rawUrl, 'http://localhost');
    const roomName = decodeURIComponent(parsed.pathname.replace(COLLAB_PREFIX, '').trim());

    if (!roomName) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      setupWSConnection(ws, request, {
        docName: roomName,
      });
    });
  };

  app.server.on('upgrade', onUpgrade);

  app.addHook('onClose', (_instance, done) => {
    app.server.off('upgrade', onUpgrade);
    wss.close(() => done());
  });
};

export default fp(collaborationPlugin, {
  name: 'collaboration-plugin',
});
