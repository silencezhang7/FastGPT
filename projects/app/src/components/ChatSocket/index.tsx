import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { ChatSiteItemType } from '@fastgpt/global/core/chat/type';
import { useContextSelector } from 'use-context-selector';
import { ChatBoxContext } from '@/components/core/chat/ChatContainer/ChatBox/Provider';
import {ChatRecordContext} from "@/web/core/chat/context/chatRecordContext";

const ChatSocket = () => {
  const { isChatting, chatId} = useContextSelector(ChatBoxContext, (v) => v);
  const setChatRecords = useContextSelector(ChatRecordContext, (v) => v.setChatRecords);
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
  }, [chatId, setChatRecords]);
  useEffect(() => {
    while (!isChatting && messages.length > 0) {
      const msg = messages.pop();
      if (msg) {
        setChatRecords((state) => {
          return [...state, msg];
        });
      }
    }
  }, [messages, isChatting, setChatRecords]);
  console.log('服务端发送的消息集合', messages);
  return <></>;
};

export default React.memo(ChatSocket);
