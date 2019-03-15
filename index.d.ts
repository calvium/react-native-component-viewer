declare module 'react-native-component-viewer' {
  import {ReactNode, Component} from 'react';
  import {ViewStyle} from 'react-native';

  export interface ComponentViewerPropsType {
    onClose: () => any;
  }

  // eslint-disable-next-line react/prefer-stateless-function
  export class ComponentViewer extends Component<ComponentViewerPropsType> {}

  /**
   * Parameter for the exported methods
   */
  export interface TestInterface {
    name: string;
    title?: string;
    wrapperStyle?: ViewStyle | null,
  }

  type TestFunctionType = (props: {closeThisTest: () => void}) => ReactNode;
  type TestType = TestFunctionType | ReactNode;

  function addComponentTest(
    component: TestType,
    options: string | TestInterface | null,
    wrapperStyle?: ViewStyle | null,
  ): void;

  function addSceneTest(
    component: TestType,
    options: string | TestInterface | null,
    wrapperStyle?: ViewStyle | null,
  ): void;
}
