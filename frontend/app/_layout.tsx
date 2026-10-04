import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
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
        <Stack.Screen name="chat" options={{ title: "Conversas" }} />
        <Stack.Screen name="perfilAdm" options={{ title: "Perfil Administrativo", headerShown: false }} />
        <Stack.Screen name="perfilFunc" options={{ title: "Perfil Colaborador", headerShown: false }} />
        <Stack.Screen name="DadosTrabalhistas" options={{ title: "Dados Trabalhistas", headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>

      <StatusBar style="dark" />
    </>
  );
}
