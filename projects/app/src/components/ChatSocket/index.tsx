import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { ChatSiteItemType } from '@fastgpt/global/core/chat/type';
import { useContextSelector } from 'use-context-selector';
import { ChatBoxContext } from '@/components/core/chat/ChatContainer/ChatBox/Provider';

const ChatSocket = () => {
  const { isChatting, chatId, setChatHistories } = useContextSelector(ChatBoxContext, (v) => v);
  const [messages, setMessages] = useState<ChatSiteItemType[]>([]);
  useEffect(() => {
    const socket = io({
      path: '/api/socket/init',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      query: {
        chatId
      }
    });
    socket.on('connect', () => {
      if (socket.connected) {
        console.log('客户端连接成功');
        socket.on('message', (data: ChatSiteItemType) => {
          setMessages((state) => {
            return [...state, data];
          });
        });
      }
    });
    return () => {
      console.log('组件开始销毁，客户端断开连接');
      socket.disconnect();
    };
  }, [chatId, setChatHistories]);
  useEffect(() => {
    while (!isChatting && messages.length > 0) {
      const msg = messages.pop();
      if (msg) {
        setChatHistories((state) => {
          return [...state, msg];
        });
      }
    }
  }, [messages, isChatting, setChatHistories]);
  console.log('服务端发送的消息集合', messages);
  return <></>;
};

export default React.memo(ChatSocket);
