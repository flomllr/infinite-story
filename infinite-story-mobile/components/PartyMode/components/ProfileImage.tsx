import React from 'react';
import styled from 'styled-components/native';
import { Image } from 'react-native';
import { portraits } from '../../../assets/portraits';

interface Props {
  type: string;
  size: number;
  customMargin?: string;
}

const ImageWrapper = styled.View<{ customMargin?: string; size: number }>`
  height: ${p => p.size}px;
  width: ${p => p.size}px;
  ${p => (p.customMargin ? `margin: ${p.customMargin};` : '')}
`;

export const ProfileImage = ({ type, customMargin, size }: Props) => (
  <ImageWrapper customMargin={customMargin} size={size}>
    <Image
      style={{
        width: size,
        height: size
      }}
      source={
        portraits[type] || require('../../../assets/entities/gandalf.png')
      }
    />
  </ImageWrapper>
);
