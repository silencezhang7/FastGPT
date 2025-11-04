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

// 获取文件存储目录的绝对路径
const getFilesDir = (): string => {
  // 使用 /app/data/files 目录，这个目录在 Docker 中是可写的
  // 开发环境：使用项目根目录下的 data/files
  // Docker 环境：使用 /app/data/files
  const isDocker = process.env.NODE_ENV === 'development';

  if (!isDocker) {
    // Docker 环境：/app/data/files
    return '/app/data/files';
  } else {
    // 开发环境：从当前目录向上查找到项目根目录
    // 插件在 packages/plugins/src/historyToFile
    const currentDir = __dirname;
    return path.join(currentDir, '../../../../projects/app/data/files');
  }
};

// 保存文件到 data/files 目录
const saveFile = async (content: string, filename: string): Promise<string> => {
  const filesDir = getFilesDir();
  const filePath = path.join(filesDir, filename);

  // 确保目录存在
  await fs.promises.mkdir(filesDir, { recursive: true });

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

    // 保存 Markdown 文件到 data/files 目录
    await saveFile(markdownContent, mdFilename);

    // 使用页面输入的 fileDomain，文件路径为 /api/plugin/historyFile/{filename}
    const fileUrl = `${fileDomain}/api/plugin/historyFile/${mdFilename}`;

    // 生成 OnlyOffice 预览 HTML 页面
    const htmlContent = generateOnlyOfficeHtml(fileUrl, mdFilename, onlyOfficeUrl);

    // 保存 HTML 预览页面到 data/files 目录
    await saveFile(htmlContent, htmlFilename);

    const htmlFileUrl = `${fileDomain}/api/plugin/historyFile/${htmlFilename}`;

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
