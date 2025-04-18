import React from 'react';
import { Flex, FlexProps } from '@chakra-ui/react';
import MyIcon from './index';
import MyTooltip from '../MyTooltip';

type Props = FlexProps & {
  icon: string;
  size?: string;
  onClick?: () => void;
  hoverColor?: string;
  hoverBg?: string;
  hoverBorderColor?: string;
  tip?: string;
  isLoading?: boolean;
};

const MyIconButton = ({
  icon,
  onClick,
  hoverColor = 'primary.600',
  hoverBg = 'myGray.05',
  hoverBorderColor = '',
  size = '1rem',
  tip,
  isLoading = false,
  ...props
}: Props) => {
  return (
    <MyTooltip label={tip}>
      <Flex
        position={'relative'}
        p={1}
        color={'myGray.500'}
        rounded={'sm'}
        alignItems={'center'}
        bg={'transparent'}
        transition={'background 0.1s'}
        cursor={'pointer'}
        _hover={{
          bg: hoverBg,
          color: hoverColor,
          borderColor: hoverBorderColor
        }}
        onClick={() => {
          if (isLoading) return;
          onClick?.();
        }}
        sx={{ userSelect: 'none' }}
        {...props}
      >
        <MyIcon name={isLoading ? 'common/loading' : (icon as any)} w={size} />
      </Flex>
    </MyTooltip>
  );
};

export default MyIconButton;
