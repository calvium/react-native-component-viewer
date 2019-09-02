import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {View, StyleSheet, Text, FlatList, TextInput, TouchableHighlight, Platform} from 'react-native';

import * as R from 'ramda';
import {colors} from './theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteColor,
  },
  sceneRow: {borderBottomColor: colors.blackColor, borderBottomWidth: 1, height: 80, justifyContent: 'center'},
  sceneRowTitle: {
    color: colors.blackColor,
    marginHorizontal: 20,
    alignSelf: 'center',
    fontSize: 20,
  },
  sceneRowSubtitle: {marginHorizontal: 20, alignSelf: 'center', fontSize: 10, color: colors.grayColor},
  searchWrapper: {
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: colors.lightGrayColor,
    padding: 5,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.grayColor,
  },
  searchInput: {
    flex: 1,
    borderRadius: Platform.OS === 'ios' ? 10 : 0,
    backgroundColor: colors.whiteColor,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.grayColor,
    padding: 10,
    minHeight: 40,
  },
  doneButton: {
    padding: 6,
    borderRadius: 5,
    margin: 4,
  },
  doneButtonText: {
    color: colors.blackColor,
    fontWeight: 'bold',
  },
  noItemsText: {
    color: colors.blackColor,
    alignSelf: 'center',
    fontSize: 20,
    marginTop: 20,
  },
});

/**
 * Row on the table. Used to display name and title for a single registered scene
 */
const SceneRow = ({name, title, onPress}) => (
  <TouchableHighlight onPress={onPress} underlayColor={colors.lightGrayColor} style={styles.sceneRow}>
    <View>
      <Text style={styles.sceneRowTitle}>{name}</Text>
      {title
        ? <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.sceneRowSubtitle}>{title}</Text>
        : undefined}
    </View>
  </TouchableHighlight>
);

SceneRow.propTypes = {name: PropTypes.string, title: PropTypes.string, onPress: PropTypes.func};

/**
 * A listview with a TextInput at the top that filters the list based on the search (lowercase match of name or title)
 */
class SearchableList extends Component {
  constructor(props) {
    super(props);

    const allItems = this.props.items;
    this.state = {
      all: allItems,
      ds: allItems,
      selectedComponent: undefined,
      search: this.props.search,
    };

    this.renderRow = ({item}) => <SceneRow onPress={() => this.props.onPressRow(item)} {...item} />;

    // type sets state - state change performs actual searching!
    this.handleSearchInputChanged = filter => this.setState({search: filter});

    /**
     * Search - lowercase everything. Search on name and title
     */
    this.performSearch = filter => {
      this.props.onSearchChanged(filter);
      const filterLC = String(filter).toLowerCase();
      const filtered = R.filter(
        data => `${data.name} ${data.title}`.toLowerCase().indexOf(filterLC) !== -1,
        this.state.all
      );
      this.setState({ds: filtered});
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.search !== this.props.search) {
      this.setState({search: this.props.search});
    }

    if (prevState.search !== this.state.search) {
      this.performSearch(this.state.search);
    }

    if (prevProps.items !== this.state.all) {
      this.setState({all: this.state.all}, ()=>{
        console.log(`SearchableList: items changed`);
        this.performSearch(this.state.search);
      });
    }
  }

  listView: FlatList;

  renderEmpty() {
    return <Text style={styles.noItemsText}>No items</Text>;
  }

  render() {
    return (
      <View style={styles.container}>
        <View key={'searchWrapper'} style={styles.searchWrapper}>
          <TextInput
            underlineColorAndroid={'transparent'}
            autoCapitalize={'none'}
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
            style={styles.searchInput}
            value={this.state.search}
            onChangeText={this.handleSearchInputChanged}
            clearButtonMode={'while-editing'}
          />
          <TouchableHighlight underlayColor={colors.whiteColor} onPress={this.props.onClose} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableHighlight>
        </View>
        <FlatList
          ref={r => (this.listView = r)}
          key={'list'}
          style={{flex: 1}}
          data={this.state.ds}
          renderItem={this.renderRow}
          ListEmptyComponent={this.renderEmpty}
        />
      </View>
    );
  }
}

SearchableList.defaultProps = {
  items: [],
  onPressRow: () => {},
  onClose: () => {},
  onSearchChanged: () => {},
  search: '',
};

SearchableList.propTypes = {
  search: PropTypes.string,
  onSearchChanged: PropTypes.func,
  onPressRow: PropTypes.func,
  onClose: PropTypes.func,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      title: PropTypes.string,
      onPress: PropTypes.func,
    })
  ),
};

export default SearchableList;
