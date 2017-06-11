import React, {Component, PropTypes} from 'react';

import {View, StyleSheet, Text, TouchableHighlight, Alert, ScrollView, AsyncStorage} from 'react-native';
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
    marginHorizontal: 20,
    alignSelf: 'stretch',
  },
  componentTitle: {
    color: colors.grayColor,
    marginBottom: 5,
    marginTop: 20,
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

const SAVED_SEARCH_KEY = 'com.calvium.react-native-component-viewer.savedSearch';

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
      search: '', // loaded in componentDidMount
    };

    this.onHideScene = () => this.setState({modalVisible: false, selectedItem: undefined});

    this.onPressRow = (data: RegisteredItemType) => {
      this.setState({
        modalVisible: true,
        selectedItem: data,
      });
    };

    // TextInput calls this when text changed.
    // We don't need to set the state here.
    this.handleSearchChanged = search => {
      if (this.props.saveSearch) {
        AsyncStorage.setItem(SAVED_SEARCH_KEY, search);
      }
    };
  }

  componentDidMount() {
    // Load saved value
    if (this.props.saveSearch) {
      AsyncStorage.getItem(SAVED_SEARCH_KEY).then(search => this.setState({search: search || ''}));
    }
  }

  renderSceneModal() {
    return (
      <View
        key={'modal1'}
        style={[styles.selectedComponentWrapper, this.state.selectedItem && this.state.selectedItem.wrapperStyle]}
      >
        {this.state.selectedItem.component}
      </View>
    );
  }

  renderComponentModal() {
    const {selectedItem}: {selectedItem: RegisteredItemType} = this.state;
    return (
      <View key={'modal1'} style={[styles.selectedComponentWrapper, selectedItem && selectedItem.wrapperStyle]}>
        <ScrollView contentContainerStyle={styles.componentModalScrollView} automaticallyAdjustContentInsets={true}>
          {selectedItem.states.map((i: RegisteredItemType) => {
            return [
              <Text key={`${i.name}_${i.title}_title`} style={styles.componentTitle}>{i.title}</Text>,
              <View key={`${i.name}_${i.title}_component`} style={[styles.componentWrapper, i.wrapperStyle]}>
                {i.component}
              </View>,
            ];
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
        <SearchableList
          search={this.state.search}
          onClose={this.props.onClose}
          onPressRow={this.onPressRow}
          onSearchChanged={this.handleSearchChanged}
          items={this.state.all}
          saveSearch={this.props.saveSearch}
        />
        {this.state.modalVisible ? this.renderModal() : undefined}
      </View>
    );
  }
}

DebugSceneList.defaultProps = {
  onClose: () => {},
  saveSearch: true,
};

DebugSceneList.propTypes = {
  onClose: PropTypes.func,
  saveSearch: PropTypes.bool,
};

export default DebugSceneList;
