import React from 'react';
import { storiesOf } from '@storybook/react-native';
import LoadingStory from '../../screens/LoadingStory'


storiesOf('Basic Views', module).add('loading screen', () => (
  <LoadingStory />
))