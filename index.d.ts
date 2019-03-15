declare module 'react-native-component-viewer' {
  import {ReactElement, Component} from 'react';

  export interface ComponentViewerPropsType {
    onClose: (_: undefined) => any;
  }

  // eslint-disable-next-line react/prefer-stateless-function
  export class ComponentViewer extends Component<ComponentViewerPropsType> {}

  /**
   * Parameter for the exported methods
   */
  export interface TestInterface {
    name: string;
    title?: string;
    wrapperStyle: {};
  }

  function addComponentTest(
    component: ReactElement<any>,
    options: string | TestInterface | null,
    wrapperStyle?: {} | null
  ): void;

  function addSceneTest(
    component: ReactElement<any>,
    options: string | TestInterface | null,
    wrapperStyle?: {} | null
  ): void;
}
