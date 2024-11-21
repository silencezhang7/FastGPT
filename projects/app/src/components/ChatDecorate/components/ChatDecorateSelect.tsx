import { AppChatDecorateConfigType } from '@fastgpt/global/core/app/type';
import { defaultAppChatDecorateConfigType } from '@fastgpt/global/core/app/constants';
import {
  Box,
  BoxProps,
  Button,
  Flex,
  HStack,
  Input,
  ModalBody,
  Stack,
  Switch,
  useDisclosure
} from '@chakra-ui/react';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useTranslation } from 'next-i18next';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { useMemo } from 'react';
import ChatFunctionTip from '@/components/core/app/Tip';
import { useToast } from '@fastgpt/web/hooks/useToast';
import MyModal from '@fastgpt/web/components/common/MyModal';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import { SmallAddIcon, SmallCloseIcon } from '@chakra-ui/icons';

const GuessWhatAsking = ({
  value = defaultAppChatDecorateConfigType,
  onChange
}: {
  value?: AppChatDecorateConfigType;
  onChange: (e: AppChatDecorateConfigType) => void;
}) => {
  const { t } = useTranslation();
  const { problemTexts } = value;
  const { toast } = useToast();
  return (
    <>
      <Box mt={6}>
        <Flex alignItems={'center'}>
          <HStack spacing={1} flex={'1 0 0'}>
            <FormLabel>{t('app:chat_decorate_guess_what_asking_title')}</FormLabel>
            <QuestionTip label={t('app:chat_decorate_guess_what_asking_tip')} />
          </HStack>
          <Button
            variant={'transparentBase'}
            leftIcon={<SmallAddIcon />}
            iconSpacing={1}
            size={'sm'}
            color={'myGray.600'}
            mr={'-5px'}
            onClick={() => {
              if (problemTexts === undefined || problemTexts.length < 8) {
                onChange({
                  ...value,
                  problemTexts: [...problemTexts, '']
                });
              } else {
                toast({
                  title: t('common:support.user.inform.System message'),
                  description: t('app:chat_decorate_max_tip'),
                  status: 'error'
                });
              }
            }}
          >
            {t('common:common.Add New')}
          </Button>
        </Flex>
        <Box mt={4}>
          <Stack spacing={2}>
            {value.problemTexts?.map((item, index) => (
              <>
                <Flex alignItems={'center'} key={index}>
                  <Input
                    placeholder={`${t('app:chat_decorate_guess_what_asking_placeholder')} ${index + 1}`}
                    value={item}
                    onChange={(e) => {
                      const array = problemTexts.map((text, i) =>
                        i === index ? e.target.value : text
                      );
                      onChange({
                        ...value,
                        problemTexts: array
                      });
                    }}
                  />
                  <SmallCloseIcon
                    ml={3}
                    style={{
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const array = problemTexts.filter((_, i) => i !== index);
                      onChange({
                        ...value,
                        problemTexts: array
                      });
                    }}
                  />
                </Flex>
              </>
            ))}
          </Stack>
        </Box>
      </Box>
    </>
  );
};
const ChatDecorateSelect = ({
  value = defaultAppChatDecorateConfigType,
  onChange,
  ...labelStyle
}: Omit<BoxProps, 'onChange'> & {
  value?: AppChatDecorateConfigType;
  onChange: (e: AppChatDecorateConfigType) => void;
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const formLabel = useMemo(
    () => (value.open ? t('common:core.app.whisper.Open') : t('common:core.app.whisper.Close')),
    [t, value.open]
  );
  return (
    <Flex alignItems={'center'}>
      <MyIcon name={'core/app/simpleMode/chatHeader'} mr={2} w={'20px'} />
      <FormLabel color={'myGray.600'} {...labelStyle}>
        {t('app:chat_decorate')}
      </FormLabel>
      <ChatFunctionTip type={'chatDecorate'} />
      <Box flex={1} />
      <MyTooltip label={t('app:config_chat_decorate')}>
        <Button
          variant={'transparentBase'}
          iconSpacing={1}
          size={'sm'}
          mr={'-5px'}
          color={'myGray.600'}
          onClick={onOpen}
        >
          {formLabel}
        </Button>
      </MyTooltip>
      <MyModal
        iconSrc={'core/app/simpleMode/chatHeader'}
        title={t('app:chat_decorate')}
        isOpen={isOpen}
        onClose={onClose}
        maxW={['90vw', '728px']}
        w={'100%'}
      >
        <ModalBody>
          <HStack>
            <FormLabel flex={'1 0 0'}>{t('app:chat_decorate')}</FormLabel>
            <Switch
              isChecked={value.open}
              onChange={(e) => {
                onChange({
                  ...value,
                  open: e.target.checked
                });
              }}
            />
          </HStack>
          {value.open && (
            <>
              <Box mt={6}>
                <FormLabel flex={'1 0 0'}>{t('app:chat_decorate_robot_avatar')}</FormLabel>
                <Input
                  value={value.robotAvatar}
                  mt={4}
                  placeholder={t('app:chat_decorate_robot_avatar_placeholder')}
                  onChange={(e) => {
                    onChange({
                      ...value,
                      robotAvatar: e.target.value
                    });
                  }}
                />
              </Box>
              <Box mt={6}>
                <FormLabel flex={'1 0 0'}>{t('app:chat_decorate_robot_sub_title')}</FormLabel>
                <Input
                  value={value.robotSubTitle}
                  mt={4}
                  placeholder={t('app:chat_decorate_robot_sub_title_placeholder')}
                  onChange={(e) => {
                    onChange({
                      ...value,
                      robotSubTitle: e.target.value
                    });
                  }}
                />
              </Box>
              <Box mt={6}>
                <FormLabel flex={'1 0 0'}>{t('app:chat_decorate_robot_title')}</FormLabel>
                <Input
                  value={value.robotTitle}
                  mt={4}
                  placeholder={t('app:chat_decorate_robot_title_placeholder')}
                  onChange={(e) => {
                    onChange({
                      ...value,
                      robotTitle: e.target.value
                    });
                  }}
                />
              </Box>
              <GuessWhatAsking value={value} onChange={onChange} />
            </>
          )}
        </ModalBody>
      </MyModal>
    </Flex>
  );
};

export default ChatDecorateSelect;
