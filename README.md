# react-native-component-viewer
A searchable list of components or scenes in your app. Handy for tweaking layout or design without needing to navigate your
app to get there. 

Especially useful for accessing screens that are hard to get to, or for testing the design of screen in specific difficult-to-test situations (e.g. server failure).

![animated gif](docs/Demo.gif)

# Installation

This is a pure JavaScript library, so there's no need to run `react-native link` or manually add any frameworks or libraries.

```
npm i -S react-native-component-viewer
```

- You may need to close and restart the React Native packager.

# Usage

This library does not assume any specific navigation library is in use. As a result it can be configured for us with [react-navigation](https://github.com/react-community/react-navigation), [react-native-router-flux](https://github.com/aksonov/react-native-router-flux), and others.

## Usage in react-native-router-flux

Here's how to use it in react-native-router-flux:

- First, add the Scene to your list of scenes at the root of your app:

```js
import {DebugSceneList} from 'react-native-component-viewer';

//.. other imports

class MyRootComponent extends React.Component {
  render() {
    return <Scene key="MyRootScene">
      {/* Insert line below.. */}
      <Scene key="DebugSceneList" hideNavBar={true} component={DebugSceneList}/>
    </Scene>
  }
}
```

- Then, at the point you want to show the debug list UI (e.g. if your in-app settings), call `Actions.DebugSceneList({onClose: Actions.pop})`.

The `onClose` prop above runs the function that closes the list UI when the `Done` button is pressed on the UI.

Example:
```js
<TouchableHighlight onPress={()=>Actions.DebugSceneList({onClose: Actions.pop})}>
    <Text>Click to view scenes</Text>
</TouchableHighlight>
```

When you first run this you'll get an empty list. You need to manually register each screen with the system (along with their test prop data) before you can start.

> Other navigation systems will be similar - just make sure to pass a function that closes the list as the `onClose` property of the `<DebugSceneList>` component. This'll ensure the `Done` button on the list
returns to your previous page.

# Registering test screens

On each screen you want to test, add the following:

```js
import {addTestScene} from 'react-native-component-viewer'; // <-- Add this import

class MySceneComponent extends React.Component {
  //... your scene component here
}

// Add a test scene.
addTestScene(<MySceneComponent
  myProp1={'test data'}
  myProp2={['more','test','data']}
/>);
```

You can add the same component several times with different data. To do this, add a description as the second parameter to `addTestScene`:

```js
addTestScene(<MySceneComponent items={[]}/>, 'Empty');

addTestScene(<MySceneComponent items={['more','test','data']}/>, 'Three items');
```

## Usage with Redux

If you're using the `react-redux` `connect` method, make sure you pass the 'unconnected' version of the component to `addTestScene`, e.g.:

```js
class MyComponent extends React.Component {
	//... 
}

export default connect(
	state => ({
		//.. mapStateToProps
	}),
	dispatch => ({
		//.. mapDispatchToProps
	})(MyComponent);
	
// we export the connected component, but pass the
// unconnected component to addTestScene
addTestScene(<MyComponent {...testData}/>);
```

This way you can make sure your test scenes are completely independent of the Redux state.








