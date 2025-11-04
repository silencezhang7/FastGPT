import { ChatItemValueTypeEnum } from '@fastgpt/global/core/chat/constants';
import * as fs from 'fs';
import * as path from 'path';

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
  fileDomain: string;
  onlyOfficeUrl: string;
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

// 获取 public 目录的绝对路径
const getPublicDir = (): string => {
  // 从插件目录向上查找到项目根目录的 public 文件夹
  const currentDir = __dirname;
  // 插件在 packages/plugins/src/historyToFile，需要向上到 projects/app/public

  return path.join(currentDir, '../../../../projects/app/public');
};

// 保存文件到 public 目录
const saveFileToPublic = async (content: string, filename: string): Promise<string> => {
  const publicDir = getPublicDir();
  const filePath = path.join(publicDir, filename);

  // 确保 public 目录存在
  await fs.promises.mkdir(publicDir, { recursive: true });

  // 写入文件
  await fs.promises.writeFile(filePath, content, 'utf-8');

  return filename;
};

// 生成 OnlyOffice 预览 HTML 页面
const generateOnlyOfficeHtml = (
  fileUrl: string,
  filename: string,
  onlyOfficeUrl: string
): string => {
  return `<html lang="zh-CN">
<head>
  <title>${filename}</title>
  <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport"/>
  <meta charset="utf-8"/>
  <!-- onlyoffice服务器地址 -->
  <script src="${onlyOfficeUrl}"></script>
  <style>
    body {
      padding: 0;
      margin: 0;
    }
  </style>
</head>
<body>
<!-- 占位元素 -->
<div id="placeholder"></div>
<script>
    /**
     * 详细配置文档：https://api.onlyoffice.com/editors/config/
     * @param url 要预览的文档地址
     * @param filename 要预览的文档文件名
     */
    function preview(url, filename) {
        const index = filename.lastIndexOf('.');
        const fileType = filename.substr(index + 1);
        const config = {
            "document": {
                "permissions": {
                    comment: false,
                    fillForms: false,
                    "edit": false,
                    "chat": false
                },
                "fileType": fileType,
                "title": filename,
                "url": url,
                "lang": "zh-CN"
            },
            "width": '100%',
            "height": '100%',
            "editorConfig": {
                mode: 'view',
                "lang": "zh-CN"
            }
        };
        document.title = filename;
        const docEditor = new DocsAPI.DocEditor("placeholder", config);
    }

    // 要预览的文档地址
    const url = '${fileUrl}';
    // 要预览的文档文件名
    const filename = '${filename}';
    // 调用方法
    preview(url, filename);
</script>
</body>
</html>`;
};

// 主函数
const main = async ({ history, historyCount, fileDomain, onlyOfficeUrl }: Props): Response => {
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

    const timestamp = Date.now();
    const mdFilename = `history-${timestamp}.md`;
    const htmlFilename = `preview-${timestamp}.html`;

    // 保存 Markdown 文件到 public 目录
    await saveFileToPublic(markdownContent, mdFilename);

    // 使用页面输入的 fileDomain
    const fileUrl = `${fileDomain}/${mdFilename}`;

    // 生成 OnlyOffice 预览 HTML 页面
    const htmlContent = generateOnlyOfficeHtml(fileUrl, mdFilename, onlyOfficeUrl);

    // 保存 HTML 预览页面到 public 目录
    await saveFileToPublic(htmlContent, htmlFilename);

    const htmlFileUrl = `${fileDomain}/${htmlFilename}`;

    return {
      fileUrl: fileUrl,
      markdownContent: markdownContent,
      fileViewUrl: htmlFileUrl,
      fileId: mdFilename
    };
  } catch (error) {
    return handleError(error);
  }
};

export default main;
