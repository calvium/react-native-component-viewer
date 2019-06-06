import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {View, StyleSheet, Text, TouchableHighlight, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {getTests, getTest, addUpdateListener, removeUpdateListener} from './TestRegistry';
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
  componentModalSpacer: {
    height: 30,
  },
  componentWrapper: {
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
      selectedItemKey: undefined,
      selectedItem: undefined,
      search: '', // loaded in componentDidMount
    };

    this.onHideScene = () => this.setState({modalVisible: false, selectedItem: undefined, selectedItemKey: undefined});

    // To allow hot-reloaded components to load, we need to grab
    // the item from TestRegistry at the point we tap it
    this.onPressRow = (data: RegisteredItemType) => {
      const test = getTest(data.key);
      if (!test) {
        return;
      }
      this.setState({
        modalVisible: true,
        selectedItemKey: data.key,
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

    this.handleTestsUpdated = list => {
      let selectedItem = this.state.selectedItem;
      const currentKey = this.state.selectedItemKey;
      if (list.indexOf(currentKey) !== -1) {
        console.log(`reloading ${currentKey}`);
        selectedItem = getTest(this.state.selectedItemKey);
      }

      this.setState({
        all: getTests(),
        selectedItem,
      });
    };

    this.handleListRef = ref => (this._list = ref);
  }

  componentDidMount() {
    // Load saved value
    if (this.props.saveSearch) {
      AsyncStorage.getItem(SAVED_SEARCH_KEY).then(search => this.setState({search: search || ''}));
    }

    addUpdateListener(this.handleTestsUpdated);
  }

  componentWillUnmount() {
    removeUpdateListener(this.handleTestsUpdated);
  }

  renderWithProps(Component) {
    // If we're passed a rendered component, use it as-is.
    if (!(Component instanceof Function)) {
      return Component;
    }
    // If we're passed an unrendered component, render it.
    // This list of props might grow in future.
    return (
      <Component closeThisTest={this.onHideScene} />
    );
  }

  renderSceneModal() {
    return (
      <View
        key={'component-viewer-modal'}
        style={[styles.selectedComponentWrapper, this.state.selectedItem && this.state.selectedItem.wrapperStyle]}
      >
        {this.renderWithProps(this.state.selectedItem.component)}
      </View>
    );
  }

  renderComponentModal() {
    const {selectedItem}: {selectedItem: RegisteredItemType} = this.state;
    return (
      <View
        key={'component-viewer-modal'}
        style={[styles.selectedComponentWrapper, selectedItem && selectedItem.wrapperStyle]}
      >
        <ScrollView contentContainerStyle={styles.componentModalScrollView} automaticallyAdjustContentInsets={true}>
          {selectedItem.states.map((i: RegisteredItemType) => [
            <Text key={`${i.name}_${i.title}_title`} style={styles.componentTitle}>{i.title}</Text>,
            <View key={`${i.name}_${i.title}_component`} style={[styles.componentWrapper, i.wrapperStyle]}>
              {this.renderWithProps(i.component)}
            </View>,
          ])}
          <View style={styles.componentModalSpacer} />
        </ScrollView>
      </View>
    );
  }

  renderModal() {
    return [
      this.state.selectedItem.type === 'scene' ? this.renderSceneModal() : this.renderComponentModal(),
      <TouchableHighlight key={'component-viewer-close-button'} style={styles.closeButton} onPress={this.onHideScene}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableHighlight>,
    ];
  }

  render() {
    return (
      <View style={styles.container}>
        <SearchableList
          ref={this.handleListRef}
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
