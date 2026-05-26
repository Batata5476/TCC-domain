import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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

// ─── Dados Demonstrativos (Mock) ─────────────────────────────────────────────

const INITIAL_CHATS: ChatListItem[] = [
  {
    id: 1,
    name: "Ana Silva",
    avatar: "AS",
    online: true,
    role: "Recursos Humanos",
    lastMessage: "Oi! Você já enviou o relatório de desempenho mensal?",
    time: "10:42",
    unreadCount: 2,
    messages: [
      { id: "1", text: "Olá! Tudo bem?", sender: "them", time: "10:39" },
      { id: "2", text: "Tudo ótimo, e com você?", sender: "me", time: "10:40" },
      { id: "3", text: "Oi! Você já enviou o relatório de desempenho mensal?", sender: "them", time: "10:42" },
    ],
  },
  {
    id: 2,
    name: "Carlos Souza",
    avatar: "CS",
    online: true,
    role: "Líder de TI",
    lastMessage: "Tudo bem, nos vemos amanhã na sprint review.",
    time: "Ontem",
    unreadCount: 0,
    messages: [
      { id: "1", text: "Conseguiu rodar a build no simulador?", sender: "them", time: "Ontem 17:30" },
      { id: "2", text: "Sim! Funcionou perfeitamente após limpar o cache.", sender: "me", time: "Ontem 17:35" },
      { id: "3", text: "Tudo bem, nos vemos amanhã na sprint review.", sender: "them", time: "Ontem 17:36" },
    ],
  },
  {
    id: 3,
    name: "Grupo Coopera Geral",
    avatar: "CG",
    online: false,
    role: "Canal Geral",
    lastMessage: "Aviso: Reunião geral amanhã às 14h sobre os novos objetivos.",
    time: "Ontem",
    unreadCount: 5,
    messages: [
      { id: "1", text: "Olá time! Sejam bem-vindos ao canal.", sender: "them", time: "24 Mai 09:00" },
      { id: "2", text: "Obrigado!", sender: "me", time: "24 Mai 09:05" },
      { id: "3", text: "Aviso: Reunião geral amanhã às 14h sobre os novos objetivos.", sender: "them", time: "Ontem 18:00" },
    ],
  },
  {
    id: 4,
    name: "Mariana Costa",
    avatar: "MC",
    online: false,
    role: "Financeiro",
    lastMessage: "Comprovante recebido. Seu reembolso foi processado.",
    time: "22 Mai",
    unreadCount: 0,
    messages: [
      { id: "1", text: "Olá Mariana, segue o comprovante do táxi.", sender: "me", time: "22 Mai 14:10" },
      { id: "2", text: "Comprovante recebido. Seu reembolso foi processado.", sender: "them", time: "22 Mai 14:15" },
    ],
  },
  {
    id: 5,
    name: "Rodrigo Lins",
    avatar: "RL",
    online: true,
    role: "Gerente de Projetos",
    lastMessage: "Excelente trabalho na entrega da última tarefa!",
    time: "20 Mai",
    unreadCount: 0,
    messages: [
      { id: "1", text: "Enviei as telas prontas no Figma.", sender: "me", time: "20 Mai 11:00" },
      { id: "2", text: "Excelente trabalho na entrega da última tarefa!", sender: "them", time: "20 Mai 11:15" },
    ],
  },
];

// Respostas automáticas simuladas para cada contato
const AUTO_RESPONSES: Record<number, string[]> = {
  1: [
    "Obrigada pelo retorno! Vou analisar o documento aqui.",
    "Perfeito! Se eu precisar de mais alguma coisa, te chamo por aqui.",
    "Tudo bem. Tenha um ótimo dia de trabalho! 👍",
  ],
  2: [
    "Boa! Vamos apresentar isso para a diretoria na reunião.",
    "Show! Qualquer impedimento no deploy pode falar comigo.",
    "Beleza, até amanhã então!",
  ],
  3: [
    "Mensagem registrada no canal geral do Coopera. 📣",
    "Lembrando a todos de preencherem seus roadmaps individuais no app!",
  ],
  4: [
    "Perfeito! Entra na próxima folha de pagamento.",
    "Qualquer dúvida fiscal pode mandar por email para financeiro@coopera.com.br",
  ],
  5: [
    "Excelente! Acompanhe o status das sprints no painel da empresa.",
    "Muito obrigado pelo comprometimento!",
  ],
};

export default function ChatScreen() {
  const router = useRouter();

  // Estados
  const [chats, setChats] = useState<ChatListItem[]>(INITIAL_CHATS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"mensagens" | "contatos">("mensagens");
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Lista filtrada de conversas com base na busca
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lista de contatos (apenas contatos individuais)
  const contactsList = chats.map(c => ({
    id: c.id,
    name: c.name,
    avatar: c.avatar,
    online: c.online,
    role: c.role,
  }));

  // Auto-scroll para o fim das mensagens quando abre um chat ou envia mensagem
  useEffect(() => {
    if (selectedChat) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [selectedChat, selectedChat?.messages]);

  // Abre uma conversa
  const handleOpenChat = (chat: ChatListItem) => {
    setSelectedChat(chat);
    // Limpa contagem de não lidas ao abrir
    setChats(prev =>
      prev.map(c => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Envia mensagem
  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedChat) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      text: inputText.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...selectedChat.messages, newMessage];

    // Atualiza a conversa selecionada e a lista global
    const updatedChat = {
      ...selectedChat,
      messages: updatedMessages,
      lastMessage: inputText.trim(),
      time: "Agora",
    };

    setSelectedChat(updatedChat);
    setChats(prev => prev.map(c => (c.id === selectedChat.id ? updatedChat : c)));
    setInputText("");

    // Resposta automática simulada (bot do demo)
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = AUTO_RESPONSES[selectedChat.id] || ["Mensagem recebida com sucesso!"];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];

      const botReply: ChatMessage = {
        id: Math.random().toString(),
        text: randomReply,
        sender: "them",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, botReply];
      const finalChat = {
        ...updatedChat,
        messages: finalMessages,
        lastMessage: randomReply,
        time: "Agora",
      };

      if (selectedChat.id === finalChat.id) {
        setSelectedChat(finalChat);
      }
      setChats(prev => prev.map(c => (c.id === finalChat.id ? finalChat : c)));
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho superior */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensagens</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert("Novo Chat", "Esta é uma demonstração visual. Em breve você poderá criar novos chats com seus colaboradores.")}
        >
          <Ionicons name="create-outline" size={24} color="#285A71" />
        </TouchableOpacity>
      </View>

      {/* Caixa de Busca */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar conversas..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Seletor de Abas (Mensagens / Contatos) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "mensagens" && styles.tabButtonActive]}
          onPress={() => setActiveTab("mensagens")}
        >
          <Text style={[styles.tabLabel, activeTab === "mensagens" && styles.tabLabelActive]}>
            Conversas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "contatos" && styles.tabButtonActive]}
          onPress={() => setActiveTab("contatos")}
        >
          <Text style={[styles.tabLabel, activeTab === "contatos" && styles.tabLabelActive]}>
            Contatos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo Principal */}
      {activeTab === "mensagens" ? (
        <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
          {filteredChats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Nenhuma conversa encontrada</Text>
            </View>
          ) : (
            filteredChats.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.chatItem}
                activeOpacity={0.7}
                onPress={() => handleOpenChat(item)}
              >
                {/* Avatar com indicador online */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.avatar}</Text>
                  </View>
                  {item.online && <View style={styles.onlineDot} />}
                </View>

                {/* Texto da conversa */}
                <View style={styles.chatDetails}>
                  <View style={styles.chatHeaderRow}>
                    <Text style={styles.chatName} numberOfLines={1}>
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
            ))
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
          {contactsList.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.chatItem}
              activeOpacity={0.7}
              onPress={() => {
                const foundChat = chats.find(c => c.id === contact.id);
                if (foundChat) handleOpenChat(foundChat);
              }}
            >
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: "#66B300" }]}>
                  <Text style={styles.avatarText}>{contact.avatar}</Text>
                </View>
                {contact.online && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.chatDetails}>
                <Text style={styles.chatName}>{contact.name}</Text>
                <Text style={styles.contactRole}>{contact.role}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* Barra de Navegação Inferior (Alinhada ao visual do app) */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={() => router.push("/dashboard")}
        >
          <Ionicons name="home" size={26} color="#94A3B8" />
          <Text style={[styles.navLabel, { color: "#94A3B8" }]}>central</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
          <Ionicons name="chatbubble-ellipses" size={26} color="#285A71" />
          <Text style={[styles.navLabel, { color: "#285A71" }]}>chats</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Modal de Conversa Ativa ───────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={selectedChat !== null}
        onRequestClose={() => setSelectedChat(null)}
      >
        {selectedChat && (
          <SafeAreaView style={styles.modalContainer}>
            {/* Header da conversa */}
            <View style={styles.chatHeader}>
              <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color="#285A71" />
                <Text style={styles.backBtnText}>Voltar</Text>
              </TouchableOpacity>

              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{selectedChat.name}</Text>
                <Text style={styles.headerSubtitle}>
                  {selectedChat.online ? "Online agora" : "Offline"}
                </Text>
              </View>

              <View style={styles.avatarSmall}>
                <Text style={styles.avatarSmallText}>{selectedChat.avatar}</Text>
              </View>
            </View>

            {/* Balões de Mensagens */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messageScroll}
              contentContainerStyle={styles.messageContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.disclaimerText}>
                Esta é uma conversa demonstrativa interativa. Digite algo abaixo!
              </Text>

              {selectedChat.messages.map((msg) => {
                const isMe = msg.sender === "me";
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.msgRow,
                      isMe ? styles.msgRowRight : styles.msgRowLeft,
                    ]}
                  >
                    <View
                      style={[
                        styles.msgBubble,
                        isMe ? styles.msgBubbleRight : styles.msgBubbleLeft,
                      ]}
                    >
                      <Text style={[styles.msgText, isMe ? styles.msgTextRight : styles.msgTextLeft]}>
                        {msg.text}
                      </Text>
                      <Text style={[styles.msgTime, isMe ? styles.msgTimeRight : styles.msgTimeLeft]}>
                        {msg.time}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {isTyping && (
                <View style={[styles.msgRow, styles.msgRowLeft]}>
                  <View style={[styles.msgBubble, styles.msgBubbleLeft, styles.typingBubble]}>
                    <Text style={[styles.msgText, styles.msgTextLeft, { fontStyle: "italic", opacity: 0.7 }]}>
                      Digitando...
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input de Mensagem */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
              <View style={styles.inputArea}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Escreva sua mensagem..."
                  placeholderTextColor="#94A3B8"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSendMessage}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim()}
                >
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFDF9",
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#285A71",
  },

  actionButton: {
    padding: 6,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECEFD9",
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    height: 46,
    borderWidth: 0.5,
    borderColor: "#285A71",
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#285A71",
    height: "100%",
  },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: "#285A71",
  },

  tabLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
  },

  tabLabelActive: {
    color: "#285A71",
  },

  scrollList: {
    flex: 1,
    paddingHorizontal: 20,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },

  emptyText: {
    fontSize: 15,
    color: "#94A3B8",
    fontWeight: "600",
  },

  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECEFD9",
    padding: 16,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: "#000000",
    marginBottom: 12,
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#285A71",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FEFDF9",
  },

  chatDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },

  chatHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  chatName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#285A71",
  },

  chatTime: {
    fontSize: 11,
    color: "#64748B",
  },

  chatMessageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chatMessage: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
    marginRight: 8,
  },

  unreadBadge: {
    backgroundColor: "#66B300",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  unreadText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  contactRole: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  bottomNavigation: {
    height: 80,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  navButton: {
    minWidth: 64,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  navLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
  },

  // Estilos da Conversa Ativa (Modal)

  modalContainer: {
    flex: 1,
    backgroundColor: "#FEFDF9",
  },

  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#ECEFD9",
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  backBtnText: {
    fontSize: 16,
    color: "#285A71",
    fontWeight: "600",
  },

  headerInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#285A71",
  },

  headerSubtitle: {
    fontSize: 11,
    color: "#22C55E",
    fontWeight: "600",
    marginTop: 2,
  },

  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#285A71",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarSmallText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  messageScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },

  messageContainer: {
    paddingVertical: 16,
    gap: 12,
  },

  disclaimerText: {
    textAlign: "center",
    fontSize: 11,
    color: "#64748B",
    backgroundColor: "#ECEFD9",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    fontWeight: "600",
  },

  msgRow: {
    flexDirection: "row",
    width: "100%",
  },

  msgRowRight: {
    justifyContent: "flex-end",
  },

  msgRowLeft: {
    justifyContent: "flex-start",
  },

  msgBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },

  msgBubbleRight: {
    backgroundColor: "#285A71",
    borderBottomRightRadius: 4,
  },

  msgBubbleLeft: {
    backgroundColor: "#ECEFD9",
    borderBottomLeftRadius: 4,
  },

  typingBubble: {
    opacity: 0.8,
  },

  msgText: {
    fontSize: 14,
    lineHeight: 18,
  },

  msgTextRight: {
    color: "#FFFFFF",
  },

  msgTextLeft: {
    color: "#285A71",
  },

  msgTime: {
    fontSize: 9,
    marginTop: 4,
    textAlign: "right",
  },

  msgTimeRight: {
    color: "rgba(255, 255, 255, 0.7)",
  },

  msgTimeLeft: {
    color: "#64748B",
  },

  inputArea: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: 10,
  },

  chatInput: {
    flex: 1,
    height: 42,
    backgroundColor: "#ECEFD9",
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#285A71",
    borderWidth: 0.5,
    borderColor: "#285A71",
  },

  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#285A71",
    alignItems: "center",
    justifyContent: "center",
  },

  sendBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
});
