import { APIFileItem, ApiFileReadContentResponse } from '@fastgpt/global/core/dataset/apiDataset';
import { POST } from '@fastgpt/service/common/api/plusRequest';
import {
  GetProApiDatasetFileContentParams,
  GetProApiDatasetFileListParams,
  GetProApiDatasetFilePreviewUrlParams,
  ProApiDatasetOperationTypeEnum
} from '@fastgpt/service/core/dataset/apiDataset/proApi';

export const getProApiDatasetFileListRequest = async (data: GetProApiDatasetFileListParams) => {
  const res = await POST<APIFileItem[]>('/core/dataset/systemApiDataset', {
    type: ProApiDatasetOperationTypeEnum.LIST,
    ...data
  });
  return res;
};

export const getProApiDatasetFileContentRequest = async (
  data: GetProApiDatasetFileContentParams
) => {
  const res = await POST<ApiFileReadContentResponse>('/core/dataset/systemApiDataset', {
    type: ProApiDatasetOperationTypeEnum.CONTENT,
    ...data
  });
  return res;
};

export const getProApiDatasetFilePreviewUrlRequest = async (
  data: GetProApiDatasetFilePreviewUrlParams
) => {
  const res = await POST<string>('/core/dataset/systemApiDataset', {
    type: ProApiDatasetOperationTypeEnum.READ,
    ...data
  });
  return res;
};
