import { HStack, Stack, Text, Box, Flex, Avatar, Card, CardBody, Link } from '@chakra-ui/react';
import { useToast } from '@fastgpt/web/hooks/useToast';
import React, { useEffect, useState } from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import styles from './index.module.scss';
import type { IconNameType } from '@fastgpt/web/components/common/Icon/type';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { AppChatDecorateConfigType } from '@fastgpt/global/core/app/type';
import { useTranslation } from 'next-i18next';

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
        // 检查是否为移动端
        const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) {
          toast({
            title: '系统提示',
            description: '请在企业微信内打开',
            status: 'warning'
          });
        } else {
          location.href = 'https://tpapi.axa.cn/accesscontrol/ad';
        }
      }
    },
    {
      icon: 'core/chat/applyQuery',
      text: '工单进度查询',
      backgroundImage: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
      click: (text: string) => {
        // toast({
        //   title: '系统提示',
        //   description: '功能开发中，敬请期待',
        //   status: 'warning'
        // });
        props.onSetChatInput(text);
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
          boxShadow: 'none',
          right: '0.7.5rem'
        }}
      >
        <Stack spacing={4}>{Content}</Stack>
      </Card>
    </>
  );
};

const ChatDecorate: React.FC<{
  onSetChatInput: Function;
  chatDecorateConfig: AppChatDecorateConfigType | undefined;
}> = (props) => {
  const { isPc } = useSystem();
  const { t } = useTranslation();
  const [chatWidth, setChatWidth] = useState('18vw');
  useEffect(() => {
    if (isPc) {
      setChatWidth('18vw');
    } else {
      setChatWidth('50vw');
    }
  }, [isPc]);
  const [problemTexts, setProblemTexts] = useState<string[]>([]);
  useEffect(() => {
    if (props.chatDecorateConfig?.problemTexts) {
      if (props.chatDecorateConfig.problemTexts.length > 4) {
        setProblemTexts(props.chatDecorateConfig.problemTexts.slice(0, 4));
      } else {
        setProblemTexts(props.chatDecorateConfig.problemTexts);
      }
    }
  }, [props.chatDecorateConfig?.problemTexts]);

  const refresh = () => {
    if (
      props.chatDecorateConfig?.problemTexts &&
      props.chatDecorateConfig.problemTexts.length > 4
    ) {
      const array = props.chatDecorateConfig.problemTexts.slice(
        4,
        props.chatDecorateConfig.problemTexts.length
      );
      if (problemTexts[0] === array[0]) {
        setProblemTexts([...props.chatDecorateConfig.problemTexts.slice(0, 4)]);
      } else {
        setProblemTexts([...array]);
      }
    }
  };
  return (
    <>
      {props.chatDecorateConfig?.open && (
        <Box ml={4}>
          <Box ml={4}>
            <Stack gap={8}>
              <HStack gap="4">
                <Avatar size="lg" src={props.chatDecorateConfig?.robotAvatar} />
                <Stack gap="0">
                  <Text fontWeight="medium">{props.chatDecorateConfig?.robotSubTitle}</Text>
                  <Text fontSize={'0.8rem'} color={'gray'} textStyle="sm">
                    {props.chatDecorateConfig?.robotTitle}
                  </Text>
                </Stack>
              </HStack>
            </Stack>
          </Box>
          <Box mt={4} ml={4}>
            <Flex gap={6}>
              <PortraitCard onSetChatInput={props.onSetChatInput} />
              <Card
                size={'lg'}
                width={chatWidth}
                style={{
                  position: 'relative'
                }}
              >
                <Box ml={4}>
                  <Text mt={2}>{t('app:chat_decorate_guess_what_asking')}</Text>
                  {problemTexts.map((item, index) => (
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
                {props.chatDecorateConfig?.problemTexts.length > 4 && (
                  <Link
                    color={'blue'}
                    style={{
                      position: 'absolute',
                      bottom: '0.3rem',
                      left: '1rem'
                    }}
                    onClick={refresh}
                  >
                    {t('app:chat_decorate_guess_what_asking_refresh')}
                    <MyIcon name={'core/chat/refresh'} ml={2} mt={1} w={'20px'} />
                  </Link>
                )}
              </Card>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  );
};

export default React.memo(ChatDecorate);
