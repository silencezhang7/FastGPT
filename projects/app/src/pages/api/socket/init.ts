import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';
import { Socket } from 'net';
import { SocketLiving } from '@/global/core/system/socket';
import { addLog } from '@fastgpt/service/common/system/log';
import { ChatSiteItemType } from '@fastgpt/global/core/chat/type';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

declare global {
  var registerSocket: Map<string, SocketLiving>;
}
global.registerSocket = new Map<string, SocketLiving>();

const initSocket = (io: ServerIO) => {
  io.on('connection', (socket) => {
    if (socket.connected) {
      const { chatId } = socket.handshake.query as {
        chatId: string;
      };
      global.registerSocket.set(chatId, {
        chatId,
        socket,
        socketId: socket.id
      });
      socket.on('reconnecting', () => {
        global.registerSocket.set(chatId, {
          chatId,
          socket,
          socketId: socket.id
        });
        addLog.info('客户端socket正在重连', { size: global.registerSocket.size });
      });
      socket.on('reconnect', () => {
        global.registerSocket.set(chatId, {
          chatId,
          socket,
          socketId: socket.id
        });
        addLog.info('客户端socket重连成功', { size: global.registerSocket.size });
      });
      addLog.info('客户端socket注册成功', { size: global.registerSocket.size });
      socket.on('error', (err) => {
        socket.disconnect();
        global.registerSocket.delete(chatId);
        addLog.error('客户端socket错误', err);
      });
      socket.on('disconnect', () => {
        global.registerSocket.delete(chatId);
        addLog.info('客户端socket断开连接', { size: global.registerSocket.size });
        socket.disconnect();
      });
    }
  });
};

export const sendMsg = (chadId: string, msg: ChatSiteItemType) => {
  addLog.info('服务端发送消息', { size: global.registerSocket.size });
  if (global.registerSocket.has(chadId)) {
    global.registerSocket.get(chadId)?.socket.send(msg);
  } else {
    addLog.error('服务端发送消息失败', { size: global.registerSocket.size });
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    res.socket.server.io = new ServerIO(httpServer, {
      path: '/api/socket/init'
    });
    initSocket(res.socket.server.io);
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false
  }
};
