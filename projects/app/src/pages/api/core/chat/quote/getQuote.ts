import { NextAPI } from '@/service/middleware/entry';
import { authChatCrud, authCollectionInChat } from '@/service/support/permission/auth/chat';
import { MongoDatasetData } from '@fastgpt/service/core/dataset/data/schema';
import { type ApiRequestProps } from '@fastgpt/service/type/next';
import { quoteDataFieldSelector, type QuoteDataItemType } from '@/service/core/chat/constants';
import { processChatTimeFilter } from '@/service/core/chat/utils';
import { ChatErrEnum } from '@fastgpt/global/common/error/code/chat';

export type GetQuoteProps = {
  datasetDataIdList: string[];

  collectionIdList: string[];
  chatId: string;
  chatItemDataId: string;
  appId: string;
  shareId?: string;
  outLinkUid?: string;
  teamId?: string;
  teamToken?: string;
};

export type GetQuotesRes = QuoteDataItemType[];

async function handler(req: ApiRequestProps<GetQuoteProps>): Promise<GetQuotesRes> {
  const {
    appId,
    chatId,
    chatItemDataId,

    shareId,
    outLinkUid,
    teamId,
    teamToken,

    collectionIdList,
    datasetDataIdList
  } = req.body;

  const [{ chat, responseDetail }, { chatItem }] = await Promise.all([
    authChatCrud({
      req,
      authToken: true,
      appId,
      chatId,
      shareId,
      outLinkUid,
      teamId,
      teamToken
    }),
    authCollectionInChat({ appId, chatId, chatItemDataId, collectionIds: collectionIdList })
  ]);
  if (!chat || !responseDetail) return Promise.reject(ChatErrEnum.unAuthChat);

  const list = await MongoDatasetData.find(
    { _id: { $in: datasetDataIdList }, collectionId: { $in: collectionIdList } },
    quoteDataFieldSelector
  ).lean();

  const quoteList = processChatTimeFilter(list, chatItem.time);

  return quoteList;
}

export default NextAPI(handler);
