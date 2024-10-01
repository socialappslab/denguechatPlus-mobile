import {
  Svg,
  G,
  Ellipse,
  Path,
  Circle,
  Defs,
  ClipPath,
  Rect,
} from "react-native-svg";

const CustomMarker = () => {
  return (
    <Svg width="27" height="43" viewBox="0 0 27 43" fill="none">
      <G clipPath="url(#clip0_3111_15916)">
        <G filter="url(#filter0_f_3111_15916)">
          <Ellipse
            cx="13.5"
            cy="39.5"
            rx="4.5"
            ry="2.5"
            fill="black"
            fillOpacity="0.12"
          />
        </G>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26 13.5C26 16.3253 25.0627 18.9316 23.4821 21.025C22.9203 21.8066 22.1609 22.6384 21.3202 23.5591C18.4001 26.7571 14.5 31.0285 14.5 38C14.5 38.5523 14.0523 39 13.5 39C12.9477 39 12.5 38.5523 12.5 38C12.5 31.0285 8.59989 26.7571 5.67984 23.5591C4.83915 22.6384 4.07969 21.8066 3.51793 21.025C1.93731 18.9316 1 16.3253 1 13.5C1 6.59644 6.59644 1 13.5 1C20.4036 1 26 6.59644 26 13.5Z"
          fill="#EA352B"
        />
        <Circle cx="13.5" cy="13.5" r="4.5" fill="black" fillOpacity="0.4" />
      </G>
      <Defs>
        <ClipPath id="clip0_3111_15916">
          <Rect width="27" height="43" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default CustomMarker;
