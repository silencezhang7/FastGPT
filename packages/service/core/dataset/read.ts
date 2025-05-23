import { BucketNameEnum } from '@fastgpt/global/common/file/constants';
import { DatasetSourceReadTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { readFileContentFromMongo } from '../../common/file/gridfs/controller';
import { urlsFetch } from '../../common/string/cheerio';
import { type TextSplitProps, splitText2Chunks } from '@fastgpt/global/common/string/textSplitter';
import axios from 'axios';
import { readRawContentByFileBuffer } from '../../common/file/read/utils';
import { parseFileExtensionFromUrl } from '@fastgpt/global/common/string/tools';
import {
  type APIFileServer,
  type FeishuServer,
  type YuqueServer
} from '@fastgpt/global/core/dataset/apiDataset';
import { getApiDatasetRequest } from './apiDataset';
import Papa from 'papaparse';

export const readFileRawTextByUrl = async ({
  teamId,
  tmbId,
  url,
  customPdfParse,
  getFormatText,
  relatedId
}: {
  teamId: string;
  tmbId: string;
  url: string;
  customPdfParse?: boolean;
  getFormatText?: boolean;
  relatedId: string; // externalFileId / apiFileId
}) => {
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'arraybuffer'
  });
  const extension = parseFileExtensionFromUrl(url);

  const buffer = Buffer.from(response.data, 'binary');

  const { rawText } = await readRawContentByFileBuffer({
    customPdfParse,
    getFormatText,
    extension,
    teamId,
    tmbId,
    buffer,
    encoding: 'utf-8',
    metadata: {
      relatedId
    }
  });

  return rawText;
};

/* 
  fileId - local file, read from mongo
  link - request
  externalFile/apiFile = request read
*/
export const readDatasetSourceRawText = async ({
  teamId,
  tmbId,
  type,
  sourceId,
  selector,
  externalFileId,
  apiServer,
  feishuServer,
  yuqueServer,
  customPdfParse,
  getFormatText
}: {
  teamId: string;
  tmbId: string;
  type: DatasetSourceReadTypeEnum;
  sourceId: string;
  customPdfParse?: boolean;
  getFormatText?: boolean;

  selector?: string; // link selector
  externalFileId?: string; // external file dataset
  apiServer?: APIFileServer; // api dataset
  feishuServer?: FeishuServer; // feishu dataset
  yuqueServer?: YuqueServer; // yuque dataset
}): Promise<{
  title?: string;
  rawText: string;
}> => {
  if (type === DatasetSourceReadTypeEnum.fileLocal) {
    const { filename, rawText } = await readFileContentFromMongo({
      teamId,
      tmbId,
      bucketName: BucketNameEnum.dataset,
      fileId: sourceId,
      customPdfParse,
      getFormatText
    });
    return {
      title: filename,
      rawText
    };
  } else if (type === DatasetSourceReadTypeEnum.link) {
    const result = await urlsFetch({
      urlList: [sourceId],
      selector
    });

    return {
      title: result[0]?.title,
      rawText: result[0]?.content || ''
    };
  } else if (type === DatasetSourceReadTypeEnum.externalFile) {
    if (!externalFileId) return Promise.reject('FileId not found');
    const rawText = await readFileRawTextByUrl({
      teamId,
      tmbId,
      url: sourceId,
      relatedId: externalFileId,
      customPdfParse
    });
    return {
      rawText
    };
  } else if (type === DatasetSourceReadTypeEnum.apiFile) {
    const { title, rawText } = await readApiServerFileContent({
      apiServer,
      feishuServer,
      yuqueServer,
      apiFileId: sourceId,
      teamId,
      tmbId
    });
    return {
      title,
      rawText
    };
  }
  return {
    title: '',
    rawText: ''
  };
};

export const readApiServerFileContent = async ({
  apiServer,
  feishuServer,
  yuqueServer,
  apiFileId,
  teamId,
  tmbId,
  customPdfParse
}: {
  apiServer?: APIFileServer;
  feishuServer?: FeishuServer;
  yuqueServer?: YuqueServer;
  apiFileId: string;
  teamId: string;
  tmbId: string;
  customPdfParse?: boolean;
}): Promise<{
  title?: string;
  rawText: string;
}> => {
  return (
    await getApiDatasetRequest({
      apiServer,
      yuqueServer,
      feishuServer
    })
  ).getFileContent({
    teamId,
    tmbId,
    apiFileId,
    customPdfParse
  });
};

export const rawText2Chunks = ({
  rawText,
  backupParse,
  chunkSize = 512,
  ...splitProps
}: {
  rawText: string;
  backupParse?: boolean;
  tableParse?: boolean;
} & TextSplitProps): {
  q: string;
  a: string;
  indexes?: string[];
}[] => {
  const parseDatasetBackup2Chunks = (rawText: string) => {
    const csvArr = Papa.parse(rawText).data as string[][];
    console.log(rawText, csvArr);

    const chunks = csvArr
      .slice(1)
      .map((item) => ({
        q: item[0] || '',
        a: item[1] || '',
        indexes: item.slice(2)
      }))
      .filter((item) => item.q || item.a);

    return {
      chunks
    };
  };

  if (backupParse) {
    return parseDatasetBackup2Chunks(rawText).chunks;
  }

  const { chunks } = splitText2Chunks({
    text: rawText,
    chunkSize,
    ...splitProps
  });

  return chunks.map((item) => ({
    q: item,
    a: '',
    indexes: []
  }));
};
