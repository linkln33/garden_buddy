/**
 * Type declarations for react-native in Next.js environment
 * This resolves the TypeScript error: Cannot find module 'react-native' or its corresponding type declarations
 */

declare module 'react-native' {
  import * as React from 'react';

  export interface ViewProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface TextProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface ScrollViewProps extends ViewProps {
    horizontal?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    [key: string]: any;
  }

  export interface PressableProps {
    style?: any;
    onPress?: () => void;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface StyleSheetStatic {
    create<T extends { [key: string]: any }>(styles: T): T;
  }

  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const ScrollView: React.ComponentType<ScrollViewProps>;
  export const Pressable: React.ComponentType<PressableProps>;
  export const StyleSheet: StyleSheetStatic;
}
