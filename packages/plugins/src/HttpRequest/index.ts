import iconv from 'iconv-lite';

type Props = {
  requestUrl: string; // URL 应该是字符串
  body?: any; // 请求体，POST 时使用
  headers?: Record<string, string>; // 请求头，格式为 {"key": "value"}
  parameter?: Record<string, string>; // GET 请求时的参数，格式为 {"key": "value"}
  encoding?: string; // 可选编码
  requestMethod?: string; // 请求方法
};

type Response = Promise<{
  code: string; // 返回的状态码
  msg: string; // 返回的消息
  data: any; // 返回的数据
}>;

const main = async (props: Props): Response => {
  try {
    const { requestUrl, body, headers, parameter, requestMethod, encoding } = props;

    let url = requestUrl;

    // 如果是 GET 请求，构建查询参数
    if (requestMethod === 'GET' && parameter) {
      const queryString = new URLSearchParams(parameter).toString();
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
      method: requestMethod, // 根据请求方法设置
      headers: {
        'Content-Type': 'application/json', // 设置内容类型为 JSON
        ...headers // 合并用户提供的 headers
      },
      body: requestMethod === 'POST' ? JSON.stringify(body) : undefined // 仅在 POST 请求时使用 body
    });

    if (!response.ok) {
      const errorMessage = await response.text(); // 获取错误信息
      return {
        code: '500',
        msg: errorMessage || 'Request failed',
        data: null
      };
    }

    // 获取响应的 ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // 根据实际编码调整
    const decodedData = iconv.decode(Buffer.from(arrayBuffer), encoding || 'UTF-8');

    // 将解码后的字符串解析为 JSON 对象
    const jsonResponse = JSON.parse(decodedData);

    // 假设 jsonResponse 的结构符合要求
    return {
      code: '200', // 默认状态码为 200
      msg: 'Success', // 默认消息为 Success
      data: jsonResponse || {} // 默认数据为 null
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      code: '500',
      msg: errorMessage,
      data: null
    }; // 返回拒绝的 Promise
  }
};

export default main;
