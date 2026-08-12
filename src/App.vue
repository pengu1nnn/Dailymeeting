<script setup>
  import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <nav class="navbar">
      <RouterLink class="nav-link" to="/">Home</RouterLink>
      <RouterLink class="nav-link" to="/update">Update</RouterLink>
    </nav>

    <main class="page">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
  .app-shell {
    width: 100%;
  }

  .navbar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 4px 16px;
    border-bottom: 0.5px solid #e0ddd5;
    margin-bottom: 8px;
  }

  .nav-link {
    font-size: 13px;
    font-weight: 500;
    color: #888;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
  }

  .nav-link:hover {
    color: #333;
    background: #f3f1eb;
  }

  .nav-link.router-link-active {
    color: #fff;
    background: #10a84a;
  }

  .page {
    width: 100%;
  }
</style>