import styled from 'styled-components/native';
import { colors, fonts } from '../theme';

export const ContentWrapper = styled.View`
  flex: 1;
  align-content: center;
`;

export const CenteredContent = styled.View`
  flex: 1;
  justify-content: center;
  align-content: center;
`;

export const Content = styled.View`
  flex: 1;
  justify-content: flex-start;
  padding-top: 40px;
`;

export const DefaultText = styled.Text`
  color: ${colors.defaultText};
  font-family: ${fonts.regular};
`;

export const CenteredText = styled(DefaultText)`
  text-align: center;
`;

export const Headline = styled(DefaultText)`
  font-size: 20px;
  text-align: center;
`;

export const HeadlineGold = styled(DefaultText)`
  font-size: 25px;
  text-align: center;
  font-family: ${fonts.semiBold};
  color: ${colors.gold};
`;

export const HeadlineFloatLeft = styled(DefaultText)`
  font-size: 20px;
  text-align: left;
`;

export const SubHeadlineLightGray = styled(DefaultText)`
  font-size: 18px;
  color: ${colors.lightgray};
  text-align: center;
`;

export const SubHeadline = styled(DefaultText)`
  font-size: 16px;
  color: ${colors.greyed};
  text-align: center;
`;

export const SubHeadlineFloatLeft = styled(DefaultText)`
  font-size: 16px;
  color: ${colors.greyed};
  text-align: center;
  text-align: left;
`;

export const SmallerSubHeadlineFloatLeft = styled(DefaultText)`
  font-size: 14px;
  color: ${colors.greyed};
  text-align: center;
  text-align: left;
`;

export const Space = styled.View<{ w: string | number; h: string | number }>`
  ${p => (p.w ? 'width:' + (typeof p.w === 'number' ? p.w + 'px' : p.w) : '')};
  ${p => (p.h ? 'height:' + (typeof p.h === 'number' ? p.h + 'px' : p.h) : '')};
`;

export const HeaderButtonContainer = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

export const HeaderSymbolText = styled(DefaultText)`
  font-size: 30px;
  width: 20px;
  margin-right: 10px;
  font-family: ${fonts.regular};
`;

export const HeaderButtonText = styled(DefaultText)`
  font-size: 13px;
  font-family: ${fonts.regular};
`;

export const PageTitle = styled(DefaultText)`
  font-size: 25px;
  margin-bottom: 10px;
  font-family: ${fonts.regular};
`;

export const MarginWrapper = styled.View`
  ${p => (p.flexon ? 'flex: 1;' : '')}
  margin: 0 ${p => p.marginset || 20}px;
`;

export const SimpleTextInput = styled.TextInput`
  font-family: ${fonts.regular};
  font-size: 15px;
  color: ${colors.defaultText};
  border-bottom-color: ${colors.defaultText};
  border-bottom-width: 1px;
`;
