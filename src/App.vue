<script setup>
  import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <div>
      <h1 class="home-title">Гөрөө Meeting</h1>
    </div>
    <nav class="navbar">
      <RouterLink class="nav-link" to="/">Home</RouterLink>
      <RouterLink class="nav-link" to="/update">Update</RouterLink>
      <RouterLink class="nav-link" to="/alcohol">Өнөөдөр яах уу?</RouterLink>
      <RouterLink class="nav-link" to="/faq">FAQ</RouterLink>
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
    background: #0c8999;
  }

  .page {
    width: 100%;
  }

  .home-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
}
</style>