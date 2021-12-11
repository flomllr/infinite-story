import React, { ReactNode, useState } from 'react';
import styled from 'styled-components/native';
import { colors } from '../../theme';
import { DefaultText } from '../shared';

const TabsRow = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: 20px;
`;

const Tab = styled.TouchableOpacity`
  margin-right: 20px;
  padding-bottom: 5px;
  border-bottom-width: 3px;
  border-bottom-color: ${p => (p.active ? colors.primary : colors.greyed)};
`;

const TabText = styled(DefaultText)`
  color: ${p => (p.active ? colors.primary : colors.greyed)};
`;

interface Props {
  tabs: {
    name: string;
    content: ReactNode;
  }[];
}

export const Tabs = ({ tabs }: Props) => {
  const [tab, setTab] = useState(0);
  return (
    <>
      <TabsRow>
        {tabs.map(({ name }, index) => (
          <Tab key={index} onPress={() => setTab(index)} active={tab === index}>
            <TabText active={tab === index}>{name}</TabText>
          </Tab>
        ))}
      </TabsRow>
      {tabs[tab].content}
    </>
  );
};
