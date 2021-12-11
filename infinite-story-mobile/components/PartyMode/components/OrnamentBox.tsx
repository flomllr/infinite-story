import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';

const Wrapper = styled.View`
  border: 3px solid #fff;
  flex: 1;
`;

const Ornaments = styled.View`
  position: absolute;
  height: 100%;
  width: 100%;
`;

const OrnamentsBlock = styled.View`
  background-color: #ffffff;
  position: absolute;
`;

const BigOrnamentBlock = styled(OrnamentsBlock)`
  width: 11px;
  height: 11px;
`;

const SmallOrnamentBlock = styled(OrnamentsBlock)`
  width: 5px;
  height: 5px;
`;

interface Props {
  children: any;
  hideOrnament?: boolean;
}

const TopLeftCorner = () => (
  <>
    <SmallOrnamentBlock style={{ top: 4, left: 18 }} />
    <BigOrnamentBlock style={{ top: 4, left: 4 }} />
    <SmallOrnamentBlock style={{ top: 18, left: 4 }} />
  </>
);

const TopRightCorner = () => (
  <>
    <SmallOrnamentBlock style={{ top: 4, right: 18 }} />
    <BigOrnamentBlock style={{ top: 4, right: 4 }} />
    <SmallOrnamentBlock style={{ top: 18, right: 4 }} />
  </>
);

const BottomLeftCorner = () => (
  <>
    <SmallOrnamentBlock style={{ bottom: 4, left: 18 }} />
    <BigOrnamentBlock style={{ bottom: 4, left: 4 }} />
    <SmallOrnamentBlock style={{ bottom: 18, left: 4 }} />
  </>
);

const BottomRightCorner = () => (
  <>
    <SmallOrnamentBlock style={{ bottom: 4, right: 18 }} />
    <BigOrnamentBlock style={{ bottom: 4, right: 4 }} />
    <SmallOrnamentBlock style={{ bottom: 18, right: 4 }} />
  </>
);

export const OrnamentBox = ({ children }: Props) => (
  <Wrapper>
    <Ornaments>
      <TopLeftCorner />
      <TopRightCorner />
      <BottomLeftCorner />
      <BottomRightCorner />
    </Ornaments>
    {children}
  </Wrapper>
);
