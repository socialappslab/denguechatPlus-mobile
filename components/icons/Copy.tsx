import { Svg, Path } from "react-native-svg";

export type CopyProps = {
  red?: boolean;
};

export function Copy({ red }: CopyProps) {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Path
        d="M7.33398 11.3334H4.66732C3.7451 11.3334 2.95898 11.0084 2.30898 10.3584C1.65898 9.70842 1.33398 8.9223 1.33398 8.00008C1.33398 7.07786 1.65898 6.29175 2.30898 5.64175C2.95898 4.99175 3.7451 4.66675 4.66732 4.66675H7.33398V6.00008H4.66732C4.11176 6.00008 3.63954 6.19453 3.25065 6.58341C2.86176 6.9723 2.66732 7.44453 2.66732 8.00008C2.66732 8.55564 2.86176 9.02786 3.25065 9.41675C3.63954 9.80564 4.11176 10.0001 4.66732 10.0001H7.33398V11.3334ZM5.33398 8.66675V7.33341H10.6673V8.66675H5.33398ZM8.66732 11.3334V10.0001H11.334C11.8895 10.0001 12.3618 9.80564 12.7507 9.41675C13.1395 9.02786 13.334 8.55564 13.334 8.00008C13.334 7.44453 13.1395 6.9723 12.7507 6.58341C12.3618 6.19453 11.8895 6.00008 11.334 6.00008H8.66732V4.66675H11.334C12.2562 4.66675 13.0423 4.99175 13.6923 5.64175C14.3423 6.29175 14.6673 7.07786 14.6673 8.00008C14.6673 8.9223 14.3423 9.70842 13.6923 10.3584C13.0423 11.0084 12.2562 11.3334 11.334 11.3334H8.66732Z"
        fill={red ? #C60000 : "black"}
      />
    </Svg>
  );
}

export default Copy;
