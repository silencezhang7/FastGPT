import { NextAPI } from '@/service/middleware/entry';
import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { saveChat } from '@fastgpt/service/core/chat/saveChat';
import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import {
  type ChatSiteItemType,
  type SystemChatItemType,
  SystemChatItemValueItemType
} from '@fastgpt/global/core/chat/type';
import { sendMsg } from '@/pages/api/socket/init';
import {
  ChatItemValueTypeEnum,
  ChatRoleEnum,
  ChatStatusEnum
} from '@fastgpt/global/core/chat/constants';
import { getNanoid } from '@fastgpt/global/common/string/tools';
import axios from 'axios';
import { addLog } from '@fastgpt/service/common/system/log';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    chatId,
    msg,
    shareId,
    save = 'true'
  } = req.query as {
    chatId: string;
    msg: string;
    shareId: string;
    save?: string;
  };
  if (!chatId) {
    return jsonRes(res, {
      code: 500,
      message: 'chatId is empty'
    });
  }
  if (!msg) {
    return jsonRes(res, {
      code: 500,
      message: 'msg is empty'
    });
  }
  if (!shareId) {
    return jsonRes(res, {
      code: 500,
      message: 'shareId is empty'
    });
  }
  const context: SystemChatItemValueItemType[] = [];
  if (msg.startsWith('http')) {
    const response = await axios.get(msg);
    if (String(response.headers['Content-Type']).includes('image')) {
      context.push({
        type: ChatItemValueTypeEnum.file,
        file: {
          type: 'image',
          url: msg
        }
      });
    } else {
      const disposition: string = response.headers['content-disposition'];
      let name = disposition.split('filename=')[1].split(';')[0].replace(/"/g, '');
      name = decodeURIComponent(name);
      addLog.info('上传的文明名：', { name });
      context.push({
        type: ChatItemValueTypeEnum.file,
        file: {
          type: 'file',
          url: msg,
          name: name
        }
      });
    }
  } else {
    context.push({
      type: ChatItemValueTypeEnum.text,
      text: {
        content: msg
      }
    });
  }
  const message: ChatSiteItemType = {
    dataId: getNanoid(24),
    status: ChatStatusEnum.finish,
    obj: ChatRoleEnum.System,
    value: context
  };
  sendMsg(chatId, message);
  if (save === 'true') {
    saveMessage({
      chatId,
      content: [
        {
          dataId: message.dataId,
          obj: message.obj,
          value: message.value
        }
      ],
      shareId
    }).then();
  }
  return jsonRes<any>(res, {
    code: 200,
    data: 'ok'
  });
}

const saveMessage = async ({
  chatId,
  content,
  shareId
}: {
  chatId: string;
  content: [SystemChatItemType & { dataId?: string }];
  shareId: string;
}) => {
  const chat = await MongoChat.findOne({ chatId, shareId });
  if (chat) {
    await saveChat({
      newTitle: '',
      chatId,
      shareId,
      appId: chat.appId,
      teamId: chat.teamId,
      tmbId: chat.tmbId,
      outLinkUid: chat.outLinkUid,
      nodes: [],
      variables: {},
      source: 'share',
      content: content,
      isUpdateUseTime: true
    });
  }
};

export default NextAPI(handler);
