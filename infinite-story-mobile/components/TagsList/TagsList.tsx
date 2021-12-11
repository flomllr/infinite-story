import React from 'react';
import styled from 'styled-components/native';
import { ScrollView, TouchableOpacity } from 'react-native';
import { MarketplaceTags } from '../../types';
import { colors } from '../../theme';
import { DefaultText } from '../shared';
import { useMainStore } from '../../hooks/useMainStore';

const Container = styled.View`
  flex-direction: row;
`;

const TagContainer = styled.View`
  border: 2px solid ${p => (p.selected ? colors.primary : '#fff')};
  align-items: center;
  justify-content: center;
  padding-right: 4px;
  padding-left: 4px;
  margin-right: 7px;
`;

const Tag = styled(DefaultText)``;

export const OrderedMarketplaceTags: MarketplaceTags[] = Object.values(
  MarketplaceTags
);

interface Props {
  selectedTags: string[];
  onPressTag: (tag: string) => void;
  filterSimple?: boolean;
}

export const TagsList = ({ onPressTag, selectedTags, filterSimple }: Props) => {
  const mainStore = useMainStore();

  const filterTags = (t: MarketplaceTags) => {
    if (filterSimple && t === MarketplaceTags.SIMPLE) {
      return false;
    }

    if (mainStore.hideIllegalFeaturesFromApple && t === MarketplaceTags.NSFW) {
      return false;
    }

    return true;
  };

  return (
    <Container>
      <ScrollView horizontal={true} style={{ paddingBottom: 10 }}>
        {OrderedMarketplaceTags.filter(filterTags).map(t => (
          <TouchableOpacity key={t} onPress={() => onPressTag(t)}>
            <TagContainer selected={selectedTags.includes(t)}>
              <Tag>{t}</Tag>
            </TagContainer>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Container>
  );
};
