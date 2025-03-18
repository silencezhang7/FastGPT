import React, { useMemo } from 'react';
import { Box, useTheme } from '@chakra-ui/react';

import type { SearchDataResponseItemType } from '@fastgpt/global/core/dataset/type';
import QuoteItem, { formatScore } from '@/components/core/dataset/QuoteItem';
import { useContextSelector } from 'use-context-selector';
import { ChatBoxContext } from '../Provider';
import { ChatItemContext } from '@/web/core/chat/context/chatItemContext';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useChatStore } from '@/web/core/chat/context/useChatStore';
import { getQuoteDataList } from '@/web/core/chat/api';

const QuoteList = React.memo(function QuoteList({
  chatItemDataId = '',
  rawSearch = []
}: {
  chatItemDataId?: string;
  rawSearch: SearchDataResponseItemType[];
}) {
  const theme = useTheme();
  const { chatId, appId, outLinkAuthData } = useChatStore();

  const RawSourceBoxProps = useContextSelector(ChatBoxContext, (v) => ({
    chatItemDataId,
    appId: v.appId,
    chatId: v.chatId,
    ...(v.outLinkAuthData || {})
  }));
  const showRawSource = useContextSelector(ChatItemContext, (v) => v.isShowReadRawSource);
  const showRouteToDatasetDetail = useContextSelector(
    ChatItemContext,
    (v) => v.showRouteToDatasetDetail
  );

  const { data: quoteList } = useRequest2(
    async () =>
      await getQuoteDataList({
        datasetDataIdList: rawSearch.map((item) => item.id),
        collectionIdList: [...new Set(rawSearch.map((item) => item.collectionId))],
        chatItemDataId,
        appId,
        chatId,
        ...outLinkAuthData
      }),
    {
      manual: false
    }
  );

  const formatedDataList = useMemo(() => {
    return rawSearch
      .map((item) => {
        const currentFilterItem = quoteList?.find((res) => res._id === item.id);

        return {
          ...item,
          q: currentFilterItem?.q || '',
          a: currentFilterItem?.a || ''
        };
      })
      .sort((a, b) => {
        const aScore = formatScore(a.score);
        const bScore = formatScore(b.score);
        return (bScore.primaryScore?.value || 0) - (aScore.primaryScore?.value || 0);
      });
  }, [quoteList, rawSearch]);

  return (
    <>
      {formatedDataList.map((item, i) => (
        <Box
          key={i}
          flex={'1 0 0'}
          p={2}
          borderRadius={'sm'}
          border={theme.borders.base}
          _notLast={{ mb: 2 }}
          _hover={{ '& .hover-data': { display: 'flex' } }}
          bg={i % 2 === 0 ? 'white' : 'myWhite.500'}
        >
          <QuoteItem
            quoteItem={item}
            canViewSource={showRawSource}
            canEditDataset={showRouteToDatasetDetail}
            {...RawSourceBoxProps}
          />
        </Box>
      ))}
    </>
  );
});

export default QuoteList;
