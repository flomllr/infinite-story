import React, { useState } from 'react';
import { MarketplaceTags, PlayerStatus } from '../../types';
import { Nickname } from '../Nickname';
import {
  generateAnimeName,
  generateSciFiName,
  generateFantasyName,
  capitalize
} from '../../utils';
import { useEffect } from 'react';

interface Props {
  Wrapper: Function;
  tag?: string;
  nickname?: string;
  playerStatus?: PlayerStatus;
}

export const RandomName = ({ Wrapper, tag, nickname, playerStatus }: Props) => {
  const getRandomName = () => {
    console.log('Generating random name');
    if (Math.random() > 0.9) {
      return (
        <Nickname
        nickname={Math.random() > 0.5 ? 'Flo' : 'Justin'}
        status={PlayerStatus.INFINITE}
        fontSize={17}
        />
      )
    }

    if (nickname && Math.random() > 0.5) {
      return (
        <Nickname
          fontSize={17}
          nickname={nickname}
          status={playerStatus || PlayerStatus.PEASANT}
        />
      );
    }

    if (tag === MarketplaceTags.ANIME) {
      return capitalize(generateAnimeName());
    }

    if (tag === MarketplaceTags.SCI_FI) {
      return capitalize(generateSciFiName());
    }

    return capitalize(generateFantasyName());
  };

  const [name, setName] = useState(getRandomName());

  useEffect(() => {
    console.log('Setting useEffect');
    const interval = setInterval(() => setName(getRandomName()), 2000);

    return () => clearInterval(interval);
  }, []);

  return <Wrapper>{name}</Wrapper>;
};
