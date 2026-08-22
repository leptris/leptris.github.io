<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
  label: string;
  html: string;
}

defineProps<{ tabs: Tab[] }>();

const active = ref(0);
</script>

<template>
  <div class="showcase">
    <div class="show-tabs" role="tablist">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.label"
        type="button"
        role="tab"
        :aria-selected="active === i"
        class="show-tab"
        :class="{ active: active === i }"
        @click="active = i"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="(tab, i) in tabs"
      v-show="active === i"
      :key="tab.label"
      class="show-panel"
      role="tabpanel"
    >
      <!-- eslint-disable-next-line vue/no-v-html — build-time Shiki output, no user input -->
      <div v-html="tab.html"></div>
    </div>
  </div>
</template>

<style scoped>
.showcase {
  border: 1px solid var(--color-line);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-paper);
}
.show-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-line);
  background: var(--color-paper-soft);
  overflow-x: auto;
}
.show-tab {
  padding: 0.85rem 1.3rem;
  background: transparent;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--color-ink-faint);
  transition: color 0.15s, border-color 0.15s;
}
.show-tab:hover {
  color: var(--color-ink);
}
.show-tab.active {
  color: var(--color-vermilion);
  border-bottom-color: var(--color-vermilion);
}
.show-panel :deep(pre.astro-code) {
  margin: 0;
  border-radius: 0;
}
</style>
