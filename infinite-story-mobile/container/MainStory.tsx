import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import CreateStoryScreen from '../screens/CreateStoryScreen';
import Story from '../screens/Story';

class MainStory extends Component<any, any> {
  render() {
    const { mainStore } = this.props;
    return mainStore.creatingStory ? <CreateStoryScreen /> : <Story />;
  }
}

export default inject('mainStore')(observer(MainStory));
