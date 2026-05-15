import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";

// =====================================================================
// STYLES (same design language as UserInbox)
// =====================================================================
const Title = styled.h1`
  color: ${colors.main};
  margin-bottom: 6px;
`;

const Subtitle = styled.p`
  color: #888;
  font-size: 13px;
  margin-bottom: 18px;
`;

const Layout = styled.div`
  display: flex;
  gap: 20px;
  height: 72vh;
  min-height: 420px;
`;

// ── Sidebar ──────────────────────────────────────────────────────────
const Sidebar = styled.div`
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 12px;
  background: white;
`;

const SectionHeader = styled.div`
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
`;

const ConvItem = styled.div`
  padding: 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f3f3f3;
  background: ${(p) => (p.active ? colors.main + "12" : "transparent")};
  border-left: 3px solid
    ${(p) => (p.active ? colors.main : "transparent")};
  transition: background 0.1s;

  &:hover {
    background: ${(p) => (p.active ? colors.main + "12" : "#f8f9fa")};
  }
`;

const ConvSubject = styled.p`
  font-weight: 700;
  font-size: 14px;
  margin: 0 0 3px;
  color: #1a1a2e;
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
  flex-shrink: 0;
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

const UnclaimedBadge = styled.span`
  font-size: 10px;
  background: #fff3cd;
  color: #856404;
  border-radius: 6px;
  padding: 2px 6px;
  font-weight: 700;
  margin-left: 4px;
`;

// ── Chat panel ───────────────────────────────────────────────────────
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
  align-items: flex-start;
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
  flex-shrink: 0;
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

const ClosedBanner = styled.div`
  background: #f8f8f8;
  color: #aaa;
  text-align: center;
  padding: 10px;
  font-size: 13px;
  border-top: 1px solid #eee;
`;

// =====================================================================
// COMPONENT
// =====================================================================
const POLL_MS = 10_000;

export const AdminInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // ── Fetch conversation list ────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get("/messages/admin/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    axios.get("/users/me").then((r) => setCurrentAdmin(r.data)).catch(console.error);
    fetchConversations();
  }, [fetchConversations]);

  // ── Load messages ─────────────────────────────────────────────────
  const fetchMessages = useCallback(
    async (convId) => {
      if (!convId) return;
      try {
        const res = await axios.get(
          `/messages/conversations/${convId}/messages`
        );
        setMessages(res.data.messages);
        setActiveConv(res.data.conversation);
        fetchConversations(); // refresh unread counts in sidebar
      } catch (err) {
        console.error(err);
      }
    },
    [fetchConversations]
  );

  const openConversation = (id) => {
    setActiveId(id);
    setMessages([]);
    fetchMessages(id);
  };

  // ── Auto-scroll ───────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Polling ───────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeId) return;
    pollRef.current = setInterval(() => fetchMessages(activeId), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [activeId, fetchMessages]);

  // ── Send message ──────────────────────────────────────────────────
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

  // ── Close conversation ────────────────────────────────────────────
  const closeConversation = async () => {
    if (!activeId) return;
    try {
      await axios.patch(`/messages/admin/conversations/${activeId}/close`);
      await fetchConversations();
      await fetchMessages(activeId);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to close");
    }
  };

  // ── Split conversations: unclaimed vs mine ────────────────────────
  const unclaimed = conversations.filter((c) => !c.assigned_admin_id);
  const mine = conversations.filter(
    (c) => c.assigned_admin_id === currentAdmin?.id
  );

  // ── Render a sidebar item ─────────────────────────────────────────
  const renderItem = (c) => (
    <ConvItem
      key={c.id}
      active={c.id === activeId}
      onClick={() => openConversation(c.id)}
    >
      <ConvSubject>
        <span>
          {c.subject}
          {!c.assigned_admin_id && <UnclaimedBadge>NEW</UnclaimedBadge>}
        </span>
        {c.unread > 0 && <UnreadDot>{c.unread}</UnreadDot>}
      </ConvSubject>
      <ConvMeta>
        From: {c.User?.name}
        <StatusBadge status={c.status}>{c.status}</StatusBadge>
      </ConvMeta>
      <ConvMeta>{new Date(c.updatedAt).toLocaleDateString()}</ConvMeta>
    </ConvItem>
  );

  // =====================================================================
  // UI
  // =====================================================================
  const isOwner =
    !activeConv?.assigned_admin_id ||
    activeConv?.assigned_admin_id === currentAdmin?.id;

  const canReply =
    activeConv?.status === "open" && isOwner;

  return (
    <PageContainer>
      <Title>Admin Inbox</Title>
      <Subtitle>
        Unclaimed conversations are visible to all admins. Replying claims the
        thread for you.
      </Subtitle>

      <Layout>
        {/* ── Sidebar ── */}
        <Sidebar>
          {unclaimed.length > 0 && (
            <>
              <SectionHeader>
                🟡 Unclaimed ({unclaimed.length})
              </SectionHeader>
              {unclaimed.map(renderItem)}
            </>
          )}

          {mine.length > 0 && (
            <>
              <SectionHeader>My conversations ({mine.length})</SectionHeader>
              {mine.map(renderItem)}
            </>
          )}

          {conversations.length === 0 && (
            <p
              style={{
                color: "#bbb",
                fontSize: 13,
                textAlign: "center",
                padding: 20
              }}
            >
              No conversations yet.
            </p>
          )}
        </Sidebar>

        {/* ── Chat panel ── */}
        <ChatPanel>
          {!activeId ? (
            <EmptyChat>
              <span style={{ fontSize: 36 }}>📨</span>
              <span>Select a conversation to read and reply</span>
            </EmptyChat>
          ) : (
            <>
              <ChatHeader>
                <div>
                  <ChatSubject>{activeConv?.subject}</ChatSubject>
                  <ChatMeta>
                    User: {activeConv?.User?.name}
                    {activeConv?.assigned_admin_id ? (
                      <span>
                        {" "}
                        · Claimed by{" "}
                        {activeConv.assigned_admin_id === currentAdmin?.id
                          ? "you"
                          : `Admin #${activeConv.assigned_admin_id}`}
                      </span>
                    ) : (
                      <span> · Unclaimed — reply to claim</span>
                    )}
                    <StatusBadge status={activeConv?.status}>
                      {activeConv?.status}
                    </StatusBadge>
                  </ChatMeta>
                </div>

                <HeaderActions>
                  {activeConv?.status === "open" && isOwner && (
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
                  <p
                    style={{
                      color: "#ccc",
                      textAlign: "center",
                      marginTop: 40
                    }}
                  >
                    No messages yet.
                  </p>
                )}

                {messages.map((m) => {
                  const mine = m.sender_id === currentAdmin?.id;
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

              {activeConv?.status === "closed" && (
                <ClosedBanner>
                  Conversation closed. The user can reopen it by sending a
                  message.
                </ClosedBanner>
              )}

              {canReply && (
                <ComposerRow>
                  <TextArea
                    rows={2}
                    placeholder={
                      !activeConv?.assigned_admin_id
                        ? "Reply to claim this conversation…"
                        : "Type a reply… (Enter to send)"
                    }
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
              )}

              {/* Another admin already owns this — read-only */}
              {activeConv?.status === "open" &&
                activeConv?.assigned_admin_id &&
                activeConv.assigned_admin_id !== currentAdmin?.id && (
                  <ClosedBanner>
                    This conversation is handled by another admin. Read-only
                    view.
                  </ClosedBanner>
                )}
            </>
          )}
        </ChatPanel>
      </Layout>
    </PageContainer>
  );
};
