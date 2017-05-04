import React from 'react';
import * as R from 'ramda';

/**
 * Type of values in registeredScenes
 */
export type RegisteredSceneType = {|
  name: string, // extracted from the component's name
  title: ?string, // title used when scene is used several times with different test data
  component: React$Element, // the actual element itself
|};

const registeredScenes: {|[string]: RegisteredSceneType|} = {};

/**
 * Register a test scene. Title is optional.
 * The class name of the component is automatically extracted from the component.
 *
 * component - output of a render e.g. <MyComponent param={value}/>.
 */
function addTestScene(component: React$Element, title: ?string) {
  if (!component || !component.type) {
    return;
  }
  // Get the name of the component.
  // Stateless components have .name, classes have .displayName.
  const componentName = component.type.displayName || component.type.name;
  const key = title || componentName;
  if (registeredScenes[key]) {
    console.log(`Scene already registered with title=${key}. Overwriting..`);
  }

  registeredScenes[key] = {name: componentName, component, title};
}

/**
 * Sorted by name.
 */
function getTestScenes(): Array<RegisteredSceneType> {
  return R.sort(({name: name1}, {name: name2}) => name1 > name2, R.values(registeredScenes));
}

export {addTestScene, getTestScenes};
