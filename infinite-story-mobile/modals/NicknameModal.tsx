import React, { useState } from 'react';
import styled from 'styled-components/native';
import { fonts, colors } from '../theme';
import { PixelInput } from '../components/PixelInput';
import PixelButton from '../components/PixelButton';
import ControlService from '../services/ControlService';
import { Space } from '../components/shared';

const ModalTitle = styled.Text`
  font-family: ${fonts.semiBold};
  color: ${colors.defaultText};
  font-size: 18px;
  padding-bottom: 10px;
  align-self: center;
`;

const ErrorBox = styled.Text`
  font-family: ${fonts.regular};
  color: ${colors.primary};
  font-size: 14px;
  padding-bottom: 10px;
  align-self: center;
`;

interface Props {
  onSuccess: () => void;
}

export const NicknameModal = ({ onSuccess }: Props) => {
  const [nickname, _setNickname] = useState();
  const [error, setError] = useState('');

  const setNickname = (name: string) => {
    setError('');
    _setNickname(name);
  };

  const handleSubmit = async () => {
    if (!nickname || nickname.length <= 2 || nickname.length > 18) {
      setError('This username is invalid');
      return;
    }
    const { error } = await ControlService.setNickname(nickname);
    if (error) {
      setNickname('');
      setError('Username not available');
    } else {
      onSuccess();
      ControlService.closeModal();
    }
  };

  return (
    <>
      <ModalTitle>Set your nickname</ModalTitle>
      <Space h={'10px'} />

      {error ? <ErrorBox>{error}</ErrorBox> : undefined}
      <PixelInput
        style={{ height: 38 }}
        placeholder={'Enter nickname'}
        value={nickname}
        onChangeText={setNickname}
        onSubmit={handleSubmit}
      />
      <Space h={'5px'} />
      <PixelButton label={'Submit'} onPress={handleSubmit} primary />
    </>
  );
};
