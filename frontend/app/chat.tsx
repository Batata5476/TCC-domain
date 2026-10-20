import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { authenticatedFetch } from "../services/api";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type ContactItem = {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  role: string;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
};

type ChatListItem = {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage: string;
  time: string;
  unreadCount: number;
  role: string;
  messages: ChatMessage[];
};

export default function ChatScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  // No web, verificamos tanto windowWidth quanto window.innerWidth para garantir renderização desktop
  const effectiveWidth =
    windowWidth > 0
      ? windowWidth
      : Platform.OS === "web" && typeof window !== "undefined"
      ? window.innerWidth
      : 0;

  const isDesktop =
    effectiveWidth >= 680 ||
    (Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.innerWidth >= 680);

  // Estados
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [contactsList, setContactsList] = useState<ContactItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"mensagens" | "contatos">("mensagens");
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Carrega conversas do backend
  const loadConversations = async () => {
    try {
      const res = await authenticatedFetch("/chat/conversations");
      if (res.ok) {
        const body = await res.json();
        const loadedChats: ChatListItem[] = (body.data ?? []).map((c: any) => ({
          ...c,
          messages: Array.isArray(c.messages) ? c.messages : [],
        }));
        setChats(loadedChats);

        // Se for desktop e nenhuma conversa estiver aberta, seleciona a primeira por padrão
        if (isDesktop && loadedChats.length > 0) {
          setSelectedChat((prev) => {
            if (!prev) {
              handleOpenChat(loadedChats[0]);
              return { ...loadedChats[0], messages: [] };
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Carrega contatos da empresa do backend
  const loadContacts = async () => {
    try {
      const res = await authenticatedFetch("/chat/contacts");
      if (res.ok) {
        const body = await res.json();
        setContactsList(body.data ?? []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadConversations();
    loadContacts();
  }, []);

  // Lista filtrada de conversas com base na busca
  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.lastMessage &&
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Lista filtrada de contatos
  const filteredContacts = contactsList.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll para o fim das mensagens quando o chat muda ou novas mensagens chegam
  useEffect(() => {
    if (selectedChat) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [selectedChat?.id, selectedChat?.messages?.length]);

  // Abre uma conversa existente e carrega o histórico de mensagens
  const handleOpenChat = async (chat: ChatListItem) => {
    setSelectedChat((prev) => (prev?.id === chat.id ? prev : { ...chat, messages: [] }));
    try {
      const res = await authenticatedFetch(`/chat/${chat.id}/messages`);
      if (res.ok) {
        const body = await res.json();
        const loadedMessages = body.data ?? [];
        setSelectedChat({ ...chat, messages: loadedMessages });
        // Zera badge não lidas no chat local
        setChats((prev) =>
          prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Seleciona um contato da lista de contatos para criar ou abrir conversa
  const handleSelectContact = async (contact: ContactItem) => {
    try {
      const res = await authenticatedFetch("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ targetUserId: contact.id }),
      });
      if (res.ok) {
        const body = await res.json();
        const chatId = body.data?.id;
        if (chatId) {
          await loadConversations();
          const targetChat: ChatListItem = {
            id: chatId,
            name: contact.name,
            avatar: contact.avatar,
            online: contact.online,
            lastMessage: "Conversa iniciada",
            time: "Agora",
            unreadCount: 0,
            role: contact.role,
            messages: [],
          };
          handleOpenChat(targetChat);
          setActiveTab("mensagens");
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível abrir a conversa com este contato.");
    }
  };

  // Envia mensagem real via API com atualização instantânea na UI e foco mantido
  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;

    const textToSend = inputText.trim();
    setInputText("");

    // Mantém o foco no campo de texto imediatamente
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Atualização otimista instantânea
    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      text: textToSend,
      sender: "me",
      time: nowTime,
    };

    setSelectedChat((prev) =>
      prev
        ? {
            ...prev,
            lastMessage: textToSend,
            time: nowTime,
            messages: [...(prev.messages || []), tempMsg],
          }
        : null
    );

    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? {
              ...c,
              lastMessage: textToSend,
              time: nowTime,
            }
          : c
      )
    );

    try {
      const res = await authenticatedFetch("/chat", {
        method: "POST",
        body: JSON.stringify({
          fk_id_chat: selectedChat.id,
          conteudo_mensagens: textToSend,
        }),
      });

      if (res.ok) {
        const msgRes = await authenticatedFetch(`/chat/${selectedChat.id}/messages`);
        if (msgRes.ok) {
          const body = await msgRes.json();
          setSelectedChat((prev) =>
            prev ? { ...prev, messages: body.data ?? [] } : null
          );
        }
        loadConversations();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Erro", err.message || "Não foi possível enviar a mensagem.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Erro ao enviar a mensagem.");
    } finally {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  // ─── Renderização da Lista de Conversas / Contatos (Sidebar Esquerda) ─────────
  const renderSidebarContent = () => (
    <View style={styles.sidebarInner}>
      {/* Cabeçalho da Sidebar */}
      <View style={styles.sidebarHeader}>
        <View style={styles.sidebarHeaderLeft}>
          <TouchableOpacity
            style={styles.backToDashboardBtn}
            onPress={() => router.push("/dashboard")}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#285A71" />
          </TouchableOpacity>
          <View>
            <Text style={styles.sidebarHeaderTitle}>Conversas</Text>
            <Text style={styles.sidebarHeaderSubtitle}>Comunicação interna Coopera</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            setActiveTab(activeTab === "mensagens" ? "contatos" : "mensagens")
          }
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === "mensagens" ? "person-add-outline" : "chatbubbles-outline"}
            size={19}
            color="#285A71"
          />
        </TouchableOpacity>
      </View>

      {/* Caixa de Busca */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={17} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar conversas ou contatos..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={17} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Seletor de Abas (Conversas / Contatos) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "mensagens" && styles.tabButtonActive]}
          onPress={() => setActiveTab("mensagens")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chatbubbles"
            size={16}
            color={activeTab === "mensagens" ? "#285A71" : "#94A3B8"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "mensagens" && styles.tabLabelActive,
            ]}
          >
            Conversas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "contatos" && styles.tabButtonActive]}
          onPress={() => setActiveTab("contatos")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="people"
            size={16}
            color={activeTab === "contatos" ? "#285A71" : "#94A3B8"}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "contatos" && styles.tabLabelActive,
            ]}
          >
            Contatos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Conversas ou Contatos */}
      {activeTab === "mensagens" ? (
        <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
          {filteredChats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubbles-outline" size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma conversa</Text>
              <Text style={styles.emptySubtitle}>
                Inicie uma conversa na aba Contatos.
              </Text>
            </View>
          ) : (
            filteredChats.map((item) => {
              const isSelected = selectedChat?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chatCard, isSelected && styles.chatCardSelected]}
                  activeOpacity={0.7}
                  onPress={() => handleOpenChat(item)}
                >
                  <View style={styles.avatarContainer}>
                    <View
                      style={[styles.avatar, isSelected && styles.avatarSelected]}
                    >
                      <Text style={styles.avatarText}>{item.avatar}</Text>
                    </View>
                    {item.online && <View style={styles.onlineDot} />}
                  </View>

                  <View style={styles.chatDetails}>
                    <View style={styles.chatHeaderRow}>
                      <Text
                        style={[
                          styles.chatName,
                          isSelected && styles.chatNameSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.chatTime}>{item.time}</Text>
                    </View>
                    <View style={styles.chatMessageRow}>
                      <Text style={styles.chatMessage} numberOfLines={1}>
                        {item.lastMessage}
                      </Text>
                      {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 16 }} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
          {filteredContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.chatCard}
              activeOpacity={0.7}
              onPress={() => handleSelectContact(contact)}
            >
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, styles.contactAvatarBg]}>
                  <Text style={styles.avatarText}>{contact.avatar}</Text>
                </View>
                {contact.online && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.chatDetails}>
                <Text style={styles.chatName}>{contact.name}</Text>
                <Text style={styles.contactRole}>{contact.role}</Text>
              </View>

              <View style={styles.chatArrowCircle}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color="#285A71"
                />
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 16 }} />
        </ScrollView>
      )}

      {/* Barra de Navegação Inferior (Docked na base da sidebar) */}
      <View style={styles.sidebarBottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={() => router.push("/dashboard")}
        >
          <Ionicons name="home-outline" size={22} color="#94A3B8" />
          <Text style={[styles.navLabel, { color: "#94A3B8" }]}>central</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={() => router.push("/ponto-e")}
        >
          <Ionicons name="location-outline" size={22} color="#94A3B8" />
          <Text style={[styles.navLabel, { color: "#94A3B8" }]}>Ponto-E</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
          <Ionicons name="chatbubbles" size={22} color="#285A71" />
          <Text style={[styles.navLabel, { color: "#285A71" }]}>chats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Renderização da Conversa Aberta (Painel Direito / WhatsApp Style) ─────────
  const renderConversationContent = () => {
    if (!selectedChat) {
      return (
        <View style={styles.emptyConversationPane}>
          <View style={styles.emptyConversationIconCircle}>
            <Ionicons name="chatbubbles" size={60} color="#285A71" />
          </View>
          <Text style={styles.emptyConversationTitle}>Coopera Mensagens</Text>
          <Text style={styles.emptyConversationSubtitle}>
            Selecione uma conversa ao lado para visualizar o histórico e enviar
            mensagens em tempo real com sua equipe.
          </Text>
          <View style={styles.emptySecurityBadge}>
            <Ionicons
              name="lock-closed"
              size={14}
              color="#0D9488"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.emptySecurityText}>
              Criptografia de ponta a ponta ativa no canal Coopera
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.activeChatWrapper}>
        {/* Header da conversa estilo WhatsApp */}
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderLeft}>
            {!isDesktop && (
              <TouchableOpacity
                onPress={() => setSelectedChat(null)}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#285A71" />
              </TouchableOpacity>
            )}

            <View style={styles.avatarWrapper}>
              <View style={styles.avatarHeader}>
                <Text style={styles.avatarHeaderText}>{selectedChat.avatar}</Text>
              </View>
              {selectedChat.online && <View style={styles.avatarOnlineBadge} />}
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.headerName} numberOfLines={1}>
                {selectedChat.name}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDotSmall,
                    selectedChat.online ? styles.dotOnline : styles.dotOffline,
                  ]}
                />
                <Text style={styles.headerSubtitle}>
                  {selectedChat.online
                    ? "Online agora"
                    : selectedChat.role || "Offline"}
                </Text>
              </View>
            </View>
          </View>

          {/* Ações Rápidas no Cabeçalho */}
          <View style={styles.chatHeaderActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() =>
                Alert.alert("Chamada de Voz", "Recurso de chamada em desenvolvimento.")
              }
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={19} color="#285A71" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() =>
                Alert.alert(
                  "Videoconferência",
                  "Recurso de videoconferência corporativa em desenvolvimento."
                )
              }
              activeOpacity={0.7}
            >
              <Ionicons name="videocam-outline" size={20} color="#285A71" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Feed de Mensagens */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.messageContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner de Segurança & Criptografia */}
          <View style={styles.securityPill}>
            <Ionicons
              name="lock-closed"
              size={12}
              color="#0D9488"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.securityPillText}>
              Canal corporativo Coopera com criptografia ponta a ponta
            </Text>
          </View>

          {/* Divisor de Data */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>Hoje</Text>
          </View>

          {(selectedChat.messages || []).map((msg) => {
            const isMe = msg.sender === "me";
            return (
              <View
                key={msg.id}
                style={[
                  styles.msgRow,
                  isMe ? styles.msgRowRight : styles.msgRowLeft,
                ]}
              >
                {!isMe && (
                  <View style={styles.msgAvatarThem}>
                    <Text style={styles.msgAvatarText}>{selectedChat.avatar}</Text>
                  </View>
                )}

                <View
                  style={[
                    styles.msgBubble,
                    isMe ? styles.msgBubbleRight : styles.msgBubbleLeft,
                  ]}
                >
                  {!isMe && (
                    <Text style={styles.msgSenderName}>{selectedChat.name}</Text>
                  )}
                  <Text
                    style={[
                      styles.msgText,
                      isMe ? styles.msgTextRight : styles.msgTextLeft,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <View style={styles.msgFooter}>
                    <Text
                      style={[
                        styles.msgTime,
                        isMe ? styles.msgTimeRight : styles.msgTimeLeft,
                      ]}
                    >
                      {msg.time}
                    </Text>
                    {isMe && (
                      <Ionicons
                        name="checkmark-done"
                        size={14}
                        color="#6EE7B7"
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {isTyping && (
            <View style={[styles.msgRow, styles.msgRowLeft]}>
              <View style={styles.msgAvatarThem}>
                <Text style={styles.msgAvatarText}>{selectedChat.avatar}</Text>
              </View>
              <View
                style={[
                  styles.msgBubble,
                  styles.msgBubbleLeft,
                  styles.typingBubble,
                ]}
              >
                <Text
                  style={[
                    styles.msgText,
                    styles.msgTextLeft,
                    { fontStyle: "italic", opacity: 0.75 },
                  ]}
                >
                  Digitando...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input de Mensagem estilo WhatsApp */}
        {renderInputArea()}
      </View>
    );
  };

  const renderInputArea = () => (
    <View style={styles.inputArea}>
      <View style={styles.inputCapsule}>
        <TouchableOpacity
          style={styles.capsuleIconBtn}
          activeOpacity={0.7}
          onPress={() =>
            Alert.alert("Anexar", "Envio de anexos e documentos em desenvolvimento.")
          }
        >
          <Ionicons name="attach-outline" size={22} color="#64748B" />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.chatInput}
          placeholder="Escreva sua mensagem..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          blurOnSubmit={false}
          onSubmitEditing={handleSendMessage}
        />

        <TouchableOpacity
          style={styles.capsuleIconBtn}
          activeOpacity={0.7}
          onPress={() => setInputText((prev) => prev + " 😊")}
        >
          <Ionicons name="happy-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
        onPress={() => {
          handleSendMessage();
          inputRef.current?.focus();
        }}
        disabled={!inputText.trim()}
        activeOpacity={0.85}
        // @ts-ignore
        onMouseDown={(e: any) => {
          if (Platform.OS === "web") {
            e.preventDefault();
          }
        }}
      >
        <Ionicons name="send" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  // ─── Layout Completo: WhatsApp Web Split-Pane 100% da Tela ───────────────────
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {isDesktop ? (
          // Layout Desktop: Ocupa a tela inteira com contatos na esquerda e conversa na direita
          <View style={styles.whatsappDesktopContainer}>
            <View style={styles.whatsappSidebar}>
              {renderSidebarContent()}
            </View>
            <View style={styles.whatsappChatPane}>
              {renderConversationContent()}
            </View>
          </View>
        ) : (
          // Layout Mobile: Alterna entre Lista e Conversa Aberta
          <View style={styles.mobileContainer}>
            {selectedChat ? renderConversationContent() : renderSidebarContent()}
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

// ─── Estilos WhatsApp Web Split-Pane ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: Platform.OS === "web" ? ("100vh" as any) : "100%",
    backgroundColor: "#F8FAFC",
  },

  // ─── Container Desktop (WhatsApp Web) ───────────────────────────────────────
  whatsappDesktopContainer: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  whatsappSidebar: {
    width: 380,
    minWidth: 320,
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  whatsappChatPane: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },

  // ─── Container Mobile ───────────────────────────────────────────────────────
  mobileContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  // ─── Conteúdo da Sidebar ────────────────────────────────────────────────────
  sidebarInner: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sidebarHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backToDashboardBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F2B3D",
    letterSpacing: -0.4,
  },
  sidebarHeaderSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 1,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#0F2B3D",
    height: "100%",
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 14,
    marginBottom: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
  },
  tabLabelActive: {
    color: "#285A71",
    fontWeight: "700",
  },
  scrollList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 16,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chatCardSelected: {
    backgroundColor: "#EBF3F6",
    borderColor: "#CCE3ED",
    borderLeftWidth: 4,
    borderLeftColor: "#285A71",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#285A71",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSelected: {
    backgroundColor: "#204658",
  },
  contactAvatarBg: {
    backgroundColor: "#10B981",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  chatDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  chatHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  chatName: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#0F2B3D",
  },
  chatNameSelected: {
    fontWeight: "700",
    color: "#285A71",
  },
  chatTime: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  chatMessageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatMessage: {
    fontSize: 12.5,
    color: "#64748B",
    flex: 1,
    marginRight: 6,
  },
  unreadBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  contactRole: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  chatArrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  // Barra de navegação inferior da sidebar
  sidebarBottomNav: {
    height: 60,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 4,
  },
  navButton: {
    minWidth: 54,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "700",
  },

  // ─── Placeholder de Conversa Vazia (WhatsApp Web Style) ─────────────────────
  emptyConversationPane: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "#F8FAFC",
  },
  emptyConversationIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EDF5F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyConversationTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F2B3D",
    marginBottom: 8,
  },
  emptyConversationSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    maxWidth: 440,
    lineHeight: 22,
    marginBottom: 28,
  },
  emptySecurityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4F2",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CCEBE6",
  },
  emptySecurityText: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "600",
  },

  // ─── Área da Conversa Ativa ─────────────────────────────────────────────────
  activeChatWrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    height: 66,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 10,
  },
  chatHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 12,
  },
  avatarHeader: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#285A71",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHeaderText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  avatarOnlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#0F2B3D",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  dotOnline: {
    backgroundColor: "#10B981",
  },
  dotOffline: {
    backgroundColor: "#94A3B8",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  chatHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  messageScroll: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  messageContainer: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 24,
  },
  securityPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#E6F4F2",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#CCEBE6",
  },
  securityPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0D9488",
  },
  dateBadge: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  msgRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-end",
  },
  msgRowRight: {
    justifyContent: "flex-end",
  },
  msgRowLeft: {
    justifyContent: "flex-start",
  },
  msgAvatarThem: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#285A71",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 2,
  },
  msgAvatarText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  msgBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  msgBubbleRight: {
    backgroundColor: "#285A71",
    borderBottomRightRadius: 4,
    shadowColor: "#285A71",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  msgBubbleLeft: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  msgSenderName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#285A71",
    marginBottom: 3,
  },
  msgText: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  msgTextRight: {
    color: "#FFFFFF",
  },
  msgTextLeft: {
    color: "#0F2B3D",
  },
  msgFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  msgTime: {
    fontSize: 10,
    fontWeight: "500",
  },
  msgTimeRight: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  msgTimeLeft: {
    color: "#94A3B8",
  },
  typingBubble: {
    backgroundColor: "#F1F5F9",
    borderWidth: 0,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 10,
  },
  inputCapsule: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
  },
  capsuleIconBtn: {
    padding: 6,
  },
  chatInput: {
    flex: 1,
    height: 44,
    fontSize: 14.5,
    color: "#0F2B3D",
    paddingHorizontal: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#285A71",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#285A71",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
  },
});
