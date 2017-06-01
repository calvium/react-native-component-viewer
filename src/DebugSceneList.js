import React, {Component, PropTypes} from 'react';

import {View, StyleSheet, Text, TouchableHighlight, Alert, ScrollView} from 'react-native';
import {getTests} from './TestRegistry';
import type {RegisteredItemType} from './TestRegistry';
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
  componentModalScrollView: {
    alignItems: 'center',
  },
  componentWrapper: {
    margin: 20,
    alignSelf: 'stretch',
  },
  componentTitle: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayColor,
    color: colors.grayColor,
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

    const allScenes = getTests();
    this.state = {
      all: allScenes,
      modalVisible: false,
      selectedItem: undefined,
    };

    this.onHideScene = () =>
      this.setState({modalVisible: false, selectedItem: undefined});

    this.onPressRow = (data: RegisteredItemType) => {
      this.setState({
        modalVisible: true,
        selectedItem: data,
      });
    };
  }

  renderSceneModal() {
    return (
      <View key={'modal1'} style={[styles.selectedComponentWrapper, this.state.selectedItem && this.state.selectedItem.wrapperStyle]}>
        {this.state.selectedItem.component}
      </View>
    );
  }

  renderComponentModal() {
    const {selectedItem}:{ selectedItem: RegisteredItemType } = this.state;
    return (
      <View key={'modal1'} style={[styles.selectedComponentWrapper, selectedItem && selectedItem.wrapperStyle]}>
        <ScrollView contentContainerStyle={styles.componentModalScrollView} automaticallyAdjustContentInsets={true}>
          {selectedItem.states.map((i: RegisteredItemType) => {
            return <View key={`${i.name}_${i.title}`} style={[styles.componentWrapper, i.wrapperStyle]}>
              <Text style={styles.componentTitle}>{i.title}</Text>
              {i.component}
            </View>
          })}
        </ScrollView>
      </View>
    );
  }

  renderModal() {
    return [
      this.state.selectedItem.type === 'scene' ? this.renderSceneModal() : this.renderComponentModal(),
      <TouchableHighlight key={'modal2'} style={styles.closeButton} onPress={this.onHideScene}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableHighlight>,
    ];
  }

  render() {
    return (
      <View style={styles.container}>
        <SearchableList onClose={this.props.onClose} onPressRow={this.onPressRow} items={this.state.all} />
        {this.state.modalVisible ? this.renderModal() : undefined}
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
