import { Svg, Path } from "react-native-svg";

export type SendProps = {
  disabled?: boolean;
};

export function Send({ disabled }: SendProps) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 20V4L22 12L3 20ZM5 17L16.85 12L5 7V10.5L11 12L5 13.5V17Z"
        fill={disabled ? "#D0D5DD" : "#0094FF"}
      />
    </Svg>
  );
}

export default Send;
