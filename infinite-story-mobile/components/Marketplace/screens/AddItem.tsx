import React, { useState } from 'react';
import styled from 'styled-components/native';
import { colors, fonts, size } from '../../../theme';
import { FullscreenModal } from '../../FullscreenModal';
import {
  PageTitle,
  MarginWrapper,
  DefaultText,
  Space
} from '../../../components/shared';
import MainStore from '../../../mobx/mainStore';
import { inject, observer } from 'mobx-react';
import {
  AdvancedPrompt,
  Prompt,
  isAdvancedPrompt,
  PlayerStatus
} from '../../../types';
import { PlayerClass } from '../../PlayerClass';
import { FlatList, TouchableOpacity, View } from 'react-native';
import PixelButton from '../../PixelButton';
import { GoldAmount } from '../../GoldAmount';
import ControlService from '../../../services/ControlService';
import AnalyticsService from '../../../services/AnalyticsService';

interface Props {
  mainStore?: MainStore;
}

const BoldTextPrimary = styled(DefaultText)`
  font-family: ${fonts.bold};
  color: ${colors.primary};
`;

const DefaultTextGrayed = styled(DefaultText)`
  color: ${colors.lightgray};
`;
const FlatListContainer = styled.View`
  flex: 1;
`;
const BottomContainer = styled.View`
  border: 3px solid #fff;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  padding-top: 10px;
`;
const SellForContainer = styled.View`
  padding-top: 2px;
  padding-bottom: 2px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PriceSelectorContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;
const IncrementText = styled(DefaultText)`
  font-size: 30px;
  font-family: ${fonts.bold}
  padding: 5px;
  color: #4BAE49
`;
const DecrementText = styled(DefaultText)`
  font-size: 30px;
  font-family: ${fonts.bold}
  padding: 5px;
  color: #AE4949
`;

const Tags = styled(DefaultText)``;
export const NSFW_BAN_LIST = [
  'penis',
  'vagina',
  'pussy',
  'cock',
  'ass',
  'boobs',
  'tits',
  'sex',
  'fuck',
  'hentai',
  'porn',
  'cunt',
  'rape'
];
export const checkStringForBlackList = (s: string): boolean => {
  for (const b of NSFW_BAN_LIST) {
    if (s.toLowerCase().includes(b)) {
      return true;
    }
  }
  return false;
};
export const detectNsfw = (prompt: Prompt | AdvancedPrompt): boolean => {
  if (Object.keys(prompt.advanced).length === 0) {
    const p = prompt as Prompt;
    let found = false;
    found = found || checkStringForBlackList(p.context);
    found = found || checkStringForBlackList(p.title);
    return found;
  } else {
    const p = prompt as AdvancedPrompt;
    let found = false;
    for (const pr of p.advanced.prompts) {
      found = found || checkStringForBlackList(pr);
    }
    found = found || checkStringForBlackList(p.context);
    found = found || checkStringForBlackList(p.advanced.name);
    found = found || checkStringForBlackList(p.advanced.description);
    found = found || checkStringForBlackList(p.advanced.location);
    return found;
  }
};
export const computeTags = (prompt: Prompt | AdvancedPrompt): string[] => {
  if (Object.keys(prompt.advanced).length === 0) {
    const tags = ['SIMPLE'];
    if (detectNsfw(prompt)) {
      tags.push('NSFW');
    }
    return tags;
  } else {
    const p = prompt as AdvancedPrompt;
    const tags = [...p.advanced.tags];
    if (detectNsfw(p)) {
      tags.push('NSFW');
    }
    return tags;
  }
};
const renderTags = (prompt: Prompt | AdvancedPrompt): string => {
  const tags = computeTags(prompt);
  return tags
    .map(t => t && t[0].toUpperCase() + t.slice(1).toLowerCase())
    .join(', ');
};
export const PriceSelector = ({
  price,
  onChange
}: {
  price: number;
  onChange: (number) => void;
}) => {
  return (
    <PriceSelectorContainer>
      <TouchableOpacity onPress={() => price > 50 && onChange(price - 50)}>
        <DecrementText>-</DecrementText>
      </TouchableOpacity>
      <GoldAmount size={30} amount={price} />
      <TouchableOpacity onPress={() => price <= 300 && onChange(price + 50)}>
        <IncrementText>+</IncrementText>
      </TouchableOpacity>
    </PriceSelectorContainer>
  );
};

export const AddItem = inject('mainStore')(
  observer(({ mainStore }: Props) => {
    const [selectedClass, setSelectedClass] = useState<Prompt | null>(null);
    const [price, setPrice] = useState(50);
    const [open, setOpen] = useState(true);
    const renderPrompts = ({ item }: { item: Prompt }) => {
      return (
        <View key={item.uid}>
          <PlayerClass
            author={
              isAdvancedPrompt(item)
                ? { nickname: 'Advanced', status: PlayerStatus.INFINITE }
                : { nickname: 'Simple', status: PlayerStatus.PEASANT }
            }
            portrait={
              isAdvancedPrompt(item) ? item.advanced.portrait : 'creative'
            }
            name={isAdvancedPrompt(item) ? item.advanced.name : item.title}
            description={
              isAdvancedPrompt(item)
                ? item.advanced.description
                : 'Not created with advanced mode'
            }
            onPress={() => setSelectedClass(item)}
          />
          <Space h={size.defaultSpaceBetween + 'px'} />
        </View>
      );
    };
    return (
      <FullscreenModal open={open}>
        <MarginWrapper flexon>
          <PageTitle>Add Item to Shop</PageTitle>
          <Space h={'10px'} />
          {/* <DefaultText>
            We recommend testing your custom classes yourself in Creative Mode
            to make sure that they lead to good stories and are fun to play
            before publishing them!
          </DefaultText> */}
          <BoldTextPrimary>
            You cannot update a class after publishing it! To update a class,
            unpublish the old one and republish the updated version.
          </BoldTextPrimary>
          <Space h={'10px'} />
          {mainStore.prompts.filter(p => Object.keys(p.advanced).length !== 0)
            .length === 0 ? (
            <>
              <DefaultTextGrayed>
                It looks like you only have classes created in the
                &quot;Simple&quot; version of Creative Studio.
              </DefaultTextGrayed>
              <Space h={'4px'} />
              <DefaultTextGrayed>
                The Advanced version of Creative Studio lets you choose a
                portrait for your class, create multiple prompts, add a grammar,
                and a lot of other cool things. Try it out!
              </DefaultTextGrayed>
            </>
          ) : (
            undefined
          )}
          <Space h={'10px'} />
          <Space h={'10px'} />
          {mainStore.prompts.length === 0 && (
            <BoldTextPrimary>
              You do not have any custom classes to publish! Go to Creative
              Studio and come back here when you want to publish it!
            </BoldTextPrimary>
          )}
          <FlatListContainer>
            <FlatList
              data={mainStore.prompts}
              renderItem={renderPrompts}
            ></FlatList>
          </FlatListContainer>
          {selectedClass && (
            <BottomContainer>
              <Space h={'5px'} />
              <View>
                <PlayerClass
                  portrait={
                    isAdvancedPrompt(selectedClass)
                      ? selectedClass.advanced.portrait
                      : 'creative'
                  }
                  name={
                    isAdvancedPrompt(selectedClass)
                      ? selectedClass.advanced.name
                      : selectedClass.title
                  }
                  description={
                    isAdvancedPrompt(selectedClass)
                      ? selectedClass.advanced.description
                      : 'Not created with advanced mode'
                  }
                />
              </View>
              <Space h={'5px'} />
              <SellForContainer>
                <DefaultText>Sell for:</DefaultText>
                <PriceSelector price={price} onChange={p => setPrice(p)} />
              </SellForContainer>
              <Tags>Tags: {renderTags(selectedClass)}</Tags>
              <Space h={'5px'} />
              <PixelButton
                onPress={() => {
                  setOpen(false);
                  ControlService.addClassToMyShop(
                    selectedClass.uid,
                    price,
                    computeTags(selectedClass)
                  );
                  AnalyticsService.addedMarketplaceClassToShop(price);
                }}
                primary
                label={'Add to your Shop'}
              />
            </BottomContainer>
          )}
        </MarginWrapper>
      </FullscreenModal>
    );
  })
);
