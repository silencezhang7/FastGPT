import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import * as fs from 'fs';
import * as path from 'path';

const previewableExtensions = ['md', 'html', 'txt', 'json'];

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { filename } = req.query as { filename: string };

    if (!filename) {
      throw new Error('filename is required');
    }

    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }

    // 获取文件路径
    const isDocker = process.env.NODE_ENV === 'production';
    const filesDir = isDocker ? '/app/data/files' : path.join(process.cwd(), 'data/files');
    const filePath = path.join(filesDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // 读取文件
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    // 获取文件扩展名
    const extension = filename.split('.').pop() || '';
    const disposition = previewableExtensions.includes(extension) ? 'inline' : 'attachment';

    // 设置响应头
    const contentTypeMap: Record<string, string> = {
      md: 'text/markdown',
      html: 'text/html',
      txt: 'text/plain',
      json: 'application/json'
    };

    res.setHeader(
      'Content-Type',
      `${contentTypeMap[extension] || 'application/octet-stream'}; charset=utf-8`
    );
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(filename)}"`
    );

    res.status(200).send(fileContent);
  } catch (error) {
    jsonRes(res, {
      code: 500,
      error
    });
  }
}

export const config = {
  api: {
    responseLimit: '100mb'
  }
};
