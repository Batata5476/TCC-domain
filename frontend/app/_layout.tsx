import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const styleId = "hide-floating-dev-icons";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          [data-expo-dev-menu],
          [aria-label="Developer Menu"],
          div[class*="dev-menu"],
          div[class*="DevTools"],
          div[class*="react-scan"],
          div[class*="devtools-"],
          div[class*="floating-tools"],
          button[class*="dev-menu"] {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);
  return (
    <>
      <Stack
        screenOptions={{
          // 
          animation: Platform.OS === "web" ? "fade" : "default",
          headerStyle: {
            backgroundColor: "#ECEFDA",
          },
          headerTintColor: "#285A71",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="loginEmpresa" options={{ title: "Empresa" }} />
        <Stack.Screen name="inserirTokenEmpresa" options={{ title: "Inserir token" }} />
        <Stack.Screen name="loginFuncionario" options={{ title: "Funcionario" }} />
        <Stack.Screen name="cadastroEmpresa" options={{ title: "Cadastro empresa" }} />
        <Stack.Screen name="cadastroFuncionario" options={{ title: "Cadastro funcionario" }} />
        <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Stack.Screen name="ponto-e" options={{ title: "Ponto-E" }} />
        <Stack.Screen name="chat" options={{ title: "Conversas", headerShown: false }} />
        <Stack.Screen name="perfilAdm" options={{ title: "Perfil Administrativo", headerShown: false }} />
        <Stack.Screen name="gestaoFuncionarios" options={{ title: "Gestão de Colaboradores", headerShown: false }} />
        <Stack.Screen name="perfilFunc" options={{ title: "Perfil Colaborador", headerShown: false }} />
        <Stack.Screen name="DadosTrabalhistas" options={{ title: "Dados Trabalhistas", headerShown: false }} />
        <Stack.Screen name="bemEstar" options={{ title: "Bem-Estar", headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>

      <StatusBar style="dark" />
    </>
  );
}
