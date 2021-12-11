import styled from 'styled-components/native';
import { colors, fonts } from '../theme';

export const DefaultText = styled.Text`
  color: ${colors.defaultText};
  font-family: ${fonts.semiBold};
`;

export const Headline = styled(DefaultText)`
  font-size: 20px;
  text-align: center;
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
