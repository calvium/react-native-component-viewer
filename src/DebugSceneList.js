import React, {Component, PropTypes} from 'react';

import {View, StyleSheet, Text, TouchableHighlight} from 'react-native';
import {getTestScenes} from './TestRegistry';

import SearchableList from './SearchableList';
import {colors} from './theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectedComponentWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.lightGrayColor,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 100,
    height: 30,
    backgroundColor: colors.transparentGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.whiteColor,
  },
});

/**
 * Fills SearchableList with list of scenes.
 * Displays scenes full-screen when tapped, along with
 * a small [CLOSE] button to close them again.
 */
class DebugSceneList extends Component {
  constructor(props) {
    super(props);

    const allScenes = getTestScenes();
    this.state = {
      all: allScenes,
      modalVisible: false,
      selectedComponent: undefined,
    };

    this.onHideScene = () => this.setState({modalVisible: false, selectedComponent: undefined});

    this.onPressRow = data => this.setState({modalVisible: true, selectedComponent: data.component});
  }

  render() {
    return (
      <View style={styles.container}>
        <SearchableList onClose={this.props.onClose} onPressRow={this.onPressRow} items={this.state.all} />
        {this.state.modalVisible
          ? [
              <View key={'modal1'} style={styles.selectedComponentWrapper}>
                {this.state.selectedComponent}
              </View>,
              <TouchableHighlight key={'modal2'} style={styles.closeButton} onPress={this.onHideScene}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableHighlight>,
            ]
          : undefined}
      </View>
    );
  }
}

DebugSceneList.defaultProps = {
  onClose: () => {},
};

DebugSceneList.propTypes = {
  onClose: PropTypes.func,
};

export default DebugSceneList;
