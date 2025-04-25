import Redis from 'ioredis';

const redis = new Redis('redis');

type Props = {
  corpId: string; // 企业微信的企业ID
  corpSecret: string; // 自建应用的Secret
  code: string; // 企业微信返回的授权code
  chat_id?: string; // 可选，用于Redis缓存
};

type Response = Promise<{
  code: string;
  msg: string;
  data: any;
}>;

const main = async (props: Props): Response => {
  try {
    const { corpId, corpSecret, code, chat_id } = props;

    //1. 检查Redis缓存
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

    // 生成token的Redis键名
    const tokenKey = `access_token:${corpId}:${corpSecret}`;

    // 2. 尝试从Redis获取access_token
    const cachedToken = await redis.get(tokenKey);
    let accessToken: string;

    // 如果Redis中没有token，则从企业微信API获取
    if (!cachedToken) {
      const tokenUrl = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${corpSecret}`;
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();

      if (tokenData.errcode !== 0) {
        return {
          code: '400',
          msg: tokenData.errmsg || 'Failed to get access_token',
          data: tokenData
        };
      }

      accessToken = tokenData.access_token;

      // 将token存入Redis，设置7200秒过期时间
      await redis.setex(tokenKey, 7200, accessToken);
    } else {
      accessToken = cachedToken;
    }

    // 3. 用code获取userid
    const userInfoUrl = `https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo?access_token=${accessToken}&code=${code}`;
    const userInfoResponse = await fetch(userInfoUrl);
    const userInfo = await userInfoResponse.json();

    if (userInfo.errcode !== 0 || userInfo.userid == null) {
      return {
        code: '400',
        msg: userInfo.errmsg || 'Failed to get user info',
        data: userInfo
      };
    }

    // 4. 返回结果处理
    const result = {
      access_token: accessToken,
      expires_in: 7200, // 固定为7200秒，与企业微信token有效期一致
      userid: userInfo.userid
    };

    // 5. 缓存结果（建议缓存userid而不是token）
    if (chat_id) {
      await redis.setex(chat_id, 7200, JSON.stringify(result));
    }

    return {
      code: '200',
      msg: 'Success',
      data: result
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      code: '500',
      msg: errorMessage,
      data: null
    };
  }
};

export default main;
