import { Outlet } from "react-router";
import { KeyboardLayerProvider } from "../providers/keyboard-layer";
import { ThemeProvider } from "../providers/theme";
import { ToastProvider } from "../providers/toast";
import { ThemedRoot } from "./themed-root";

export function RootLayout() {
    return(
        <ThemeProvider>
            <ToastProvider>
                <KeyboardLayerProvider>
                    <ThemedRoot>
                        <Outlet/>
                    </ThemedRoot>
                </KeyboardLayerProvider>
            </ToastProvider>
        </ThemeProvider>
    )
}