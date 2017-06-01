import React, {Component, PropTypes} from 'react';

import {View, StyleSheet, Text, ListView, TextInput, TouchableHighlight, Platform} from 'react-native';

import * as R from 'ramda';
import {colors} from './theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.whiteColor,
  },
  sceneRow: {borderBottomColor: colors.blackColor, borderBottomWidth: 1, height: 80, justifyContent: 'center'},
  sceneRowTitle: {marginHorizontal: 20, alignSelf: 'center', fontSize: 20},
  sceneRowSubtitle: {marginHorizontal: 20, alignSelf: 'center', fontSize: 10},
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
    borderRadius: Platform.OS == 'ios' ? 10 : 0,
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

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    const allItems = this.props.items;
    this.state = {
      all: allItems,
      ds: ds.cloneWithRows(allItems),
      selectedComponent: undefined,
    };

    this.renderRow = data => <SceneRow onPress={() => this.props.onPressRow(data)} {...data} />;

    /**
     * Search - lowercase everything. Search on name and title
     */
    this.search = filter => {
      const filterLC = String(filter).toLowerCase();
      const filtered = R.filter(
        data => `${data.name} ${data.title}`.toLowerCase().indexOf(filterLC) !== -1,
        this.state.all
      );
      this.setState({ds: this.state.ds.cloneWithRows(filtered)});
    };
  }

  componentDidMount() {
    // Attempt to get around issue where sometimes the list appears blank before you scroll it
    setTimeout(() => {
      if (this.listView) {
        this.listView.scrollTo({x: 0, y: 1, animated: true});
      }
    }, 150);
  }

  listView: ListView;

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
            onChangeText={this.search}
            clearButtonMode={'while-editing'}
          />
          <TouchableHighlight underlayColor={colors.whiteColor} onPress={this.props.onClose} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableHighlight>
        </View>
        {this.state.ds.getRowCount()
          ? <ListView
              ref={r => (this.listView = r)}
              enableEmptySections
              key={'list'}
              style={{flex: 1}}
              dataSource={this.state.ds}
              renderRow={this.renderRow}
            />
          : <Text style={styles.noItemsText}>No items</Text>}
      </View>
    );
  }
}

SearchableList.defaultProps = {
  items: [],
  onPressRow: () => {},
  onClose: () => {},
};

SearchableList.propTypes = {
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
