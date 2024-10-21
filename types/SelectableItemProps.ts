import type { SyntheticEvent } from "react";
import type { ColorValue, NativeSyntheticEvent, ViewProps } from "react-native";
import { OptionType } from ".";

export type CheckboxEvent = {
  /**
   * On native platforms, a `NodeHandle` for the element on which the event has occurred.
   * On web, a DOM node on which the event has occurred.
   */
  target: any;
  /**
   * A boolean representing checkbox current value.
   */
  value: boolean;
};

// @needsAudit
export type SelectableItemProps = ViewProps & {
  /**
   * Value to pass during event changes
   * @default false
   */
  value?: string;
  /**
   * If the checkbox is disabled, it becomes opaque and uncheckable.
   */
  disabled?: boolean;
  /**
   * The tint or color of the checkbox. This overrides the disabled opaque style.
   */
  color?: ColorValue;
  /**
   * Callback that is invoked when the user presses the checkbox.
   * @param event A native event containing the checkbox change.
   */
  onChange?: (
    event:
      | NativeSyntheticEvent<CheckboxEvent>
      | SyntheticEvent<HTMLInputElement, CheckboxEvent>,
  ) => void;
  /**
   * Callback that is invoked when the user presses the checkbox.
   * @param value A boolean indicating the new checked state of the checkbox.
   */
  onValueChange?: (value: any, isText?: boolean) => void;
  /**
   * The label of the checkbox.
   */
  label?: string;
  /**
   * If `true`, the checkbox is required.
   */
  required?: boolean;
  /**
   * The name of the chip.
   */
  chip?: string | null;
  /**
   * Renders an image alongside the item.
   */
  image?: string;
  /**
   * Renders a text area or an input alongside the item.
   */
  optionType?: OptionType;
  /**
   * Value indicating if checkbox is checked.
   */
  checked?: boolean;
  /**
   * How to render, checkbox or radio
   */
  type?: "radio" | "checkbox";
  /**
   * Text to render when inputs are rendered
   */
  defaultText?: string;
  /**
   * If an item with this option is selected,
   * all the other options should be disabled
   */
  disableOtherOptions?: boolean;
};
