import DebugSceneList from './src/DebugSceneList';
import {addSceneTest, addComponentTest, addTestScene} from './src/TestRegistry';

export {
  DebugSceneList as ComponentViewer,
  addComponentTest,
  addSceneTest,
  /**
   * @deprecated - use addSceneTest
   */
  addTestScene,
  /**
   * @deprecated - use ComponentViewer
   */
  DebugSceneList,
}
