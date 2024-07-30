import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  KeyboardAvoidingViewProps as RNKeyboardAvoidingViewProps,
  StyleSheet,
} from "react-native";

const KeyboardAvoidingView = ({
  style,
  ...props
}: RNKeyboardAvoidingViewProps) => {
  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      {props.children}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    justifyContent: "space-between",
  },
});

export default KeyboardAvoidingView;
