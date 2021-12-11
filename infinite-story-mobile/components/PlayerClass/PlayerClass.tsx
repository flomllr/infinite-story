import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import styled from 'styled-components/native';
import { MovingCursor } from '../MovingCursor';
import { DefaultText } from '../shared';
import { portraits } from '../../assets/portraits';
import { colors, fonts } from '../../theme';
import { GoldAmount } from '../GoldAmount';
import { Nickname } from '../Nickname';
import { PlayerStatus } from '../../types';

export interface Props {
  onPress?: () => void;
  portrait: string;
  name: string;
  description?: string;
  author?: { nickname?: string; status: PlayerStatus };
  selected?: boolean;
  key?: string;
  price?: number;
  playedTimes?: number;
  boughtTimes?: number;
  owned?: boolean;
  yours?: boolean;
  clickable?: boolean;
  nopad?: boolean;
}

const Container = styled.View`
  flex-direction: row;
  justify-content: space-between;
  ${p => (p.paddingset ? 'padding-left: 20px' : '')};
`;

const SelectIcon = styled.View`
  position: absolute;
  top: 24px;
  z-index: 999;
`;

const Text = styled(DefaultText)`
  font-size: 18px;
`;

const Name = styled(DefaultText)`
  font-size: 19px;
`;

const Description = styled(DefaultText)`
  font-size: 13px;
  color: ${colors.greyed};
`;

const DescriptionContainer = styled.View`
  flex: 1;
  margin-left: 10px;
  flex-direction: column;
`;

const StatsContainer = styled.View`
  justify-content: space-evenly;
  flex-direction: row;
  margin-top: 3px;
`;

const StatRow = styled.View`
  flex-direction: row;
  margin-left: 5px;
`;

const StatIcon = styled.Image`
  height: 16px;
  width: 16px;
  margin-right: 1px;
`;

const StatText = styled(DefaultText)`
  font-size: 13px;
`;

const GoldContainer = styled.View`
  align-items: flex-end;
  justify-content: center;
`;

const FatText = styled(DefaultText)`
  text-transform: uppercase;
  font-family: ${fonts.semiBold};
  font-size: 17px;
`;

const Owned = styled(FatText)`
  color: ${colors.actSay};
  padding-left: 10px;
`;

const Yours = styled(FatText)`
  color: ${colors.lightgray};
  padding-left: 20px;
`;

export const PlayerClass = ({
  onPress,
  selected,
  portrait,
  name,
  description,
  price,
  playedTimes,
  boughtTimes,
  author,
  owned,
  yours,
  nopad,
  clickable = true
}: Props) => {
  const marketMode = playedTimes != null && boughtTimes != null;
  return (
    <TouchableOpacity onPress={onPress} disabled={!clickable}>
      <Container paddingset={!nopad && !marketMode}>
        {selected && (
          <SelectIcon>
            <MovingCursor>
              <Text>&gt;</Text>
            </MovingCursor>
          </SelectIcon>
        )}
        <Image style={{ width: 70, height: 70 }} source={portraits[portrait]} />
        <DescriptionContainer>
          {author && (
            <Nickname
              status={author.status}
              nickname={author.nickname}
              fontSize={11}
            />
          )}
          <Name numberOfLines={1}>{name}</Name>
          <Description numberOfLines={2}>{description}</Description>
        </DescriptionContainer>
        <GoldContainer>
          {price && !owned && !yours && (
            <GoldAmount
              amount={price}
              size={25}
              style={{ paddingLeft: 10 }}
              pad={3}
            />
          )}
          {owned && !yours && <Owned>Owned</Owned>}
          {yours && <Yours>Yours</Yours>}
          {marketMode && (
            <StatsContainer>
              <StatRow>
                <StatIcon source={require('../../assets/icons/used.png')} />
                <StatText>{playedTimes}</StatText>
              </StatRow>
              <StatRow>
                <StatIcon source={require('../../assets/icons/bought.png')} />
                <StatText>{boughtTimes}</StatText>
              </StatRow>
            </StatsContainer>
          )}
        </GoldContainer>
      </Container>
    </TouchableOpacity>
  );
};
