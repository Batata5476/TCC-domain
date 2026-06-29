import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  login,
  validateFirstAccess,
  activateFirstAccess,
  forgotPassword,
} from "../services/auth";

const { height } = Dimensions.get("window");

type ModalStep =
  | "none"
  | "firstAccess_credentials"
  | "firstAccess_password"
  | "forgotPassword_email"
  | "forgotPassword_reset";

// ─── Ícone de Olho Simples Geométrico ──────────────────────────────────────────
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <View style={eyeStyles.container}>
    <View style={[eyeStyles.outerEye, visible ? eyeStyles.activeBorder : eyeStyles.inactiveBorder]} />
    <View style={[eyeStyles.pupil, visible ? eyeStyles.activePupil : eyeStyles.inactivePupil]} />
    {!visible && <View style={eyeStyles.slash} />}
  </View>
);

const eyeStyles = StyleSheet.create({
  container: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  outerEye: {
    position: "absolute",
    width: 18,
    height: 11,
    borderRadius: 6,
    borderWidth: 1.8,
  },
  activeBorder: {
    borderColor: "#285A71",
  },
  inactiveBorder: {
    borderColor: "#99abb5",
  },
  pupil: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activePupil: {
    backgroundColor: "#285A71",
  },
  inactivePupil: {
    backgroundColor: "#99abb5",
  },
  slash: {
    position: "absolute",
    width: 20,
    height: 1.8,
    backgroundColor: "#99abb5",
    transform: [{ rotate: "-45deg" }],
  },
});

export default function LoginScreen() {
  const router = useRouter();

  const [loginInput, setLoginInput] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [senhaVisible, setSenhaVisible] = useState(false);

  const [modalStep, setModalStep] = useState<ModalStep>("none");

  // Primeiro acesso
  const [faCode, setFaCode] = useState("");
  const [faToken, setFaToken] = useState("");
  const [faNovaSenha, setFaNovaSenha] = useState("");
  const [faConfirmaSenha, setFaConfirmaSenha] = useState("");
  const [faLoading, setFaLoading] = useState(false);
  const [faSenhaVisible, setFaSenhaVisible] = useState(false);

  // Esqueci a senha
  const [fpEmail, setFpEmail] = useState("");
  const [fpCode, setFpCode] = useState("");
  const [fpToken, setFpToken] = useState("");
  const [fpNovaSenha, setFpNovaSenha] = useState("");
  const [fpConfirmaSenha, setFpConfirmaSenha] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSenhaVisible, setFpSenhaVisible] = useState(false);

  // Estados de Foco para Efeitos Premium
  const [loginFocused, setLoginFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  const validatePassword = (p: string): string | null => {
    if (p.length < 8) return "Mínimo de 8 caracteres";
    if (!/[A-Z]/.test(p)) return "Deve conter uma letra maiúscula";
    if (!/[a-z]/.test(p)) return "Deve conter uma letra minúscula";
    if (!/[0-9]/.test(p)) return "Deve conter um número";
    if (!/[^A-Za-z0-9]/.test(p)) return "Deve conter um caractere especial";
    return null;
  };

  const closeModal = () => {
    setModalStep("none");
    setFaCode(""); setFaToken(""); setFaNovaSenha(""); setFaConfirmaSenha("");
    setFpEmail(""); setFpCode(""); setFpToken(""); setFpNovaSenha(""); setFpConfirmaSenha("");
  };

  const handleLogin = async () => {
    if (!loginInput.trim() || !senha) {
      Alert.alert("Atenção", "Preencha o ID e a senha.");
      return;
    }
    setLoading(true);
    try {
      await login(loginInput.trim(), senha);
      router.replace("/dashboard");
    } catch (err: any) {
      if (err.message === "PRIMEIRO_ACESSO_REQUERIDO") {
        setModalStep("firstAccess_credentials");
      } else {
        Alert.alert("Erro", err.message || "Não foi possível fazer login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidateFirstAccess = async () => {
    if (!faCode.trim() || !faToken.trim()) {
      Alert.alert("Atenção", "Preencha o Código de Ativação e o Token.");
      return;
    }
    setFaLoading(true);
    try {
      await validateFirstAccess(faCode.trim().toUpperCase(), faToken.trim().toUpperCase());
      setModalStep("firstAccess_password");
    } catch (err: any) {
      Alert.alert("Inválido", err.message || "Código ou token incorreto.");
    } finally {
      setFaLoading(false);
    }
  };

  const handleActivateFirstAccess = async () => {
    const err = validatePassword(faNovaSenha);
    if (err) { Alert.alert("Senha fraca", err); return; }
    if (faNovaSenha !== faConfirmaSenha) { Alert.alert("Atenção", "As senhas não coincidem."); return; }
    setFaLoading(true);
    try {
      await activateFirstAccess(faCode.trim().toUpperCase(), faToken.trim().toUpperCase(), faNovaSenha);
      closeModal();
      router.replace("/dashboard");
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível ativar a conta.");
    } finally {
      setFaLoading(false);
    }
  };

  const handleForgotPasswordEmail = async () => {
    if (!fpEmail.trim()) { Alert.alert("Atenção", "Informe seu e-mail."); return; }
    setFpLoading(true);
    try {
      await forgotPassword(fpEmail.trim());
      Alert.alert(
        "Instruções enviadas",
        "Verifique seu e-mail. Em desenvolvimento, os dados aparecem no log do servidor.",
        [{ text: "OK", onPress: () => setModalStep("forgotPassword_reset") }]
      );
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Erro ao solicitar redefinição.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!fpCode.trim() || !fpToken.trim()) { Alert.alert("Atenção", "Preencha o código e o token."); return; }
    const err = validatePassword(fpNovaSenha);
    if (err) { Alert.alert("Senha fraca", err); return; }
    if (fpNovaSenha !== fpConfirmaSenha) { Alert.alert("Atenção", "As senhas não coincidem."); return; }
    setFpLoading(true);
    try {
      await activateFirstAccess(fpCode.trim().toUpperCase(), fpToken.trim().toUpperCase(), fpNovaSenha);
      closeModal();
      Alert.alert("Sucesso", "Senha redefinida! Faça login com a nova senha.");
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível redefinir a senha.");
    } finally {
      setFpLoading(false);
    }
  };

  // ─── Modal Inputs ────────────────────────────────────────────────────────────
  const PasswordField = ({
    label, value, onChangeText, visible, onToggle, placeholder,
  }: any) => {
    const [focused, setFocused] = useState(false);
    return (
      <View style={ms.fieldWrapper}>
        <Text style={ms.fieldLabel}>{label}</Text>
        <View style={[ms.passwordRow, focused && ms.focusedRow]}>
          <TextInput
            style={ms.passwordInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder || "••••••••"}
            placeholderTextColor="#bbb"
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <TouchableOpacity onPress={onToggle} style={ms.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <EyeIcon visible={visible} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const PlainField = ({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize }: any) => {
    const [focused, setFocused] = useState(false);
    return (
      <View style={ms.fieldWrapper}>
        <Text style={ms.fieldLabel}>{label}</Text>
        <TextInput
          style={[ms.input, focused && ms.focusedInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || ""}
          placeholderTextColor="#bbb"
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize ?? "none"}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    );
  };

  const PasswordStrength = ({ password }: { password: string }) => {
    if (!password) return null;
    const checks = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
    const score = checks.filter(Boolean).length;
    const colors = ["#e74c3c", "#e74c3c", "#f39c12", "#2ecc71", "#27ae60"];
    const labels = ["", "Muito fraca", "Fraca", "Média", "Forte", "Muito forte"];
    return (
      <View style={{ marginBottom: 12, marginTop: -4 }}>
        <View style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
          {[0,1,2,3,4].map(i => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < score ? colors[score-1] : "#e0e0e0" }} />
          ))}
        </View>
        <Text style={{ fontSize: 11, fontWeight: "600", color: colors[score-1] || "#ccc" }}>{labels[score]}</Text>
      </View>
    );
  };

  const renderModal = () => {
    switch (modalStep) {
      case "firstAccess_credentials":
        return (
          <>
            <Text style={ms.title}>Primeiro acesso</Text>
            <Text style={ms.subtitle}>Digite os dados recebidos por e-mail.</Text>
            <PlainField label="Código de Ativação" value={faCode} onChangeText={(t: string) => setFaCode(t.toUpperCase())} placeholder="Ex: TESTE001" autoCapitalize="characters" />
            <PlainField label="Token" value={faToken} onChangeText={(t: string) => setFaToken(t.toUpperCase())} placeholder="Ex: ABCD1234" autoCapitalize="characters" />
            <TouchableOpacity style={[ms.primaryBtn, faLoading && ms.disabled]} onPress={handleValidateFirstAccess} disabled={faLoading}>
              {faLoading ? <ActivityIndicator color="#fff" /> : <Text style={ms.primaryBtnText}>Validar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={ms.cancelBtn} onPress={closeModal}>
              <Text style={ms.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        );
      case "firstAccess_password":
        return (
          <>
            <Text style={ms.title}>Crie sua senha</Text>
            <Text style={ms.subtitle}>Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.</Text>
            <PasswordField label="Nova senha" value={faNovaSenha} onChangeText={setFaNovaSenha} visible={faSenhaVisible} onToggle={() => setFaSenhaVisible(v => !v)} />
            <PasswordStrength password={faNovaSenha} />
            <PasswordField label="Confirmar senha" value={faConfirmaSenha} onChangeText={setFaConfirmaSenha} visible={faSenhaVisible} onToggle={() => setFaSenhaVisible(v => !v)} />
            <TouchableOpacity style={[ms.primaryBtn, faLoading && ms.disabled]} onPress={handleActivateFirstAccess} disabled={faLoading}>
              {faLoading ? <ActivityIndicator color="#fff" /> : <Text style={ms.primaryBtnText}>Salvar</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={ms.cancelBtn} onPress={closeModal}>
              <Text style={ms.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        );
      case "forgotPassword_email":
        return (
          <>
            <Text style={ms.title}>Recuperar senha</Text>
            <Text style={ms.subtitle}>Informe seu e-mail cadastrado.</Text>
            <PlainField label="E-mail" value={fpEmail} onChangeText={setFpEmail} placeholder="seu@email.com" keyboardType="email-address" />
            <TouchableOpacity style={[ms.primaryBtn, fpLoading && ms.disabled]} onPress={handleForgotPasswordEmail} disabled={fpLoading}>
              {fpLoading ? <ActivityIndicator color="#fff" /> : <Text style={ms.primaryBtnText}>Enviar instruções</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={ms.cancelBtn} onPress={closeModal}>
              <Text style={ms.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        );
      case "forgotPassword_reset":
        return (
          <>
            <Text style={ms.title}>Redefinir senha</Text>
            <Text style={ms.subtitle}>Insira o código e token recebidos por e-mail.</Text>
            <PlainField label="Código de Ativação" value={fpCode} onChangeText={(t: string) => setFpCode(t.toUpperCase())} placeholder="Ex: TESTE001" autoCapitalize="characters" />
            <PlainField label="Token" value={fpToken} onChangeText={(t: string) => setFpToken(t.toUpperCase())} placeholder="Ex: ABCD1234" autoCapitalize="characters" />
            <PasswordField label="Nova senha" value={fpNovaSenha} onChangeText={setFpNovaSenha} visible={fpSenhaVisible} onToggle={() => setFpSenhaVisible(v => !v)} />
            <PasswordStrength password={fpNovaSenha} />
            <PasswordField label="Confirmar senha" value={fpConfirmaSenha} onChangeText={setFpConfirmaSenha} visible={fpSenhaVisible} onToggle={() => setFpSenhaVisible(v => !v)} />
            <TouchableOpacity style={[ms.primaryBtn, fpLoading && ms.disabled]} onPress={handleResetPassword} disabled={fpLoading}>
              {fpLoading ? <ActivityIndicator color="#fff" /> : <Text style={ms.primaryBtnText}>Redefinir senha</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={ms.cancelBtn} onPress={closeModal}>
              <Text style={ms.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDF9" />
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.inner}>
            <Text style={s.greeting}>Olá! Seja bem{"\n"}vindo(a) de volta</Text>

            <View style={s.card}>
              {/* ID */}
              <Text style={s.label}>ID</Text>
              <TextInput
                id="login-input"
                style={[s.input, loginFocused && s.focusedInput]}
                value={loginInput}
                onChangeText={setLoginInput}
                placeholder="CNPJ, CPF ou e-mail"
                placeholderTextColor="#b0bec5"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onFocus={() => setLoginFocused(true)}
                onBlur={() => setLoginFocused(false)}
              />

              {/* Senha */}
              <Text style={[s.label, { marginTop: 18 }]}>Senha</Text>
              <View style={[s.passwordRow, senhaFocused && s.focusedRow]}>
                <TextInput
                  id="senha-input"
                  style={[s.input, { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="••••••••"
                  placeholderTextColor="#b0bec5"
                  secureTextEntry={!senhaVisible}
                  autoCapitalize="none"
                  onFocus={() => setSenhaFocused(true)}
                  onBlur={() => setSenhaFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setSenhaVisible(v => !v)}
                  style={s.eyeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <EyeIcon visible={senhaVisible} />
                </TouchableOpacity>
              </View>

              {/* Esqueci */}
              <TouchableOpacity style={s.forgotLink} onPress={() => setModalStep("forgotPassword_email")}>
                <Text style={s.forgotText}>Esqueci minha senha</Text>
              </TouchableOpacity>

              {/* Entrar */}
              <TouchableOpacity
                id="btn-entrar"
                style={[s.loginBtn, loading && s.disabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>Entrar</Text>}
              </TouchableOpacity>

              {/* Primeiro acesso */}
              <TouchableOpacity
                id="btn-primeiro-acesso"
                style={s.firstAccessBtn}
                onPress={() => setModalStep("firstAccess_credentials")}
                activeOpacity={0.8}
              >
                <Text style={s.firstAccessText}>Primeiro acesso</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalStep !== "none"} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={ms.overlay}>
          <View style={ms.sheet}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {renderModal()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ── Estilos principais ─────────────────────────────────────────────────────────

const CARD_MAX = 350;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FEFDF9",
  },
  scroll: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
    minHeight: height,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f2b3d",
    marginBottom: 28,
    lineHeight: 32,
    width: "100%",
    maxWidth: CARD_MAX,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: "100%",
    maxWidth: CARD_MAX,
    shadowColor: "#0f2b3d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f1f3f5",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#546e7a",
    marginBottom: 7,
    letterSpacing: 0.1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#0f2b3d",
    backgroundColor: "#fcfdfe",
    marginBottom: 2,
  },
  focusedInput: {
    borderColor: "#285A71",
    backgroundColor: "#fff",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 12,
    backgroundColor: "#fcfdfe",
    marginBottom: 2,
  },
  focusedRow: {
    borderColor: "#285A71",
    backgroundColor: "#fff",
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    color: "#285A71",
    fontWeight: "600",
  },
  loginBtn: {
    backgroundColor: "#285A71",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#285A71",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabled: { opacity: 0.55 },
  loginBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  firstAccessBtn: {
    backgroundColor: "#ECEFDA",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  firstAccessText: {
    color: "#285A71",
    fontSize: 14,
    fontWeight: "600",
  },
});

// ── Modal Styles ───────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 43, 61, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 48,
    maxHeight: "88%",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f2b3d",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#78909c",
    marginBottom: 22,
    lineHeight: 18,
  },
  fieldWrapper: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#546e7a",
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#0f2b3d",
    backgroundColor: "#fcfdfe",
  },
  focusedInput: {
    borderColor: "#285A71",
    backgroundColor: "#fff",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 12,
    backgroundColor: "#fcfdfe",
  },
  focusedRow: {
    borderColor: "#285A71",
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#0f2b3d",
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryBtn: {
    backgroundColor: "#285A71",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  disabled: { opacity: 0.55 },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#90a4ae",
    fontSize: 14,
    fontWeight: "600",
  },
});