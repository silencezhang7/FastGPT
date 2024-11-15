import { HStack, Stack, Text, Box, Flex, Avatar, Card, CardBody, Link } from '@chakra-ui/react';
import { useToast } from '@fastgpt/web/hooks/useToast';
import React, { useEffect, useState } from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import styles from './index.module.scss';
import type { IconNameType } from '@fastgpt/web/components/common/Icon/type';
import { useSystem } from '@fastgpt/web/hooks/useSystem';

interface MyCardProps {
  icon: IconNameType;
  text: string;
  backgroundImage: string;
  click: Function;
}
//纵向card实现
const TransverseCard: React.FC<{ onSetChatInput: Function }> = (props) => {
  const jsons: MyCardProps[] = [
    {
      icon: 'core/chat/car',
      text: '车险保价',
      backgroundImage: 'linear-gradient(120deg, #a6c0fe 0%, #f68084 100%)',
      click: (text: string) => {
        props.onSetChatInput(text);
      }
    },
    {
      icon: 'core/chat/policy',
      text: '保单查询',
      backgroundImage: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
      click: (text: string) => {
        props.onSetChatInput(text);
      }
    },
    {
      icon: 'core/chat/apply',
      text: '理赔申请',
      backgroundImage: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
      click: (text: string) => {
        props.onSetChatInput(text);
      }
    },
    {
      icon: 'core/chat/car',
      text: '1V1顾问',
      backgroundImage: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
      click: (text: string) => {
        props.onSetChatInput(text);
      }
    },
    {
      icon: 'core/chat/car',
      text: '1V1顾问',
      backgroundImage: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
      click: (text: string) => {
        props.onSetChatInput(text);
      }
    }
  ];
  return (
    <Flex className={styles.chatFlexAuto} overflow={'auto'} flexWrap={'nowrap'} mt={2} gap={4}>
      {jsons.map((item, index) => (
        <Card
          size={'sm'}
          key={index}
          borderRadius={'xl'}
          p={2}
          className={styles.chatFlexCursor}
          style={{
            color: 'white',
            flexShrink: 0,
            backgroundImage: item.backgroundImage
          }}
        >
          <MyIcon ml={6} mt={3} w={'20px'} name={item.icon} />
          <CardBody key={index}>
            <Text
              fontSize={'xs'}
              onClick={() => {
                item.click(item.text);
              }}
            >
              {item.text}
            </Text>
          </CardBody>
        </Card>
      ))}
    </Flex>
  );
};
// 横向card实现
const PortraitCard: React.FC<{
  onSetChatInput: Function;
}> = (props) => {
  const { toast } = useToast();
  const jsons: MyCardProps[] = [
    {
      icon: 'core/chat/ADSelfService',
      text: 'AD自助服务',
      backgroundImage: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)',
      click: (text: string) => {
        location.href = 'https://tpapi.axa.cn/accesscontrol/ad';
      }
    },
    {
      icon: 'core/chat/applyQuery',
      text: '工单进度查询',
      backgroundImage: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
      click: (text: string) => {
        toast({
          title: '系统提示',
          description: '功能开发中，敬请期待',
          status: 'warning'
        });
      }
    }
  ];
  const Content = jsons.map((item, index) => (
    <Card
      key={index}
      size={'lg'}
      borderRadius={'xl'}
      className={styles.chatFlexCursor}
      onClick={() => {
        item.click(item.text);
      }}
      style={{
        color: 'white',
        backgroundImage: item.backgroundImage
      }}
    >
      <Flex justifyContent={'space-around'}>
        <MyIcon mt={2} w={'30px'} name={item.icon} />
      </Flex>

      <CardBody
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.85rem',
          justifyContent: 'center'
        }}
      >
        <Text fontSize={'xs'}>{item.text}</Text>
      </CardBody>
    </Card>
  ));
  return (
    <>
      <Card
        size={'lg'}
        width={'7.5rem'}
        style={{
          justifyContent: 'space-around',
          boxShadow: 'none'
        }}
      >
        {Content}
      </Card>
    </>
  );
};

const ChatDecorate: React.FC<{ onSetChatInput: Function }> = (props) => {
  const { isPc } = useSystem();
  const [chatWidth, setChatWidth] = useState('18vw');
  useEffect(() => {
    if (isPc) {
      setChatWidth('18vw');
    } else {
      setChatWidth('50vw');
    }
  }, [isPc]);
  return (
    <>
      <Box ml={4}>
        <Box ml={4}>
          <Stack gap={8}>
            <HStack gap="4">
              <Avatar
                size="lg"
                src={'https://apps.axa.cn/fileServer/download.do?fileId=20241195380586996272696'}
              />
              <Stack gap="0">
                <Text fontWeight="medium">{'亲爱的用户，您好~'}</Text>
                <Text fontSize={'0.8rem'} color={'gray'} textStyle="sm">
                  {'我是AI好IT智能客服,很荣幸为您服务'}
                </Text>
              </Stack>
            </HStack>
          </Stack>
        </Box>
        <Box mt={4} ml={4}>
          <Flex gap={6}>
            <PortraitCard onSetChatInput={props.onSetChatInput} />
            <Card size={'lg'} width={chatWidth}>
              <Box ml={4}>
                <Text mt={2}>猜你想问：</Text>
                {[
                  '核算系统如何重置密码',
                  '域账号的密码重置规则是什么',
                  '国内版的teams如何使用',
                  '如何使用打印机'
                ].map((item, index) => (
                  <Text
                    className={styles.chatFlexCursor}
                    fontSize={'sm'}
                    color={'gray'}
                    onClick={() => props.onSetChatInput(item)}
                    key={index}
                    mt={2}
                  >
                    {item}
                  </Text>
                ))}
              </Box>
              <Link
                color={'blue'}
                ml={4}
                mt={6}
                style={{
                  position: 'relative',
                  bottom: '0.5rem'
                }}
              >
                换一批
                <MyIcon name={'core/chat/refresh'} ml={2} mt={1} w={'20px'} />
              </Link>
            </Card>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(ChatDecorate);
