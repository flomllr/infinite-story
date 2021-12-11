import * as React from 'react';
import { Image, Platform, ImageSourcePropType } from 'react-native';
import AutoHeightImage from 'react-native-scalable-image';

interface Props {
  uri: string;
  width?: number;
  height?: number;
  style?;
}

interface State {
  source: {};
  width: number;
  height: number;
}

export default class ScaledImage extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      source: { uri: this.props.uri },
      width: 0,
      height: 0
    };
  }

  UNSAFE_componentWillMount() {
    if (Platform.OS == 'web') {
      Image.getSize(
        this.props.uri,
        (width, height) => {
          if (this.props.width && !this.props.height) {
            this.setState({
              width: this.props.width,
              height: height * (this.props.width / width)
            });
          } else if (!this.props.width && this.props.height) {
            this.setState({
              width: width * (this.props.height / height),
              height: this.props.height
            });
          } else {
            this.setState({ width: width, height: height });
          }
        },
        error => {
          console.log(
            'ScaledImage:componentWillMount:Image.getSize failed with error: ',
            error
          );
        }
      );
    }
  }

  render() {
    const { height, width, source } = this.state;
    const { uri, width: propWidth } = this.props;
    return Platform.OS == 'web' ? (
      <Image source={source} style={[this.props.style, { height, width }]} />
    ) : (
      <AutoHeightImage
        width={propWidth}
        style={this.props.style}
        source={uri as ImageSourcePropType}
      />
    );
  }
}
