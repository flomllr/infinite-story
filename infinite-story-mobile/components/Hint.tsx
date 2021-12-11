import React, { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';
import ApiService from '../services/ApiService';
import { colors } from '../theme';
import { DefaultText } from './shared';
import debounce from 'debounce';

enum HintStatus {
  GOOD = 'GOOD',
  BAD = 'BAD',
  WARNING = 'WARNING'
}

const HintContainer = styled.View`
  align-items: center;
  margin-left: 16px;
  margin-right: 16px;
  padding-top: 10px;
`;

const HintText = styled(DefaultText)`
  font-size: 13px;
  color: ${p => {
    switch (p.status) {
      case HintStatus.GOOD:
        return colors.gold;
      case HintStatus.WARNING:
        return colors.warning;
      case HintStatus.BAD:
        return colors.primary;
      default:
        return colors.greyed;
    }
  }};
`;

interface Props {
  typing: string;

  actionType: 'ACT_SAY' | 'ACT_DO';
  infering: boolean;
}

const computeHint = async (
  text: string,
  actionType: 'ACT_SAY' | 'ACT_DO'
): Promise<{ status: HintStatus; message: string }> => {
  const pos =
    text && text.length > 0 ? (await ApiService.getPos(text)).pos : [];
  // So three cases
  // Starts with a verb, ask to add pronoun
  // Starts with I, ask to start with you
  // It should be an ACT_SAY
  // ends with ? or !
  // Starts with an ADV
  const splittedText = text.toLowerCase().split(' ');
  const safeFirstPos = pos.length > 0 ? pos[0] : 'NONE';
  if (actionType === 'ACT_DO') {
    if (text.length === 0) {
      return {
        status: HintStatus.WARNING,
        message:
          'Type something first! Or use "Tell me more" to continue the story without action.'
      };
    } else if (text.toLowerCase().includes('tell me')) {
      return {
        status: HintStatus.BAD,
        message:
          'Don\'t type "Tell me more"!. Press the button underneath the text field instead.'
      };
    } else if (safeFirstPos === 'VERB') {
      return {
        status: HintStatus.BAD,
        message:
          'You need to have a pronoun like "You" or "We" at the beginning of your action'
      };
    } else if (splittedText.length > 0 && splittedText[0] === 'i') {
      return {
        status: HintStatus.BAD,
        message:
          'Don\'t write in the first person. Start your action with "You"'
      };
    } else if (
      ['?', '!'].includes(text.slice(-1)) ||
      safeFirstPos === 'ADV' ||
      ["'", '"', '"', '”', '“', '‘', '’', '„', '“'].includes(text[0])
    ) {
      return {
        status: HintStatus.WARNING,
        message:
          'It looks like you are trying to say something. Press "Do" to switch to "Say" mode'
      };
    } else if (text.length < 15) {
      return {
        status: HintStatus.WARNING,
        message:
          'This is too short. Longer actions give more content to the AI and lead to better stories'
      };
    } else {
      return {
        status: HintStatus.GOOD,
        message: 'Looks good!'
      };
    }
  } else {
    if (text.length === 0) {
      return {
        status: HintStatus.WARNING,
        message:
          'Type something first! Or use "Tell me more" to continue the story without action.'
      };
    } else if (safeFirstPos === 'VERB') {
      return {
        status: HintStatus.BAD,
        message:
          'It looks like you are trying to do something. Press "Say" to switch to "Do" mode'
      };
    } else if (text.length < 15) {
      return {
        status: HintStatus.WARNING,
        message:
          'This is too short. Longer actions give more content to the AI and lead to better stories'
      };
    } else if (text.toLowerCase().includes('tell me')) {
      return {
        status: HintStatus.BAD,
        message:
          'Don\'t type "Tell me more"!. Use the button underneath the text field'
      };
    } else {
      return {
        status: HintStatus.GOOD,
        message: 'Looks good!'
      };
    }
  }
};

const Hint = ({ typing, actionType, infering }: Props) => {
  const [hintState, setHintState] = useState({
    status: HintStatus.WARNING,
    message: 'Type something first!'
  });

  const compute = useCallback(
    debounce((typing, actionType, infering) => {
      if (infering) {
        setHintState({
          status: HintStatus.GOOD,
          message:
            "Let's wait for the story to be generated. Remember that you can long press a piece of the story to rollback to it!"
        });
      } else {
        computeHint(typing, actionType).then(h => {
          setHintState(h);
        });
      }
    }, 300),
    []
  );
  useEffect(() => {
    compute(typing, actionType, infering);
  }, [typing, actionType, infering]);
  return (
    <HintContainer>
      <HintText status={hintState.status}>
        <DefaultText>Hint:</DefaultText> {hintState.message}
      </HintText>
    </HintContainer>
  );
};
export default Hint;
