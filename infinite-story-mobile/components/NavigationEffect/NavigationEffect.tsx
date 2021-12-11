import React from 'react';
import { useNavigationEffect } from '../../hooks/useNavigationEffect';

interface Props {
  effect: (prev: string, curr: string) => void;
}

export const NavigationEffect = ({ effect }: Props) => {
  useNavigationEffect(effect);
  return <></>;
};
