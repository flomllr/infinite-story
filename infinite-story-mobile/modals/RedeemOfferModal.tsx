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

const Container = styled.View`
  padding: 20px;
`;

interface Props {
  onSuccess: () => void;
}

export const RedeemOfferModal = ({ onSuccess }: Props) => {
  const [code, _setCode] = useState();
  const [error, setError] = useState('');

  const setCode = (code: string) => {
    setError('');
    _setCode(code);
  };

  const handleSubmit = async () => {
    if (!code || code.length !== 6) {
      setError('This code is invalid');
      return;
    }
    const { error } = await ControlService.redeemOffer(code);
    if (error) {
      setCode('');
      setError(error);
    } else {
      onSuccess();
      ControlService.closeModal();
    }
  };

  return (
    <Container>
      <ModalTitle>Redeem an offer</ModalTitle>
      <Space h={'10px'} />

      {error ? <ErrorBox>{error}</ErrorBox> : undefined}
      <PixelInput
        style={{ height: 38 }}
        placeholder={'Enter offer code'}
        value={code}
        onChangeText={setCode}
        onSubmit={handleSubmit}
      />
      <Space h={'10px'} />
      <PixelButton label={'Redeem Offer'} onPress={handleSubmit} primary />
    </Container>
  );
};
