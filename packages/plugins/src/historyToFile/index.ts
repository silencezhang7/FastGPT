import { ChatItemValueTypeEnum } from '@fastgpt/global/core/chat/constants';
import axios from 'axios';
import FormData from 'form-data';
import { parseStringPromise } from 'xml2js'; // 导入 xml2js

// 定义 ValueItem 类型
type ValueItem = {
  type: string;
  text?: {
    content: string;
  };
  file?: {
    url: string;
  };
};

// 定义 Props 类型
type Props = {
  history: Array<{
    dataId: string;
    obj: string;
    value: ValueItem[];
  }>;
  historyCount: number;
  systemName: string;
  password: string;
  envHostUrl: string;
  fileViewHost: string;
};

type Response = Promise<{
  fileUrl: string;
  markdownContent: string;
  fileViewUrl: string;
  fileId: string;
}>;

const handleError = (
  error: unknown
): { fileUrl: string; markdownContent: string; fileViewUrl: string; fileId: string } => {
  if (error instanceof Error) {
    return {
      fileUrl: `错误信息: ${error.message}`,
      markdownContent: `错误信息: ${error.message}`,
      fileViewUrl: `错误信息: ${error.message}`,
      fileId: `错误信息: ${error.message}`
    };
  } else {
    return {
      fileUrl: `未知错误`,
      markdownContent: `未知错误`,
      fileViewUrl: `未知错误`,
      fileId: `未知错误`
    };
  }
};
// 文件上传函数
const uploadToFileServer = async (
  markdownContent: string,
  systemName: string,
  password: string,
  envHostUrl: string
): Promise<string> => {
  const form = new FormData();

  // 添加 Markdown 内容作为文件
  form.append('file', markdownContent, { filename: 'markdown.md' }); // 直接传递内容
  form.append('systemName', systemName); // 根据需要修改
  form.append('userName', password); // 根据需要修改

  const response = await axios.post(envHostUrl + 'upload.do', form, {
    headers: {
      ...form.getHeaders()
    }
  });
  const result = await parseStringPromise(response.data);
  return result.root.attachment[0].fileid[0]; // 返回 fileId
};

// 主函数
const main = async ({
  history,
  historyCount,
  systemName,
  password,
  envHostUrl,
  fileViewHost
}: Props): Response => {
  try {
    // 计算要提取的记录数量，最多为 history.length
    const numberOfRecords = Math.min(history.length, historyCount);

    // 取最后 numberOfRecords 条历史记录并倒序
    const limitedHistory = history.slice(-numberOfRecords);

    // 构建 Markdown 内容
    const markdownContent = limitedHistory
      .map((item) => {
        let role = item.obj === 'Human' ? '用户' : item.obj;
        let result = `Role: ${role}\n`;
        const content = item.value
          .map((valueItem) => {
            if (valueItem.type === ChatItemValueTypeEnum.text) {
              return valueItem.text?.content;
            } else if (valueItem.type === ChatItemValueTypeEnum.file) {
              return `![${valueItem.type}](${valueItem.file?.url})`;
            }
            return ''; // 确保返回一个字符串
          })
          .join('\n'); // 将内容连接为字符串

        return result + content;
      })
      .join('\n\n-------\n\n'); // 用分隔符连接每个条目

    // 上传 Markdown 内容到文件服务器
    const fileId = await uploadToFileServer(markdownContent, systemName, password, envHostUrl);

    const fileUrl = `${envHostUrl}download.do?fileId=${fileId}&fullfilename=file-${Date.now()}.md`;

    return {
      fileUrl: fileUrl,
      markdownContent: markdownContent,
      fileViewUrl: fileViewHost + btoa(fileUrl),
      fileId: fileId
    };
  } catch (error) {
    return handleError(error);
  }
};

export default main;
