<template>
  <div class="home">
    <header class="home-header">
      <h1 class="home-title">Гөрөө Meeting</h1>
      <p class="home-date">{{ todayLabel }}</p>
    </header>

    <p v-if="loading" class="status">Loading updates…</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <div v-else class="updates-grid">
      <article
        v-for="item in gridItems"
        :key="item.user._id"
        class="update-card"
        :class="{ 'has-update': item.update, 'is-today': item.hasTodayUpdate }"
      >
        <div class="card-head">
          <div
            class="avatar"
            :class="{ 'has-photo': !!item.avatarSrc }"
            :style="item.avatarSrc ? undefined : { background: '#EAF3DE', color: '#27500A' }"
          >
            <img v-if="item.avatarSrc" :src="item.avatarSrc" :alt="item.user.name" class="avatar-img" />
            <span v-else>{{ initials(item.user.name) }}</span>
          </div>
          <div class="member-info">
            <h2 class="member-name">{{ item.user.name }}</h2>
            <p class="member-role">{{ item.user.role }}</p>
          </div>
        </div>

        <template v-if="item.update">
          <p class="update-time">{{ formatTime(item.update.createdAt) }}</p>

          <div class="update-section">
            <span class="section-label">Өчигдөр</span>
            <p class="section-text">{{ item.update.yesterday }}</p>
          </div>

          <div class="update-section">
            <span class="section-label">Өнөөдөр</span>
            <p class="section-text">{{ item.update.today }}</p>
          </div>

          <div v-if="item.update.issues" class="update-section">
            <span class="section-label">Асуудал</span>
            <p class="section-text issues">{{ item.update.issues }}</p>
          </div>
        </template>

        <p v-else class="no-update">No update yet</p>
      </article>
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
const updates = ref([])
const loading = ref(true)
const error = ref('')

function avatarFor(name) {
  return avatarMap[name?.toLowerCase()] ?? null
}

function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function isToday(iso) {
  if (!iso) return false
  const date = new Date(iso)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

const latestByUser = computed(() => {
  const map = new Map()
  for (const update of updates.value) {
    const key = update.name?.toLowerCase()
    if (!key) continue
    const existing = map.get(key)
    if (!existing || new Date(update.createdAt) > new Date(existing.createdAt)) {
      map.set(key, update)
    }
  }
  return map
})

const gridItems = computed(() =>
  users.value.map((user) => {
    const update = latestByUser.value.get(user.name.toLowerCase()) ?? null
    return {
      user,
      update,
      avatarSrc: avatarFor(user.name),
      hasTodayUpdate: update ? isToday(update.createdAt) : false,
    }
  }),
)

const todayLabel = computed(() =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const [usersRes, dailyRes] = await Promise.all([
      fetch(`${API_BASE}/users`),
      fetch(`${API_BASE}/daily?startDate=2026-01-01&endDate=2027-01-01`),
    ])
    if (!usersRes.ok) throw new Error(`Failed to fetch users (${usersRes.status})`)
    if (!dailyRes.ok) throw new Error(`Failed to fetch updates (${dailyRes.status})`)

    const usersData = await usersRes.json()
    const dailyData = await dailyRes.json()
    users.value = usersData.users ?? []
    updates.value = dailyData.daily ?? []
  } catch (err) {
    console.error('Error loading daily updates:', err)
    error.value = 'Could not load updates. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.home {
  width: 100%;
}

.home-header {
  margin-bottom: 20px;
}

.home-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
}

.home-date {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.status {
  font-size: 14px;
  color: #888;
  text-align: center;
  padding: 2rem 0;
}

.status.error {
  color: #a32d2d;
}

.updates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.update-card {
  background: #fff;
  border: 0.5px solid #e0ddd5;
  border-radius: 12px;
  padding: 16px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
}

.update-card.has-update {
  border-color: #c8e6c9;
}

.update-card.is-today {
  box-shadow: 0 0 0 1px #10a84a;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
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

.member-info {
  min-width: 0;
}

.member-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

.member-role {
  font-size: 12px;
  color: #888;
  margin: 2px 0 0;
}

.update-time {
  font-size: 11px;
  color: #aaa;
  margin: 0 0 10px;
}

.update-section {
  margin-bottom: 10px;
}

.update-section:last-child {
  margin-bottom: 0;
}

.section-label {
  display: block;
  font-size: 10px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 3px;
}

.section-text {
  font-size: 13px;
  color: #555;
  line-height: 1.45;
  margin: 0;
  word-break: break-word;
}

.section-text.issues {
  color: #a32d2d;
}

.no-update {
  font-size: 13px;
  color: #bbb;
  margin: auto 0 0;
  font-style: italic;
}
</style>
