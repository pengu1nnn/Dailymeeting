<template>
  <div class="chat-wrap">
    <div class="chat-card">
      <header class="chat-header">
        <div>
          <h2 class="chat-title">Өнөөдөр яах уу?</h2>
          <p class="chat-sub">Хувь хүний нууцыг чандлан хадгална.</p>
        </div>
        <span class="live-dot" :class="{ offline: !!error }" />
      </header>

      <div ref="listEl" class="messages">
        <p v-if="loading && !messages.length" class="status">Loading messages…</p>
        <p v-else-if="error && !messages.length" class="status error">{{ error }}</p>
        <p v-else-if="!messages.length" class="status">No messages yet. Say hi.</p>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="bubble-row"
          :class="{ mine: isMine(msg.sender) }"
        >
          <div class="bubble">
            <div class="bubble-meta">
              <span class="bubble-name">{{ msg.sender }}</span>
              <span class="bubble-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
            <p class="bubble-text">{{ msg.text }}</p>
          </div>
        </div>
      </div>

      <form class="composer" @submit.prevent="sendMessage">
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="composer-row">
          <input
            v-model="name"
            class="name-input"
            type="text"
            maxlength="40"
            placeholder="Name"
            autocomplete="nickname"
            @input="persistName"
          />
          <input
            v-model="text"
            class="text-input"
            type="text"
            maxlength="500"
            placeholder="Write a message…"
            autocomplete="off"
          />
          <button class="btn-send" type="submit" :disabled="isSending">
            {{ isSending ? '…' : 'Send' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const API_BASE = 'https://dm-be-pg53.onrender.com/api'
const NAME_KEY = 'chat-display-name'
const POLL_MS = 3000

const messages = ref([])
const name = ref(localStorage.getItem(NAME_KEY) || '')
const text = ref('')
const loading = ref(true)
const isSending = ref(false)
const error = ref('')
const formError = ref('')
const listEl = ref(null)

let pollId = null

function isMine(sender) {
  return name.value.trim().toLowerCase() === sender.trim().toLowerCase()
}

function formatTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function persistName() {
  localStorage.setItem(NAME_KEY, name.value.trim())
}

async function scrollToBottom() {
  await nextTick()
  if (listEl.value) {
    listEl.value.scrollTop = listEl.value.scrollHeight
  }
}

async function fetchMessages({ silent = false } = {}) {
  try {
    const response = await fetch(`${API_BASE}/chat/messages`)
    if (!response.ok) throw new Error(`Failed to fetch messages (${response.status})`)
    const data = await response.json()
    const next = data.messages ?? []
    const prevLen = messages.value.length
    const lastId = messages.value.at(-1)?.id
    messages.value = next
    error.value = ''
    if (!silent || next.length !== prevLen || next.at(-1)?.id !== lastId) {
      await scrollToBottom()
    }
  } catch (err) {
    console.error('Error fetching messages:', err)
    if (!silent) error.value = 'Could not load messages. Please try again.'
  } finally {
    loading.value = false
  }
}

async function sendMessage() {
  const sender = name.value.trim()
  const body = text.value.trim()
  formError.value = ''

  if (!sender) {
    formError.value = 'Enter a name to chat.'
    return
  }
  if (!body) {
    formError.value = 'Type a message first.'
    return
  }

  persistName()
  isSending.value = true
  try {
    const response = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, text: body }),
    })
    if (!response.ok) throw new Error(`Failed to send message (${response.status})`)
    text.value = ''
    await fetchMessages({ silent: false })
  } catch (err) {
    console.error('Error sending message:', err)
    formError.value = 'Could not send. Please try again.'
  } finally {
    isSending.value = false
  }
}

onMounted(() => {
  fetchMessages()
  pollId = setInterval(() => fetchMessages({ silent: true }), POLL_MS)
})

onUnmounted(() => {
  if (pollId) clearInterval(pollId)
})
</script>

<style scoped>
.chat-wrap {
  padding: 1rem 0;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.chat-card {
  background: var(--color-background-primary, #fff);
  border: 0.5px solid #e0ddd5;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 520px;
  max-height: min(72vh, 720px);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 14px;
  border-bottom: 0.5px solid #e0ddd5;
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.chat-sub {
  font-size: 12px;
  color: #888;
  margin: 2px 0 0;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0c8999;
  box-shadow: 0 0 0 4px rgba(12, 137, 153, 0.15);
  flex-shrink: 0;
}

.live-dot.offline {
  background: #c45c5c;
  box-shadow: 0 0 0 4px rgba(196, 92, 92, 0.15);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #faf9f6;
}

.status {
  font-size: 13px;
  color: #888;
  text-align: center;
  margin: auto;
}

.status.error {
  color: #a32d2d;
}

.bubble-row {
  display: flex;
  justify-content: flex-start;
}

.bubble-row.mine {
  justify-content: flex-end;
}

.bubble {
  max-width: 80%;
  background: #fff;
  border: 0.5px solid #e0ddd5;
  border-radius: 12px 12px 12px 4px;
  padding: 8px 12px;
}

.bubble-row.mine .bubble {
  background: #e7f6f8;
  border-color: #c5e4e8;
  border-radius: 12px 12px 4px 12px;
}

.bubble-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.bubble-name {
  font-size: 12px;
  font-weight: 600;
  color: #0c8999;
}

.bubble-row.mine .bubble-name {
  color: #0a6f7c;
}

.bubble-time {
  font-size: 11px;
  color: #aaa;
}

.bubble-text {
  font-size: 13px;
  line-height: 1.5;
  color: #333;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.composer {
  padding: 12px 14px 14px;
  border-top: 0.5px solid #e0ddd5;
  background: #fff;
}

.form-error {
  font-size: 12px;
  color: #a32d2d;
  margin: 0 0 8px;
}

.composer-row {
  display: flex;
  gap: 8px;
}

.name-input,
.text-input {
  border: 0.5px solid #d0cec6;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
  background: transparent;
  color: inherit;
}

.name-input:focus,
.text-input:focus {
  border-color: #378add;
}

.name-input {
  width: 92px;
  flex-shrink: 0;
}

.text-input {
  flex: 1;
  min-width: 0;
}

.btn-send {
  background: #0c8999;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled) {
  background: #0a7583;
}

.btn-send:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .composer-row {
    flex-wrap: wrap;
  }

  .name-input {
    width: 100%;
  }

  .text-input {
    flex: 1;
  }
}
</style>
