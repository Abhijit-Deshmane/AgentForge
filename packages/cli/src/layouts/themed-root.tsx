import { type ReactNode } from "react";
import { useTheme } from "../providers/theme";

type props = {
  children: ReactNode;
};

export function ThemedRoot({ children }: props) {
  const { colors } = useTheme();

  return (
    <box backgroundColor={colors.background} width="100%" height="100%">
      {children}
    </box>
  );
}
