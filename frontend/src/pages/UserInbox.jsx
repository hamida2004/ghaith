import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";

// =====================================================================
// STYLES
// =====================================================================
const Title = styled.h1`
  color: ${colors.main};
  margin-bottom: 20px;
`;

const Layout = styled.div`
  display: flex;
  gap: 20px;
  height: 72vh;
  min-height: 420px;
`;

// ── Left: conversation list ──────────────────────────────────────────
const Sidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
`;

const NewBtn = styled.button`
  width: 100%;
  padding: 10px;
  background: ${colors.main};
  color: white;
  border: none;
  border-radius: 9px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
`;

const ConvCard = styled.div`
  background: ${(p) => (p.active ? colors.main + "15" : "white")};
  border: 2px solid ${(p) => (p.active ? colors.main : "#eee")};
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border 0.15s;
`;

const ConvSubject = styled.p`
  font-weight: 700;
  font-size: 14px;
  margin: 0 0 3px;
  color: ${colors.main};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ConvMeta = styled.p`
  font-size: 12px;
  color: #888;
  margin: 0;
`;

const UnreadDot = styled.span`
  background: ${colors.main};
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const StatusBadge = styled.span`
  padding: 2px 7px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(p) => (p.status === "open" ? "#27ae60" : "#95a5a6")};
  margin-left: 6px;
`;

// ── Right: chat panel ────────────────────────────────────────────────
const ChatPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
`;

const ChatHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatSubject = styled.p`
  font-weight: 700;
  font-size: 15px;
  margin: 0;
  color: ${colors.main};
`;

const ChatMeta = styled.p`
  font-size: 12px;
  color: #aaa;
  margin: 2px 0 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallBtn = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => p.bg || "#eee"};
  color: ${(p) => p.color || "#333"};
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Bubble = styled.div`
  max-width: 68%;
  padding: 10px 14px;
  border-radius: ${(p) =>
    p.mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px"};
  background: ${(p) => (p.mine ? colors.main : "#f0f2f5")};
  color: ${(p) => (p.mine ? "white" : "#222")};
  align-self: ${(p) => (p.mine ? "flex-end" : "flex-start")};
  font-size: 14px;
  line-height: 1.5;
`;

const BubbleMeta = styled.p`
  font-size: 11px;
  color: ${(p) => (p.mine ? "rgba(255,255,255,0.65)" : "#aaa")};
  margin: 4px 0 0;
  text-align: ${(p) => (p.mine ? "right" : "left")};
`;

const EmptyChat = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 15px;
  flex-direction: column;
  gap: 8px;
`;

const ComposerRow = styled.div`
  padding: 12px 14px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
`;

const TextArea = styled.textarea`
  flex: 1;
  resize: none;
  border: 1px solid #ddd;
  border-radius: 9px;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
  outline: none;

  &:focus {
    border-color: ${colors.main};
  }
`;

const SendBtn = styled.button`
  padding: 10px 20px;
  background: ${(p) => (p.disabled ? "#ccc" : colors.main)};
  color: white;
  border: none;
  border-radius: 9px;
  font-weight: 700;
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  align-self: flex-end;
`;

// ── New conversation modal ───────────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  background: white;
  border-radius: 14px;
  padding: 28px;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${colors.main};
  font-size: 18px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

// =====================================================================
// COMPONENT
// =====================================================================
const POLL_MS = 10_000; // re-fetch messages every 10 s

export const UserInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // ── Fetch conversation list ────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get("/messages/conversations/me");
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ── Fetch current user ────────────────────────────────────────────
  useEffect(() => {
    axios.get("/users/me").then((r) => setCurrentUser(r.data)).catch(console.error);
    fetchConversations();
  }, [fetchConversations]);

  // ── Load messages for active conversation ─────────────────────────
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const res = await axios.get(`/messages/conversations/${convId}/messages`);
      setMessages(res.data.messages);
      setActiveConv(res.data.conversation);
      // refresh unread count in sidebar
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  }, [fetchConversations]);

  // ── Switch active conversation ────────────────────────────────────
  const openConversation = (id) => {
    setActiveId(id);
    setMessages([]);
    fetchMessages(id);
  };

  // ── Auto-scroll to bottom when messages change ────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Polling: refresh messages while a conversation is open ────────
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeId) return;
    pollRef.current = setInterval(() => fetchMessages(activeId), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [activeId, fetchMessages]);

  // ── Send message ─────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!body.trim() || !activeId || sending) return;
    setSending(true);
    try {
      await axios.post(`/messages/conversations/${activeId}/messages`, { body });
      setBody("");
      await fetchMessages(activeId);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Start new conversation ────────────────────────────────────────
  const createConversation = async () => {
    if (!subject.trim()) return;
    try {
      const res = await axios.post("/messages/conversations", { subject });
      await fetchConversations();
      setShowModal(false);
      setSubject("");
      openConversation(res.data.id);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create conversation");
    }
  };

  // ── Close conversation ────────────────────────────────────────────
  const closeConversation = async () => {
    if (!activeId) return;
    try {
      await axios.patch(`/messages/conversations/${activeId}/close`);
      await fetchConversations();
      await fetchMessages(activeId);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to close");
    }
  };

  // =====================================================================
  // UI
  // =====================================================================
  return (
    <PageContainer>
      <Title>My Messages</Title>

      <Layout>
        {/* ── Sidebar ── */}
        <Sidebar>
          <NewBtn onClick={() => setShowModal(true)}>+ New conversation</NewBtn>

          {conversations.length === 0 && (
            <p style={{ color: "#aaa", fontSize: 13, textAlign: "center" }}>
              No conversations yet.
            </p>
          )}

          {conversations.map((c) => (
            <ConvCard
              key={c.id}
              active={c.id === activeId}
              onClick={() => openConversation(c.id)}
            >
              <ConvSubject>
                <span>{c.subject}</span>
                {c.unread > 0 && <UnreadDot>{c.unread}</UnreadDot>}
              </ConvSubject>
              <ConvMeta>
                {c.AssignedAdmin
                  ? `Admin: ${c.AssignedAdmin.name}`
                  : "Waiting for admin"}
                <StatusBadge status={c.status}>{c.status}</StatusBadge>
              </ConvMeta>
              <ConvMeta>
                {new Date(c.updatedAt).toLocaleDateString()}
              </ConvMeta>
            </ConvCard>
          ))}
        </Sidebar>

        {/* ── Chat panel ── */}
        <ChatPanel>
          {!activeId ? (
            <EmptyChat>
              <span style={{ fontSize: 36 }}>💬</span>
              <span>Select a conversation or start a new one</span>
            </EmptyChat>
          ) : (
            <>
              <ChatHeader>
                <div>
                  <ChatSubject>{activeConv?.subject}</ChatSubject>
                  <ChatMeta>
                    {activeConv?.AssignedAdmin
                      ? `Handled by ${activeConv.AssignedAdmin.name}`
                      : "Awaiting admin reply"}
                    <StatusBadge status={activeConv?.status}>
                      {activeConv?.status}
                    </StatusBadge>
                  </ChatMeta>
                </div>

                <HeaderActions>
                  {activeConv?.status === "open" && (
                    <SmallBtn
                      bg="#e74c3c20"
                      color="#e74c3c"
                      onClick={closeConversation}
                    >
                      Close
                    </SmallBtn>
                  )}
                </HeaderActions>
              </ChatHeader>

              <Messages>
                {messages.length === 0 && (
                  <p style={{ color: "#ccc", textAlign: "center", marginTop: 40 }}>
                    No messages yet — say hello 👋
                  </p>
                )}

                {messages.map((m) => {
                  const mine = m.sender_id === currentUser?.id;
                  return (
                    <div key={m.id}>
                      <Bubble mine={mine}>{m.body}</Bubble>
                      <BubbleMeta mine={mine}>
                        {m.Sender?.name} ·{" "}
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </BubbleMeta>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </Messages>

              {activeConv?.status === "closed" ? (
                <ComposerRow>
                  <p style={{ color: "#aaa", fontSize: 13, margin: "auto" }}>
                    Conversation closed — send a message to reopen it.
                  </p>
                </ComposerRow>
              ) : null}

              <ComposerRow>
                <TextArea
                  rows={2}
                  placeholder="Type a message… (Enter to send)"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <SendBtn
                  disabled={!body.trim() || sending}
                  onClick={sendMessage}
                >
                  {sending ? "…" : "Send"}
                </SendBtn>
              </ComposerRow>
            </>
          )}
        </ChatPanel>
      </Layout>

      {/* ── New conversation modal ── */}
      {showModal && (
        <Overlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>New conversation</ModalTitle>

            <Input
              placeholder="Subject (e.g. Question about my donation)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createConversation()}
              autoFocus
            />

            <ModalActions>
              <SmallBtn onClick={() => setShowModal(false)}>Cancel</SmallBtn>
              <SmallBtn
                bg={colors.main}
                color="white"
                onClick={createConversation}
              >
                Start
              </SmallBtn>
            </ModalActions>
          </Modal>
        </Overlay>
      )}
    </PageContainer>
  );
};
