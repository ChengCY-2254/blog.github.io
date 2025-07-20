<template>
  <div class="hover-note" @click.stop ref="container">
    <span class="trigger" @click="toggleNote">{{ triggerText }}*</span>
    <div class="note" v-show="isNoteVisible">{{ note }}</div>
  </div>
</template>

<script>
export default {
  props: {
    triggerText: String,
    note: String
  },
  data() {
    return {
      isNoteVisible: false
    };
  },
  mounted() {
    // 添加全局点击事件监听器
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeDestroy() {
    // 组件销毁前移除事件监听
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    toggleNote() {
      this.isNoteVisible = !this.isNoteVisible;
    },
    handleOutsideClick(_event) {
      this.isNoteVisible = false;
    }
  }
};
</script>

<style scoped>
.hover-note {
  position: relative;
  display: inline-block;
}
.trigger {
  color: #1838a4;
  cursor: pointer;
}
.note {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vp-c-bg-soft);
  padding: 0.5rem;
  border-radius: 4px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px; /* 添加间距避免紧贴触发元素 */
}
</style>