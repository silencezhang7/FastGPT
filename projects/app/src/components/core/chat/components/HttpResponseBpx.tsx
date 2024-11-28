import React, { useEffect, useState } from 'react';
import Markdown from '@/components/Markdown';
import { ChatItemValueItemType } from '@fastgpt/global/core/chat/type';
import MdImage from '@/components/Markdown/img/Image';
import { Box, Flex, Text } from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { ChatFileTypeEnum } from '@fastgpt/global/core/chat/constants';
import { getFileIcon } from '@fastgpt/global/common/file/icon';

type props = {
  value: ChatItemValueItemType;
  isLastResponseValue: boolean;
  isChatting: boolean;
};
const HttpResponseBpx = ({ value, isLastResponseValue, isChatting }: props) => {
  return (
    <>
      {value.type === 'text' && (
        <Markdown source={value.text?.content} showAnimation={isLastResponseValue && isChatting} />
      )}
      {value.type === 'file' && <SystemFileBlock file={value.file} />}
    </>
  );
};

const SystemFileBlock = (props: {
  file?: { type: `${ChatFileTypeEnum}`; name?: string; url: string };
}) => {
  const { type, name, url } = props.file || {};
  const [icon, setIcon] = useState<string>('');
  useEffect(() => {
    const icon = getFileIcon(name);
    setIcon(icon);
  }, [name]);
  return (
    <Box bg={'white'} borderRadius={'md'} overflow="hidden">
      {type === 'image' && <MdImage src={url} minH={'100px'} my={0} />}
      {type === 'file' && (
        <Flex
          p={2}
          w={'100%'}
          alignItems="center"
          cursor={'pointer'}
          onClick={() => {
            window.open(url);
          }}
        >
          <MyIcon name={icon as any} flexShrink={0} w={['1.5rem', '2rem']} h={['1.5rem', '2rem']} />
          <Text
            ml={2}
            fontSize={'xs'}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {name || url}
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default React.memo(HttpResponseBpx);
