import { ThemeProps, useThemeColor } from "@/components/themed/useThemeColor";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons/static";

type IconProps = {
  name: React.ComponentProps<typeof MaterialDesignIcons>["name"];
  size?: number;
  color?: string;
  className?: string;
};

export type IconMaterialProps = ThemeProps & IconProps;

export function IconMaterial(props: IconMaterialProps) {
  const { size, name, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <MaterialDesignIcons
      name={name}
      size={size}
      color={color}
      {...otherProps}
    />
  );
}
