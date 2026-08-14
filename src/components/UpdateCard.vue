<template>
  <article
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

    <p class="update-time">{{ item.update ? formatTime(item.update.createdAt) : '' }}</p>

    <div class="update-section">
      <span class="section-label">Өчигдөр</span>
      <p v-if="item.update?.yesterday" class="section-text">{{ item.update.yesterday }}</p>
      <p v-else class="no-update">—</p>
    </div>

    <div class="update-section">
      <span class="section-label">Өнөөдөр</span>
      <p v-if="item.update?.today" class="section-text">{{ item.update.today }}</p>
      <p v-else class="no-update">—</p>
    </div>

    <div class="update-section">
      <span class="section-label">Асуудал</span>
      <p v-if="item.update?.issues" class="section-text issues">{{ item.update.issues }}</p>
      <p v-else class="no-update">{{ item.update ? 'Байхгүй' : '—' }}</p>
    </div>
  </article>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
})

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
</script>

<style scoped>
.update-card {
  background: #fff;
  border: 0.5px solid #e0ddd5;
  border-radius: 12px;
  padding: 16px;
  min-height: 220px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.update-card.has-update {
  border-color: #c8e6c9;
}

.update-card.is-today {
  box-shadow: 0 0 0 1px #0c8999;
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
  min-height: 16px;
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
  margin: 0;
  font-style: italic;
}
</style>
