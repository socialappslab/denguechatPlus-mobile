import { Svg, Path } from "react-native-svg";

export type DeleteProps = {
  red?: boolean;
};

export function Delete({ red }: DeleteProps) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M4.66602 14C4.29935 14 3.98546 13.8694 3.72435 13.6083C3.46324 13.3472 3.33268 13.0333 3.33268 12.6667V4H2.66602V2.66667H5.99935V2H9.99935V2.66667H13.3327V4H12.666V12.6667C12.666 13.0333 12.5355 13.3472 12.2743 13.6083C12.0132 13.8694 11.6993 14 11.3327 14H4.66602ZM11.3327 4H4.66602V12.6667H11.3327V4ZM5.99935 11.3333H7.33268V5.33333H5.99935V11.3333ZM8.66602 11.3333H9.99935V5.33333H8.66602V11.3333Z"
        fill={red ? "#C60000" : "#79716B"}
      />
    </Svg>
  );
}

export default Delete;
