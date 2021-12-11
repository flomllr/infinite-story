import React, { ReactNode, useState } from 'react';
import styled from 'styled-components/native';
import { withNavigation } from 'react-navigation';
import { colors } from '../../theme';
import Header from '../../components/Header';
import { useEffect } from 'react';
import { useNavigation } from '../../hooks/useNavigation';

const Container = styled.SafeAreaView`
  background-color: ${colors.background};
  flex: 1;
`;

interface Props {
  onClose?: () => void;
  children: ReactNode;
  style?: Record<string, any>;
  open?: boolean;
  rightButtons?: ReactNode[];
}

export const FullscreenModal = ({
  children,
  style,
  onClose,
  open,
  rightButtons
}: Props) => {
  const { navigation } = useNavigation();
  const handleClose = () => {
    navigation.goBack();
    onClose && onClose();
  };

  const [prevOpen, setPrevOpen] = useState<boolean>();

  useEffect(() => {
    if (prevOpen && !open) {
      handleClose();
    }
    setPrevOpen(open);
  }, [open]);

  return (
    <Container style={style}>
      <Header leftAction={handleClose} rightButtons={rightButtons} />
      {children}
    </Container>
  );
};
