import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type IconProps = {
  name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  size?: number;
  color?: string;
  className?: string;
};

export type IconMaterialProps = ThemeProps & IconProps;

export function IconMaterial(props: IconMaterialProps) {
  const { size, name, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      {...otherProps}
    />
  );
}
