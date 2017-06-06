import React from 'react';
import * as R from 'ramda';

/**
 * Type of values in registeredScenes
 */
export type RegisteredItemType = {|
  name: string, // extracted from the component's name, or provided by user
  title: ?string, // title used when scene is used several times with different test data
  component: React$Element, // the actual element itself
  type: 'scene' | 'component',
  states?: Array<RegisteredItemType>,
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

/**
 * Get the name of the component. Note only works in debug builds as production builds minify JS code and remove names
 * Stateless components have .name, classes have .displayName.
 */
function getName(component: React$Element) {
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
 * @param title - subtitle for the test e.g. 'with long name'
 * @param type - For Screens/Scenes that should be displayed full-screen, use type='scene'. To display the same component in different states on the same screen, use type='component'.
 */
function addTest(component: React$Element, type: 'scene' | 'component', options: TestType = {}) {
  if (!component || !component.type) {
    return;
  }
  // Use provided name, or extract from component if not given
  const name = options.name || getName(component);
  const title = options.title;

  const itemDetails = {...options, component, type, name};

  switch (type) {
    // For each component, we store an array of different 'views' onto the component
    case 'component':
    {
      const key = name;

      let existing: ?RegisteredItemType = registeredItems[key];

      if (existing) {
        if (!existing.states) {
          console.log(`Probably trying to register a component on something previously registered as a scene`);
          return;
        }
        existing.states = R.uniqBy(i => i.title, [...existing.states, itemDetails]); // remove dupes, based on title
      } else {
        // Register as empty placeholder so it can be rendered easily in the list
        existing = {
          component: null,
          wrapperStyle: null,
          type: 'component',
          states: [itemDetails],
          title,
          name,
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
      const key = title || name;
      if (registeredItems[key]) {
        console.log(`Scene already registered with title=${key}. Overwriting..`);
      }
      registeredItems[key] = itemDetails;
    }
      break;
    default:
  }
}

/**
 * Sorted by name.
 */
function getTests(): Array<RegisteredItemType> {
  return R.sort(({name: name1}, {name: name2}) => (name1 > name2 ? 1 : -1), R.values(registeredItems));
}

/**
 * Add test for a scene
 */
const addSceneTest = (component: React$Element, titleOrOptions: ?string | ?TestType, wrapperStyle: ?Object = {}) => {
  if (R.is(Object, titleOrOptions)) {
    return addTest(component, 'scene', titleOrOptions);
  }
  addTest(component, 'scene', {title: titleOrOptions, wrapperStyle});
};

/**
 * Add test for a component
 */
const addComponentTest = (
  component: React$Element,
  titleOrOptions: ?string | ?TestType,
  wrapperStyle: ?Object = {}
) => {
  if (R.is(Object, titleOrOptions)) {
    return addTest(component, 'component', titleOrOptions);
  }
  addTest(component, 'component', {title: titleOrOptions, wrapperStyle});
};

/**
 * @deprecated - use addSceneTest
 */
const addTestScene = addSceneTest;

/**
 * @deprecated - use getTests
 */
const getTestScenes = getTests;

export {addSceneTest, addComponentTest, addTestScene, getTests, getTestScenes};
