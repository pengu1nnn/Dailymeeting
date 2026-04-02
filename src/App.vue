<template>
  <div class="wrap">
    <div v-if="!submitted" class="card">
      <div class="card-top">
        <div class="avatar" :style="{ background: avatarBg, color: avatarColor }">
          {{ initials }}
        </div>
        <div>
          <div class="name">{{ member.name }}</div>
          <div class="role">{{ member.role }} · Sprint 14</div>
        </div>
        <span class="badge" :style="badgeStyle">{{ statusLabels[form.status] }}</span>
      </div>

      <div class="field">
        <div class="field-label">Status</div>
        <div class="status-row">
          <button v-for="s in statuses" :key="s.value" class="status-btn" :class="{ selected: form.status === s.value }"
            :style="form.status === s.value ? s.style : {}" @click="form.status = s.value">
            {{ s.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <div class="field-label">Yesterday</div>
        <textarea v-model="form.yesterday" placeholder="What did you complete yesterday?" />
      </div>

      <div class="field">
        <div class="field-label">Today</div>
        <textarea v-model="form.today" placeholder="What are you working on today?" />
      </div>

      <div class="field">
        <div class="field-label">Blockers</div>
        <textarea v-model="form.blockers" style="min-height: 56px" placeholder="Any blockers? Leave empty if none." />
      </div>

      <div v-if="errors.length" class="error-list">
        <p v-for="e in errors" :key="e">{{ e }}</p>
      </div>

      <div class="divider" />

      <div class="actions">
        <button class="btn-cancel" @click="$emit('cancel')">Cancel</button>
        <button class="btn-submit" @click="handleSubmit">Save update</button>
      </div>
    </div>

    <div v-else class="success-card">
      <div class="success-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10l4 4 8-8" stroke="#27500A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="success-title">Update saved for {{ member.name }}</div>
      <div class="success-sub">Status set to {{ statusLabels[form.status] }}</div>

      <div class="submitted-card">
        <div class="history-meta">
          <span class="history-time">Just now</span>
          <span class="h-badge" :style="badgeStyle">{{ statusLabels[form.status] }}</span>
        </div>
        <div class="history-section">Yesterday</div>
        <div class="history-text">{{ form.yesterday }}</div>
        <div class="history-section">Today</div>
        <div class="history-text">{{ form.today }}</div>
        <template v-if="form.blockers">
          <div class="history-section">Blockers</div>
          <div class="history-text blocker">{{ form.blockers }}</div>
        </template>
      </div>

      <button class="btn-submit" @click="handleReset">Add another update</button>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'

  const props = defineProps({
    member: {
      type: Object,
      default: () => ({
        name: 'Turuu',
        role: 'Back-end',
        avatarBg: '#EAF3DE',
        avatarColor: '#27500A',
        yesterday: 'Ran regression tests on auth module. Found 2 edge case failures.',
        today: 'Log bug reports for auth failures. Begin testing the new report download flow.',
        blockers: '',
        status: 'progress',
      }),
    },
  })

  const emit = defineEmits(['submit', 'cancel'])

  const form = ref({
    yesterday: props.member.yesterday,
    today: props.member.today,
    blockers: props.member.blockers,
    status: props.member.status,
  })

  const errors = ref([])
  const submitted = ref(false)

  const statuses = [
    {
      value: 'progress',
      label: 'In progress',
      style: { background: '#FAEEDA', color: '#633806', borderColor: '#EF9F27' },
    },
    {
      value: 'done',
      label: 'Done',
      style: { background: '#EAF3DE', color: '#27500A', borderColor: '#97C459' },
    },
    {
      value: 'issue',
      label: 'Issue',
      style: { background: '#FCEBEB', color: '#791F1F', borderColor: '#F09595' },
    },
  ]

  const statusLabels = {
    progress: 'in progress',
    done: 'done',
    issue: 'Issue',
  }

  const badgeColors = {
    progress: { background: '#FAEEDA', color: '#633806' },
    done: { background: '#EAF3DE', color: '#27500A' },
    issue: { background: '#FCEBEB', color: '#791F1F' },
  }

  const badgeStyle = computed(() => badgeColors[form.value.status])

  const initials = computed(() =>
    props.member.name
      .split(' ')
      .map((w) => w[0])
      .join('')
  )

  const avatarBg = computed(() => props.member.avatarBg ?? '#EAF3DE')
  const avatarColor = computed(() => props.member.avatarColor ?? '#27500A')

  function handleSubmit() {
    errors.value = []
    if (!form.value.yesterday.trim()) errors.value.push('Yesterday field is required.')
    if (!form.value.today.trim()) errors.value.push('Today field is required.')
    if (errors.value.length) return

    emit('submit', { ...form.value })
    submitted.value = true
  }

  function handleReset() {
    submitted.value = false
    errors.value = []
  }
</script>

<style scoped>
  .wrap {
    padding: 1rem 0;
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
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    flex-shrink: 0;
  }

  .name {
    font-size: 15px;
    font-weight: 500;
  }

  .role {
    font-size: 12px;
    color: #888;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 20px;
    margin-left: auto;
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

  textarea {
    width: 100%;
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
    border-color: #378ADD;
  }

  .status-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .status-btn {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 0.5px solid #d0cec6;
    background: transparent;
    color: #888;
    transition: all 0.15s;
    font-family: inherit;
  }

  .error-list {
    margin-bottom: 12px;
  }

  .error-list p {
    font-size: 13px;
    color: #A32D2D;
    margin-bottom: 4px;
  }

  .divider {
    height: 0.5px;
    background: #e0ddd5;
    margin: 16px 0;
  }

  .actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn-cancel {
    background: transparent;
    border: 0.5px solid #d0cec6;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 13px;
    color: #888;
    cursor: pointer;
    font-family: inherit;
  }

  .btn-submit {
    background: #185FA5;
    border: none;
    border-radius: 8px;
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    cursor: pointer;
    font-family: inherit;
  }

  .btn-submit:hover {
    background: #0C447C;
  }

  .success-card {
    text-align: center;
    padding: 28px 22px;
  }

  .success-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #EAF3DE;
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

  .h-badge {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 20px;
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

  .history-text.blocker {
    color: #A32D2D;
  }
</style>