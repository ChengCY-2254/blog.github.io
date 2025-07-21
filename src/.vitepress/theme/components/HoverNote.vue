<template>
  <div class="hover-note" @click.stop ref="container">
    <span class="trigger" @click="toggleNote">{{ triggerText }}*</span>
    <div class="note" v-show="isNoteVisible">{{ note }}</div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const { triggerText, note } = defineProps({
  triggerText: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  }
})

const isNoteVisible = ref(false)
const container = ref<HTMLElement | null>(null)


const toggleNote = (e: MouseEvent) => {
  e.stopPropagation()
  isNoteVisible.value = !isNoteVisible.value
}

const handleOutsideClick = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isNoteVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.hover-note {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.trigger {
  color: #1838a4;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.note {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  background: var(--vp-c-bg-soft);
  padding: 0.75rem;
  border-radius: 8px;
  min-width: 200px;
  max-width: 280px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
  z-index: 20;
  transition: opacity 0.2s, transform 0.2s;
  border: 1px solid var(--vp-c-divider);
}

/* 添加小箭头装饰 */
.note::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--vp-c-bg-soft);
}
</style>