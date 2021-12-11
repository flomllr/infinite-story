import React, { useState } from 'react';
import { FullscreenModal } from '../FullscreenModal';
import styled from 'styled-components/native';
import { ProfileImage } from '../PartyMode/components/ProfileImage';
import { SimpleTextInput, Space, DefaultText } from '../shared';
import { View, KeyboardAvoidingView } from 'react-native';
import { colors, fonts } from '../../theme';
import PixelBorderBox from '../PixelBorderBox';
import PixelButton from '../PixelButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ControlService from '../../services/ControlService';
import ErrorService from '../../services/ErrorService';
import { inject, observer } from 'mobx-react';
import MainStore from '../../mobx/mainStore';
import { AdvancedPrompt } from '../../types';
import { useStartStory } from '../../hooks/useStartStory';
import { TagsList } from '../TagsList';
import { useNavigation } from '../../hooks/useNavigation';
import { AvoidKeyboard } from '../AvoidKeyboard';

const Container = styled.ScrollView`
  padding: 0 20px;
  flex: 1;
`;

const Row = styled.View`
  display: flex;
  flex-direction: row;
`;

const Column = styled.View`
  justify-content: center;
  flex: 1;
`;

const TextInputRow = styled(Row)`
  margin: 5px;
`;

const PixelInputInner = styled(SimpleTextInput)`
  border-bottom-width: 0px;
  padding: 10px;
`;

const Heading = styled(DefaultText)`
  font-family: ${fonts.semiBold};
  font-size: 17px;
`;

const Info = styled(DefaultText)`
  margin: 5px 0 10px 0;
  color: ${colors.greyed};
  font-size: 13px;
`;

const PixelButtonInner = styled(DefaultText)`
  font-family: ${fonts.semiBold};
  padding: 0 5px;
  font-size: 18px;
`;

const RemoveButton = styled(DefaultText)`
  color: ${colors.actDo};
  text-align: right;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  padding: 20px;
  justify-content: flex-end;
`;

const DeleteButton = styled(DefaultText)`
  color: ${colors.actDo};
`;

interface Props {
  mainStore?: MainStore;
}

export const CreateAdvancedClass = inject('mainStore')(
  observer(({ mainStore }: Props) => {
    const { navigation } = useNavigation();

    const { editCreativeClass: cc } = mainStore;

    const [className, setClassName] = useState(cc?.title || '');
    const [origin, setOrigin] = useState(cc?.advanced.location || '');
    const [description, setDescription] = useState(
      cc?.advanced.description || ''
    );
    const [context, setContext] = useState(cc?.context || '');
    const [prompts, setPrompts] = useState<string[]>(
      cc?.advanced.prompts || ['']
    );
    const [tags, setTags] = useState<string[]>(cc?.advanced.tags || []);

    const removeTag = (tag: string) => {
      const index = tags.findIndex(t => t === tag);

      if (index !== -1) {
        const newTags = [...tags];
        newTags.splice(index, 1);
        setTags(newTags);
      }
    };

    const addTag = (tag: string) => {
      setTags([...tags, tag]);
    };

    const startStory = useStartStory(mainStore);

    const handleAddPrompt = () => {
      setPrompts([...prompts, '']);
    };

    const handleRemovePrompt = (index: number) => {
      const newPrompts = [...prompts];
      newPrompts.splice(index, 1);
      setPrompts(newPrompts);
    };

    const updatePrompt = (index: number, value: string) => {
      setPrompts(prompts.map((p, i) => (i === index ? value : p)));
    };

    const handleDelete = () => {
      if (cc?.uid) {
        ControlService.deletePrompt(cc?.uid);
        navigation.goBack();
      }
    };

    const isValid = () => {
      if (context.length < 10) {
        ErrorService.uncriticalError('Your context is too short.');
        return false;
      }

      if (description.length > 50) {
        ErrorService.uncriticalError('Your description is too long.');
        return false;
      }

      if (prompts.length === 0) {
        ErrorService.uncriticalError('Please add at least one prompt.');
        return false;
      }

      if (prompts.find(p => ['.', '!', '?'].includes(p[p.length - 1]))) {
        ErrorService.uncriticalError(
          'Your prompts need to end with a cliffhanger. Do not finish your last sentence.'
        );
        return false;
      }

      if (
        !origin ||
        !className ||
        !description ||
        !context ||
        prompts.filter(p => p !== '') == null ||
        !prompts[0] ||
        tags.length === 0
      ) {
        ErrorService.uncriticalError(
          'Please fill all the fields and add at least one tag.'
        );
        return false;
      }

      return true;
    };

    const handleSave = async () => {
      setPrompts(prompts.filter(p => p !== ''));

      if (!isValid()) {
        return false;
      }

      const updatedClass = await ControlService.upsertCreativeClass({
        uid: cc?.uid,
        title: className,
        context,
        advanced: {
          description,
          name: className,
          prompts: prompts.filter(p => p !== ''),
          portrait: mainStore.editCreativeClass.advanced.portrait,
          tags,
          location: origin
        }
      });

      mainStore.setEditCreativeClass(updatedClass as AdvancedPrompt);

      if (updatedClass == null) {
        return false;
      }

      ErrorService.uncriticalError('Saved');
      return updatedClass;
    };

    const handlePlay = async () => {
      const updatedClass = await handleSave();
      if (!updatedClass) {
        return;
      }

      startStory(updatedClass);
    };

    return (
      <FullscreenModal
        rightButtons={
          cc?.uid
            ? [
                <TouchableOpacity onPress={handleDelete} key={Math.random()}>
                  <DeleteButton>Delete</DeleteButton>
                </TouchableOpacity>
              ]
            : undefined
        }
      >
        <AvoidKeyboard
          style={{
            flex: 1
          }}
        >
          <Container>
            <Row>
              <TouchableOpacity
                onPress={() => navigation.navigate('SelectPortraitModal')}
              >
                <ProfileImage
                  type={mainStore.editCreativeClass.advanced.portrait}
                  size={80}
                />
              </TouchableOpacity>
              <Space w={'10px'} />
              <Column>
                <TextInputRow>
                  <Heading>Class: </Heading>
                  <SimpleTextInput
                    placeholder={'Peasant'}
                    placeholderTextColor={colors.greyed}
                    value={className}
                    onChangeText={setClassName}
                  />
                </TextInputRow>
                <TextInputRow>
                  <Heading>From: </Heading>
                  <SimpleTextInput
                    style={{ minWidth: 100 }}
                    placeholderTextColor={colors.greyed}
                    placeholder={'Izir'}
                    value={origin}
                    onChangeText={setOrigin}
                  />
                </TextInputRow>
              </Column>
            </Row>
            <Space h={'30px'} />
            <View>
              <Heading>Tags: </Heading>
              <Info>Which category does your class belong to?</Info>
              <TagsList
                filterSimple
                selectedTags={tags}
                onPressTag={t => (tags.includes(t) ? removeTag(t) : addTag(t))}
              />
            </View>
            <Space h={'30px'} />
            <View>
              <Heading>Description: </Heading>
              <Info>
                A short description that is displayed when the class is listed.
              </Info>
              <PixelBorderBox flex={false}>
                <PixelInputInner
                  multiline
                  numberOfLines={2}
                  placeholderTextColor={colors.greyed}
                  placeholder={
                    'You started from nothing and you still have nothing.'
                  }
                  value={description}
                  onChangeText={setDescription}
                ></PixelInputInner>
              </PixelBorderBox>
            </View>
            <Space h={'30px'} />
            <View>
              <Heading>Context: </Heading>
              <Info>
                Background information to your class. It is given to the AI
                everytime a piece of the story is generated. Can include a{' '}
                {'<NAME>'} tag so players can choose their name.
              </Info>
              <PixelBorderBox flex={false}>
                <PixelInputInner
                  multiline
                  placeholderTextColor={colors.greyed}
                  placeholder={
                    "You are <NAME>, a peasant living on the kingdom of Izir. You own a pitchfork and that's it."
                  }
                  value={context}
                  onChangeText={setContext}
                ></PixelInputInner>
              </PixelBorderBox>
            </View>
            <Space h={'30px'} />
            <View>
              <Row
                style={{
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Heading>Prompts: </Heading>
                <PixelButton primary onPress={handleAddPrompt}>
                  <PixelButtonInner>+</PixelButtonInner>
                </PixelButton>
              </Row>
              <Info>
                How does the story of this class begin? Include a cliffhanger.
                Must end with an unfinished sentence. You can have multiple
                prompts for your class. A random one will be selected each time.
              </Info>
              {prompts.length > 0 ? (
                prompts.map((p, index) => (
                  <>
                    <TouchableOpacity
                      onPress={() => handleRemovePrompt(index)}
                      disabled={prompts.length < 2}
                    >
                      <RemoveButton
                        style={{
                          color:
                            prompts.length < 2 ? colors.greyed : colors.primary
                        }}
                      >
                        Remove
                      </RemoveButton>
                    </TouchableOpacity>
                    <Space h={'5px'} />
                    <PixelBorderBox key={index} flex={false}>
                      <PixelInputInner
                        multiline
                        placeholderTextColor={colors.greyed}
                        placeholder={
                          'You wake up and begin working in the fields. You see'
                        }
                        value={p}
                        onChangeText={value => updatePrompt(index, value)}
                      ></PixelInputInner>
                    </PixelBorderBox>
                    <Space h={'10px'} />
                  </>
                ))
              ) : (
                <Info>Press the + button to add a prompt.</Info>
              )}
            </View>
          </Container>
          <ButtonContainer>
            <PixelButton
              label={'Save'}
              style={{ flex: 1 }}
              onPress={handleSave}
              disabled={!mainStore.promptButtonActivated}
            ></PixelButton>
            <Space w={'10px'} />
            <PixelButton
              label={'Play'}
              primary
              style={{ flex: 1 }}
              onPress={handlePlay}
              disabled={!mainStore.promptButtonActivated}
            ></PixelButton>
          </ButtonContainer>
        </AvoidKeyboard>
      </FullscreenModal>
    );
  })
);
