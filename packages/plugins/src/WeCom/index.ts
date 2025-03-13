import Redis from 'ioredis';
import axios from 'axios';

const redis = new Redis('redis');

type Props = {
  corpid: string;
  corpsecret: string;
  touser: string;
  agentid: string;
  text_content: string;
};

type Response = Promise<{
  result: any; // 根据你的 SQL 查询结果类型调整
}>;

const getToken = async (corpid: string, corpsecret: string): Promise<string> => {
  const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`;
  const response = await axios.get(url);

  // 检查响应是否包含 access_token
  if (response.data && response.data.access_token) {
    return response.data.access_token;
  } else {
    return Promise.reject('Failed to retrieve access token');
  }
};

const sendMessage = async (
  accessToken: string,
  touser: string,
  agentid: string,
  text_content: string
): Promise<any> => {
  const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`;
  const body = {
    touser,
    msgtype: 'text',
    agentid,
    text: {
      content: text_content
    },
    safe: 0
  };

  const response = await axios.post(url, body);

  // 检查响应状态
  if (response.data) {
    return response.data;
  } else {
    return Promise.reject('Failed to send message');
  }
};

const main = async ({ corpid, corpsecret, touser, agentid, text_content }: Props): Response => {
  let result;
  try {
    // 1. 获取 token
    let accessToken = await redis.get('access_token');

    if (!accessToken) {
      accessToken = await getToken(corpid, corpsecret);
      // 2. 将 token 存入 Redis，设置过期时间为 2 小时
      if (accessToken) {
        await redis.set('access_token', accessToken, 'EX', 7200);
      } else {
        return Promise.reject('Access token is null after retrieval');
      }
    }

    // 3. 发送消息
    result = await sendMessage(accessToken, touser, agentid, text_content);

    return {
      result
    };
  } catch (error: unknown) {
    // 使用类型断言来处理错误
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return Promise.reject(error.message);
    }
    console.error('Error:', error);
    return Promise.reject('An unknown error occurred');
  }
};

export default main;
