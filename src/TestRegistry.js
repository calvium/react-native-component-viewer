/* eslint-disable no-console */
import React from 'react';
import * as R from 'ramda';

/**
 * Type of values in registeredScenes
 */
export type RegisteredItemType = {|
  name: string, // extracted from the component's name, or provided by user
  title: ?string, // title used when scene is used several times with different test data
  component: React.Element<any>, // the actual element itself
  type: 'scene' | 'component',
  states?: Array<RegisteredItemType>,
  wrapperStyle: ?Object,
|};

/**
 * Parameter for the exported methods
 */
export type TestType = {
  name: string,
  title?: string,
  wrapperStyle: ?Object,
};

const registeredItems: {|[string]: RegisteredItemType|} = {};

const registeredListeners: Array<(ItemType) => void> = [];

/**
 * Get the name of the component. Note only works in debug builds as production builds minify JS code and remove names
 * Stateless components have .name, classes have .displayName.
 */
function getName(component: React.Element<any>) {
  if (!component) {
    return '(no component)';
  }
  return component.type.displayName || component.type.name;
}

/**
 * Register a test item. Title is optional.
 * The class name of the component is automatically extracted from the component.
 *
 * @param component - output of a render e.g. <MyComponent param={value}/>.
 * @param type - For Screens/Scenes that should be displayed full-screen, use type='scene'. To display the same component in different states on the same screen, use type='component'.
 * @param options - for the test
 */
function addTest(component: React.Element<any>, type: 'scene' | 'component', options: TestType = {}) {
  if (!component || (!component.type && !component instanceof Function)) {
    return;
  }
  // Use provided name, or extract from component if not given
  const name = options.name || getName(component);
  const title = options.title;

  let itemDetails = {...options, component, type, name};
  const key = keyForTest(type, itemDetails);
  itemDetails = {...itemDetails, key}; // add key back in

  switch (type) {
    // For each component, we store an array of different 'views' onto the component
    case 'component':
      {
        let existing: ?RegisteredItemType = registeredItems[key];

        if (existing) {
          if (!existing.states) {
            console.log('Probably trying to register a component on something previously registered as a scene');
            return;
          }
          // uniqBy retains FIRST item when there are dupes - so put our NEW one first.
          existing.states = R.uniqBy(i => i.title, [itemDetails, ...existing.states]); // remove dupes, based on title
        } else {
          // Register as empty placeholder so it can be rendered easily in the list
          existing = {
            component: null,
            wrapperStyle: null,
            type: 'component',
            states: [itemDetails],
            title,
            name,
            key,
          };
        }

        registeredItems[key] = existing;
        // title is state1, state2, state3
        existing.title = `${existing.states.length} test${existing.states.length !== 1 ? 's' : ''}`;
      }
      break;
    // For scenes, we have a single item
    case 'scene':
      {
        if (registeredItems[key]) {
          console.log(`Scene already registered as '${key}'. Overwriting..`);
        }
        registeredItems[key] = itemDetails;
      }
      break;
    default:
  }

  // Notify listeners
  notifyListeners(key);
}

let listenerDebounceId = null;
let listenerDebouceEditListKeys = [];

function notifyListeners(key: string) {
  listenerDebouceEditListKeys.push(key);
  if (listenerDebounceId) {
    clearTimeout(listenerDebounceId);
  }
  listenerDebounceId = setTimeout(() => {
    const list = [...listenerDebouceEditListKeys]; // copy list!
    listenerDebouceEditListKeys = [];
    clearTimeout(listenerDebounceId);
    listenerDebounceId = null;

    console.log(`.. notifying react-native-component-viewer test updated.. ${JSON.stringify(list)}`);
    R.forEach(r => {
      try {
        r(list);
      } catch (ignored) {
      }
    }, registeredListeners);
  }, 250);
}

/**
 * Uses as keys into registeredItems
 */
function keyForTest(type: string, details: TestType) {
  switch (type) {
    case 'component':
      return details.name;
    case 'scene':
    default:
      return details.title ? `${details.name}_${details.title}` : details.name;
  }
}

/**
 * Sorted by name.
 */
function getTests(): Array<RegisteredItemType> {
  return R.sort(({name: name1}, {name: name2}) => (name1 > name2 ? 1 : -1), R.values(registeredItems));
}

/**
 * Returns a specific test. Will get the *latest* test - means that hot-reloaded tests
 * update as expected
 */
function getTest(key: string) {
  return registeredItems[key];
}

/**
 * Add test for a scene. Will be displayed full-screen in the test UI
 *
 * @param component - JSX of component to test
 * @param options - TestType instance with options for the test. Backwards-compatible with previous version.
 * @param wrapperStyle - don't use this. Instead use the `wrapperStyle` property on `options`
 */
const addSceneTest = (component: React.Element<any>, options: ?string | ?TestType, wrapperStyle: ?Object = {}) => {
  if (R.is(Object, options)) {
    addTest(component, 'scene', options);
    return;
  }
  // Backwards compatibility, where options is actually a string
  addTest(component, 'scene', {title: options, wrapperStyle});
};

/**
 * Add test for a component. Will be displayed in a ScrollView along with other tests for this component.
 *
 * @param component - JSX of component to test
 * @param options - TestType instance with options for the test. Backwards-compatible with previous version.
 * @param wrapperStyle - don't use this. Instead use the `wrapperStyle` property on `options`
 */
const addComponentTest = (component: React.Element<any>, options: ?string | ?TestType, wrapperStyle: ?Object = {}) => {
  if (R.is(Object, options)) {
    addTest(component, 'component', options);
    return;
  }
  addTest(component, 'component', {title: options, wrapperStyle});
};

function addUpdateListener(listener: Array<TestType> => void) {
  const index = registeredListeners.indexOf(listener);
  if (index === -1) {
    registeredListeners.push(listener);
  } else {
    console.log(`.. removeUpdateListener called with listener that's already added`);
  }
}

function removeUpdateListener(listener: Array<TestType> => void) {
  const index = registeredListeners.indexOf(listener);
  if (index !== -1) {
    registeredListeners.splice(index, 1);
  } else {
    console.log(`.. removeUpdateListener called with listener that's not been added`);
  }
}

/**
 * @deprecated - use addSceneTest
 */
const addTestScene = addSceneTest;

/**
 * @deprecated - use getTests
 */
const getTestScenes = getTests;

export {
  addSceneTest,
  addComponentTest,
  addTestScene,
  getTests,
  getTest,
  getTestScenes,
  addUpdateListener,
  removeUpdateListener,
};
