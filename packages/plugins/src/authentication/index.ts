type Props = {
  requestUrl: string;
  code: string;
  grant_type: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
};

// 定义成功响应类型
type SuccessResponse = {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

// 定义错误响应类型
type ErrorResponse = {
  error: string;
  error_description: string;
};

type Response = Promise<{
  code: string;
  msg: string;
  data: SuccessResponse | ErrorResponse | null;
}>;

const main = async (props: Props): Response => {
  try {
    const { requestUrl, code, grant_type, client_id, client_secret, redirect_uri } = props;

    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('grant_type', grant_type);
    queryParams.append('code', code);
    if (redirect_uri) {
      queryParams.append('redirect_uri', redirect_uri);
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

    // 直接解析JSON响应
    const jsonResponse = await response.json();

    // 检查是否是错误响应
    if ('error' in jsonResponse) {
      const errorResponse = jsonResponse as ErrorResponse;
      return {
        code: '400', // 使用400表示客户端错误
        msg: errorResponse.error_description || 'Authorization failed',
        data: errorResponse
      };
    }

    // 成功响应
    const successResponse = jsonResponse as SuccessResponse;
    return {
      code: '200',
      msg: 'Success',
      data: successResponse
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
