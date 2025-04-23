import Redis from 'ioredis';

const redis = new Redis('redis');

type Props = {
  requestUrl: string;
  code: string;
  grant_type: string;
  client_id: string;
  client_secret: string;
  chat_id: string;
};

type Response = Promise<{
  code: string;
  msg: string;
  data: any;
}>;

const main = async (props: Props): Response => {
  try {
    const { requestUrl, code, grant_type, client_id, client_secret, chat_id } = props;

    // 首先检查Redis中是否有缓存
    if (chat_id) {
      const cachedData = await redis.get(chat_id);
      if (cachedData) {
        return {
          code: '200',
          msg: 'Success (cached)',
          data: JSON.parse(cachedData)
        };
      }
    }

    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('grant_type', grant_type);
    queryParams.append('code', code);
    if (chat_id) {
      queryParams.append('redirect_uri', chat_id);
    }

    // 创建Basic认证头
    const authHeader = 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: authHeader
      },
      body: queryParams.toString()
    });

    const jsonResponse = await response.json();

    // 检查是否是错误响应
    if ('error' in jsonResponse) {
      // 特殊处理Redirect URI mismatch情况
      if (
        jsonResponse.error_description &&
        jsonResponse.error_description.includes('Redirect URI mismatch')
      ) {
        // 将成功响应存入Redis
        if (chat_id) {
          await redis.setex(chat_id, 3600, JSON.stringify(jsonResponse)); // 60分钟 = 3600秒
        }
        return {
          code: '200',
          msg: 'Success (Redirect URI mismatch allowed)',
          data: jsonResponse
        };
      } else {
        // 其他错误情况
        return {
          code: '400',
          msg: jsonResponse.error_description || 'Authorization failed',
          data: jsonResponse
        };
      }
    }

    // 成功响应处理
    if (chat_id) {
      await redis.setex(chat_id, 3600, JSON.stringify(jsonResponse)); // 60分钟 = 3600秒
    }
    return {
      code: '200',
      msg: 'Success',
      data: jsonResponse
    };
  } catch (error: unknown) {
    // 处理网络错误或其他异常
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      code: '500',
      msg: errorMessage,
      data: null
    };
  }
};

export default main;
