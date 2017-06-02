import React from 'react';
import * as R from 'ramda';

/**
 * Type of values in registeredScenes
 */
export type RegisteredItemType = {|
  name: string, // extracted from the component's name
  title: ?string, // title used when scene is used several times with different test data
  component: React$Element, // the actual element itself
  type: 'scene' | 'component',
  states?: Array<RegisteredItemType>,
|};

const registeredItems: {|[string]: RegisteredItemType|} = {};

/**
 * Register a test item. Title is optional.
 * The class name of the component is automatically extracted from the component.
 *
 * @param component - output of a render e.g. <MyComponent param={value}/>.
 * @param title - subtitle for the test e.g. 'with long name'
 * @param type - For Screens/Scenes that should be displayed full-screen, use type='scene'. To display the same component in different states on the same screen, use type='component'.
 */
function addTest(
  component: React$Element,
  title: ?string,
  wrapperStyle: ?Object = {},
  type: 'scene' | 'component' = 'scene'
) {
  if (!component || !component.type) {
    return;
  }
  // Get the name of the component.
  // Stateless components have .name, classes have .displayName.
  const componentName = component.type.displayName || component.type.name;

  const itemDetails = {name: componentName, component, title, wrapperStyle, type};

  switch (type) {
    // For each component, we store an array of different 'views' onto the component
    case 'component':
      {
        const key = componentName;

        let existing: ?RegisteredItemType = registeredItems[key];

        if (existing) {
          if (!existing.states) {
            Console.log(`Probably trying to register a compoment on something previously registered as a scene`);
            return;
          }
          existing.states = R.uniqBy(i => i.title, [...existing.states, itemDetails]); // remove dupes, based on title
        } else {
          // Register as empty placeholder so it can be rendered easily in the list
          existing = {
            component: null,
            wrapperStyle: null,
            name: componentName,
            title: title,
            type: 'component',
            states: [itemDetails],
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
        const key = title || componentName;
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
const addSceneTest = (component: React$Element, title: ?string, wrapperStyle: ?Object = {}) =>
  addTest(component, title, wrapperStyle, 'scene');

/**
 * Add test for a component
 */
const addComponentTest = (component: React$Element, title: ?string, wrapperStyle: ?Object = {}) =>
  addTest(component, title, wrapperStyle, 'component');

/**
 * @deprecated - use addSceneTest
 */
const addTestScene = addSceneTest;

/**
 * @deprecated - use getTests
 */
const getTestScenes = getTests;

export {addSceneTest, addComponentTest, addTestScene, getTests, getTestScenes};
