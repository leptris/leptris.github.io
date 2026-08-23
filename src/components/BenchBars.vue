<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

export interface BarRow {
  who: string;
  ver?: string;
  val: string;
  w: number;
  them?: boolean;
}

export interface BarBlock {
  title: string;
  sub?: string;
  rows: BarRow[];
}

const props = defineProps<{ blocks: BarBlock[] }>();

const root = ref<HTMLElement | null>(null);
const shown = ref(false);
let io: IntersectionObserver | null = null;

onMounted(() => {
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          shown.value = true;
          io?.disconnect();
        }
      }
    },
    { threshold: 0.3 },
  );
  if (root.value) io.observe(root.value);
});

onBeforeUnmount(() => io?.disconnect());
</script>

<template>
  <div ref="root" class="bench-vue">
    <div v-for="block in props.blocks" :key="block.title" class="bench-block">
      <h3>{{ block.title }}</h3>
      <p v-if="block.sub" class="sub">{{ block.sub }}</p>
      <div
        v-for="(row, i) in block.rows"
        :key="row.who + i"
        class="bar-row"
        :class="{ them: row.them }"
      >
        <span class="who">
          {{ row.who }}
          <small v-if="row.ver" class="ver">{{ row.ver }}</small>
        </span>
        <span class="bar-track">
          <span
            class="bar-fill"
            :style="{ width: shown ? row.w + '%' : '0%' }"
          ></span>
        </span>
        <span class="val" :class="{ hl: !row.them }">
          <b v-if="!row.them">{{ row.val }}</b>
          <template v-else>{{ row.val }}</template>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bench-vue :deep(.bench-block) {
  margin-bottom: 2.8rem;
}
.bench-vue :deep(.bench-block:last-of-type) {
  margin-bottom: 0;
}
.bench-vue :deep(.bench-block h3) {
  font-family: var(--font-display);
  font-weight: 640;
  font-size: 1.12rem;
  margin-bottom: 0.25rem;
}
.bench-vue :deep(.bench-block .sub) {
  color: var(--color-ink-faint);
  font-size: 0.8rem;
  margin-bottom: 1.3rem;
}
.bench-vue :deep(.bar-row) {
  display: grid;
  grid-template-columns: 11rem 1fr 6.2rem;
  gap: 1.1rem;
  align-items: center;
  margin-bottom: 0.7rem;
}
.bench-vue :deep(.bar-row .who) {
  font-size: 0.84rem;
  color: var(--color-ink-muted);
  text-align: right;
}
.bench-vue :deep(.bar-row .who .ver) {
  display: block;
  font-family: var(--font-mono);
  color: var(--color-ink-faint);
  font-size: 0.66rem;
}
.bench-vue :deep(.bar-track) {
  height: 1.5rem;
  background: var(--color-paper-mute);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  display: block;
}
.bench-vue :deep(.bar-fill) {
  display: block;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, var(--color-rose-deep), var(--color-rose));
  border-radius: 4px 0 0 4px;
  transition: width 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}
.bench-vue :deep(.bar-row.them .bar-fill) {
  background: color-mix(in srgb, var(--color-line) 60%, var(--color-ink-faint));
}
.bench-vue :deep(.bar-row .val) {
  font-family: var(--font-mono);
  font-size: 0.83rem;
  color: var(--color-ink-muted);
  white-space: nowrap;
}
.bench-vue :deep(.bar-row .val b) {
  color: var(--color-rose-deep);
  font-weight: 600;
}
@media (max-width: 720px) {
  .bench-vue :deep(.bar-row) {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }
  .bench-vue :deep(.bar-row .who) {
    text-align: left;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bench-vue :deep(.bar-fill) {
    transition: none;
  }
}
</style>
