<template>
  <div class="home">
    <section class="history">
      <div class="filter-bar">
        <div class="filter-dates">
          <div class="filter-field">
            <label>From</label>
            <input v-model="fromDate" type="date" @change="onDateInput">
          </div>
          <div class="filter-divider">→</div>
          <div class="filter-field">
            <label>To</label>
            <input v-model="toDate" type="date" @change="onDateInput">
          </div>
        </div>

        <div class="filter-actions">
          <button
            v-for="range in quickRanges"
            :key="range.id"
            type="button"
            class="quick-range"
            :class="{ active: activeQuick === range.id }"
            @click="setQuickRange(range.id)"
          >
            {{ range.label }}
          </button>
          <button type="button" class="apply" @click="applyRange">Apply</button>
        </div>
      </div>

      <p v-if="loading" class="status">Loading updates…</p>
      <p v-else-if="error" class="status error">{{ error }}</p>

      <template v-else>
        <div class="calendars">
          <div
            v-for="cal in visibleMonths"
            :key="`${cal.year}-${cal.month}`"
            class="calendar"
          >
            <h3 class="calendar-month">{{ cal.label }}</h3>
            <div class="cal-weekdays">
              <span v-for="day in weekdays" :key="day">{{ day }}</span>
            </div>
            <div class="cal-grid">
              <button
                v-for="cell in cal.days"
                :key="cell.key"
                type="button"
                class="cal-day"
                :class="{
                  'out-month': !cell.inMonth,
                  'out-range': !isInRange(cell.key),
                  'has-updates': cell.posters.length,
                  'is-today': cell.key === todayKey,
                  'is-selected': cell.key === selectedDate,
                }"
                :disabled="!isInRange(cell.key)"
                @click="selectDay(cell.key)"
              >
                <span class="cal-day-num">{{ cell.day }}</span>
                <span v-if="cell.posters.length" class="cal-avatars">
                  <span
                    v-for="person in cell.posters.slice(0, 4)"
                    :key="person.name"
                    class="cal-ava"
                    :class="{ 'has-photo': !!person.avatarSrc }"
                    :title="person.name"
                  >
                    <img
                      v-if="person.avatarSrc"
                      :src="person.avatarSrc"
                      :alt="person.name"
                    >
                    <span v-else>{{ person.initials }}</span>
                  </span>
                  <span v-if="cell.posters.length > 4" class="cal-more">
                    +{{ cell.posters.length - 4 }}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="selectedDate" class="selected-day">
          <h3 class="selected-day-title">{{ selectedDayLabel }}</h3>
          <div class="updates-grid">
            <UpdateCard
              v-for="item in selectedDayItems"
              :key="item.user._id || item.user.name"
              :item="item"
            />
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import UpdateCard from '@/components/UpdateCard.vue'
import bulgaaImg from '@/assets/bulgaa.jpg'
import georgeImg from '@/assets/george.jpg'
import gerleeImg from '@/assets/gerlee.jpg'
import nyamaaImg from '@/assets/nyamaa.jpg'
import sudraaImg from '@/assets/sudraa.jpg'
import tsendeeImg from '@/assets/tsendee.jpg'
import turuuImg from '@/assets/turuu.jpg'

const API_BASE = 'https://dm-be-pg53.onrender.com/api'
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const quickRanges = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
]

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
const fromDate = ref('')
const toDate = ref('')
const selectedDate = ref('')
const activeQuick = ref('month')

function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function startOfWeek(date) {
  const next = new Date(date)
  const day = next.getDay()
  const offset = day === 0 ? 6 : day - 1
  next.setDate(next.getDate() - offset)
  next.setHours(0, 0, 0, 0)
  return next
}

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

function isInRange(dateKey) {
  return dateKey >= fromDate.value && dateKey <= toDate.value
}

function buildMonthDays(year, month) {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1
  const cursor = addDays(first, -startOffset)
  return Array.from({ length: 42 }, (_, i) => {
    const current = addDays(cursor, i)
    return {
      key: toDateKey(current),
      day: current.getDate(),
      inMonth: current.getMonth() === month,
    }
  })
}

function pickSelectedDate() {
  const today = toDateKey(new Date())
  if (isInRange(today)) {
    selectedDate.value = today
    return
  }

  const keys = [...updatesByDate.value.keys()]
    .filter((key) => isInRange(key))
    .sort()

  selectedDate.value = keys[keys.length - 1] ?? toDate.value
}

function setRange(from, to, quick = null) {
  fromDate.value = from
  toDate.value = to
  activeQuick.value = quick
}

function setQuickRange(range) {
  const now = new Date()
  const today = toDateKey(now)

  if (range === 'today') {
    setRange(today, today, 'today')
  } else if (range === 'week') {
    const start = startOfWeek(now)
    setRange(toDateKey(start), toDateKey(addDays(start, 6)), 'week')
  } else {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setRange(toDateKey(monthStart), toDateKey(monthEnd), 'month')
  }

  fetchData()
}

function onDateInput() {
  activeQuick.value = null
}

function applyRange() {
  if (!fromDate.value || !toDate.value) return
  if (fromDate.value > toDate.value) {
    const previousFrom = fromDate.value
    fromDate.value = toDate.value
    toDate.value = previousFrom
  }
  fetchData()
}

function selectDay(dateKey) {
  if (!isInRange(dateKey)) return
  selectedDate.value = dateKey
}

const todayKey = computed(() => toDateKey(new Date()))

const updatesByDate = computed(() => {
  const byDate = new Map()
  for (const update of updates.value) {
    const nameKey = update.name?.toLowerCase()
    if (!nameKey) continue
    const dateKey = toDateKey(new Date(update.createdAt))
    if (!byDate.has(dateKey)) byDate.set(dateKey, new Map())
    const dayMap = byDate.get(dateKey)
    const existing = dayMap.get(nameKey)
    if (!existing || new Date(update.createdAt) > new Date(existing.createdAt)) {
      dayMap.set(nameKey, update)
    }
  }
  return byDate
})

const visibleMonths = computed(() => {
  if (!fromDate.value || !toDate.value) return []
  const start = parseDateKey(fromDate.value)
  const end = parseDateKey(toDate.value)
  const months = []
  let year = start.getFullYear()
  let month = start.getMonth()

  while (year < end.getFullYear() || (year === end.getFullYear() && month <= end.getMonth())) {
    months.push({
      year,
      month,
      label: new Date(year, month, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
      days: buildMonthDays(year, month).map((cell) => {
        const dayMap = updatesByDate.value.get(cell.key)
        const posters = dayMap
          ? [...dayMap.values()].map((update) => ({
              name: update.name,
              avatarSrc: avatarFor(update.name),
              initials: initials(update.name),
            }))
          : []
        return { ...cell, posters }
      }),
    })
    month += 1
    if (month > 11) {
      month = 0
      year += 1
    }
  }

  return months
})

const selectedDayLabel = computed(() => {
  if (!selectedDate.value) return ''
  return parseDateKey(selectedDate.value).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const selectedDayItems = computed(() => {
  if (!selectedDate.value) return []
  const dayMap = updatesByDate.value.get(selectedDate.value)

  return users.value.map((user) => {
    const update = dayMap?.get(user.name?.toLowerCase()) ?? null
    return {
      user,
      update,
      avatarSrc: avatarFor(user.name),
      hasTodayUpdate: selectedDate.value === todayKey.value && !!update,
    }
  })
})

async function fetchData() {
  if (!fromDate.value || !toDate.value) return
  loading.value = true
  error.value = ''
  try {
    const query = `startDate=${fromDate.value}&endDate=${toDate.value}`
    const [usersRes, dailyRes] = await Promise.all([
      fetch(`${API_BASE}/users`),
      fetch(`${API_BASE}/daily?${query}`),
    ])
    if (!usersRes.ok) throw new Error(`Failed to fetch users (${usersRes.status})`)
    if (!dailyRes.ok) throw new Error(`Failed to fetch updates (${dailyRes.status})`)

    const usersData = await usersRes.json()
    const dailyData = await dailyRes.json()
    users.value = usersData.users ?? []
    updates.value = dailyData.daily ?? []
    pickSelectedDate()
  } catch (err) {
    console.error('Error loading daily updates:', err)
    error.value = 'Could not load updates. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => setQuickRange('month'))
</script>

<style scoped>
.home {
  width: 100%;
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
  align-items: stretch;
}

.filter-bar {
  --ink: #333;
  --ink-soft: #888;
  --line: #e0ddd5;
  --accent: #0c8999;
  --radius: 8px;

  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  background: #ffffff;
  border: 1px solid #e0ddd5;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.filter-dates {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-shrink: 0;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-field label {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.filter-field input[type="date"] {
  font-size: 13px;
  color: var(--ink);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--line);
  padding: 4px 2px 8px;
  min-width: 140px;
}

.filter-field input[type="date"]:focus {
  outline: none;
  border-bottom-color: var(--accent);
}

.filter-divider {
  color: var(--ink-soft);
  font-size: 13px;
  padding-bottom: 10px;
  flex-shrink: 0;
}

.filter-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, auto));
  gap: 10px;
  align-items: end;
  flex: 1;
  min-width: min(100%, 320px);
  justify-content: end;
}

.quick-range {
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--ink-soft);
  padding: 8px 12px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-range:hover,
.quick-range.active {
  border-color: var(--accent);
  color: var(--accent);
}

button.apply {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #0c8999;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s ease;
}

button.apply:hover {
  background: #0a7380;
}

.history {
  margin-top: 20px;
}

.calendars {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}

.calendar {
  background: #fff;
  border: 1px solid #e0ddd5;
  border-radius: 12px;
  padding: 16px 18px 18px;
}

.calendar-month {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 6px;
}

.cal-weekdays span {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #999;
  text-align: center;
  padding: 4px 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.cal-day {
  min-height: 78px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #fafaf8;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.cal-day:hover:not(:disabled) {
  border-color: #d8d5cc;
  background: #fff;
}

.cal-day.out-month {
  opacity: 0.38;
}

.cal-day.out-range,
.cal-day:disabled {
  opacity: 0.28;
  cursor: default;
  background: transparent;
}

.cal-day.has-updates {
  background: #f3fafb;
  border-color: #d4eef1;
}

.cal-day.is-today .cal-day-num {
  color: #0c8999;
  font-weight: 600;
}

.cal-day.is-selected {
  border-color: #0c8999;
  background: #fff;
  box-shadow: 0 0 0 1px #0c8999;
}

.cal-day-num {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
}

.cal-avatars {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px;
}

.cal-ava {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eaf3de;
  color: #27500a;
  font-size: 8px;
  font-weight: 600;
  flex-shrink: 0;
}

.cal-ava.has-photo {
  background: transparent;
}

.cal-ava img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cal-more {
  font-size: 10px;
  color: #888;
  padding-left: 2px;
}

.selected-day-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 14px;
}

@media (max-width: 720px) {
  .cal-day {
    min-height: 64px;
    padding: 6px;
  }

  .cal-ava {
    width: 14px;
    height: 14px;
  }
}
</style>
