<template>
  <div class="wrap">
    <div v-if="!submitted" class="card">
      <div class="card-top">
        <div
          class="avatar"
          :class="{ 'has-photo': !!avatarSrc }"
          :style="avatarSrc ? undefined : { background: avatarBg, color: avatarColor }"
        >
          <img v-if="avatarSrc" :src="avatarSrc" :alt="selectedName" class="avatar-img" />
          <span v-else>{{ initials }}</span>
        </div>

        <div class="member-fields">
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
          <select v-model="selectedName" class="name-select" @change="onMemberChange">
            <option disabled value="">Select</option>
            <option v-for="user in users" :key="user.name" :value="user.name">
              {{ user.name }}
            </option>
          </select>
          <div class="role-row" :class="{ visible: !!selectedName }">
            <span class="role-text">{{ selectedRole }}</span>
          </div>
        </div>
      </div>

      <div class="field">
        <p v-if="errors.yesterday" class="field-error">{{ errors.yesterday }}</p>
        <div class="field-label">Өчигдөр</div>
        <textarea v-model="form.yesterday" placeholder="Өчигдөр юу хийсэн бэ?" />
      </div>

      <div class="field">
        <p v-if="errors.today" class="field-error">{{ errors.today }}</p>
        <div class="field-label">Өнөөдөр</div>
        <textarea v-model="form.today" placeholder="Өнөөдөр юу хийх бэ?" />
      </div>

      <div class="field">
        <div class="field-label">Асуудал</div>
        <textarea
          v-model="form.issues"
          class="issues-input"
          placeholder="Асуудал байна уу?"
        />
      </div>

      <div class="divider" />

      <div class="actions">
        <button class="btn-submit" :disabled="isSubmitting" @click="handleSubmit">
          {{ isSubmitting ? 'Saving…' : 'Save update' }}
        </button>
      </div>
    </div>

    <div v-else class="success-card">
      <div class="success-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10l4 4 8-8"
            stroke="#27500A"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="success-title">Update saved for {{ selectedName }}</div>
      <div class="success-sub">{{ selectedRole }}</div>

      <div class="submitted-card">
        <div class="history-meta">
          <span class="history-time">Just now</span>
        </div>
        <div class="history-section">Yesterday</div>
        <div class="history-text">{{ form.yesterday }}</div>
        <div class="history-section">Today</div>
        <div class="history-text">{{ form.today }}</div>
        <template v-if="form.issues">
          <div class="history-section">Issues</div>
          <div class="history-text issues">{{ form.issues }}</div>
        </template>
      </div>

      <button class="btn-submit" @click="handleReset">Add another update</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import bulgaaImg from '@/assets/bulgaa.jpg'
import georgeImg from '@/assets/george.jpg'
import gerleeImg from '@/assets/gerlee.jpg'
import nyamaaImg from '@/assets/nyamaa.jpg'
import sudraaImg from '@/assets/sudraa.jpg'
import tsendeeImg from '@/assets/tsendee.jpg'
import turuuImg from '@/assets/turuu.jpg'

const API_BASE = 'https://dm-be-pg53.onrender.com/api'

const avatarMap = {
  turuu: turuuImg,
  tsendee: tsendeeImg,
  bulgaa: bulgaaImg,
  george: georgeImg,
  nyamaa: nyamaaImg,
  sudraa: sudraaImg,
  gerlee: gerleeImg,
}

const users = ref([])
const selectedName = ref('')
const selectedRole = ref('')
const errors = ref({})
const submitted = ref(false)
const isSubmitting = ref(false)

const form = ref({
  yesterday: '',
  today: '',
  issues: '',
})

const selectedMember = computed(() =>
  users.value.find((user) => user.name === selectedName.value),
)

const initials = computed(() => {
  if (!selectedName.value) return '?'
  return selectedName.value
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
})

const avatarSrc = computed(() => {
  if (!selectedName.value) return null
  return avatarMap[selectedName.value.toLowerCase()] ?? null
})

const avatarBg = '#EAF3DE'
const avatarColor = '#27500A'

async function fetchUsers() {
  try {
    const response = await fetch(`${API_BASE}/users`)
    if (!response.ok) throw new Error(`Failed to fetch users (${response.status})`)
    const data = await response.json()
    users.value = data.users ?? []
  } catch (error) {
    console.error('Error fetching users:', error)
    users.value = []
  }
}

async function postDailyUpdate() {
  const response = await fetch(`${API_BASE}/daily`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: selectedName.value,
      role: selectedRole.value,
      yesterday: form.value.yesterday,
      today: form.value.today,
      issues: form.value.issues,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to post daily update (${response.status})`)
  }

  return response.json()
}

function clearForm() {
  form.value = {
    yesterday: '',
    today: '',
    issues: '',
  }
  selectedName.value = ''
  selectedRole.value = ''
  errors.value = {}
}

function onMemberChange() {
  selectedRole.value = selectedMember.value?.role ?? ''
  const { name: _unused, ...rest } = errors.value
  errors.value = rest
}

async function handleSubmit() {
  const nextErrors = {}
  if (!selectedName.value) nextErrors.name = 'Please select a user.'
  if (!form.value.yesterday.trim()) nextErrors.yesterday = 'Yesterday field is required.'
  if (!form.value.today.trim()) nextErrors.today = 'Today field is required.'

  errors.value = nextErrors
  if (Object.keys(nextErrors).length) return

  isSubmitting.value = true
  try {
    await postDailyUpdate()
    submitted.value = true
  } catch (error) {
    console.error('Error posting daily update:', error)
    errors.value = { today: 'Failed to save update. Please try again.' }
  } finally {
    isSubmitting.value = false
  }
}

function handleReset() {
  submitted.value = false
  clearForm()
}

onMounted(fetchUsers)
</script>

<style scoped>
.wrap {
  padding: 1rem 0;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

.card,
.success-card {
  background: var(--color-background-primary, #fff);
  border: 0.5px solid #e0ddd5;
  border-radius: 12px;
  padding: 20px 22px;
}

.card-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 500;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar.has-photo {
  background: transparent;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.member-fields {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.name-select {
  font-family: inherit;
  color: inherit;
  background: transparent;
  border: 0.5px solid #d0cec6;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 10px;
  width: 100px;
  text-align: left;
}

.name-select:focus {
  border-color: #378add;
}

.role-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 18px;
  visibility: hidden;
}

.role-row.visible {
  visibility: visible;
}

.role-text {
  font-size: 12px;
  line-height: 18px;
  color: #888;
}

.field {
  margin-bottom: 16px;
}

.field-label {
  font-size: 11px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.field-error {
  font-size: 12px;
  color: #a32d2d;
  margin: 0 0 6px;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  min-height: 64px;
  font-size: 13px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 0.5px solid #d0cec6;
  font-family: inherit;
  color: inherit;
  background: transparent;
  outline: none;
}

textarea:focus {
  border-color: #378add;
}

.issues-input {
  min-height: 56px;
}

.divider {
  height: 0.5px;
  background: #e0ddd5;
  margin: 16px 0;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-submit {
  background: #10a84a;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
}

.btn-submit:hover:not(:disabled) {
  background: #0c7a38;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-card {
  text-align: center;
  padding: 28px 22px;
}

.success-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #eaf3de;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.success-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 6px;
}

.success-sub {
  font-size: 13px;
  color: #888;
  margin-bottom: 20px;
}

.submitted-card {
  text-align: left;
  border: 0.5px solid #e0ddd5;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 20px;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.history-time {
  font-size: 11px;
  color: #aaa;
}

.history-section {
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 8px 0 4px;
}

.history-text {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
}

.history-text.issues {
  color: #a32d2d;
}
</style>
