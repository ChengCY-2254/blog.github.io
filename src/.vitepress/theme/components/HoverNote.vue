<template>
  <span class="hover-note">
    <span class="trigger">{{ triggerText }}*</span>
    <span class="note">{{ note }}</span>
  </span>

</template>

<script>
export default {
  props: {
    triggerText: String,
    note: String
  }
}
</script>

<style scoped>
.hover-note {
  position: relative;
  display: inline-block;
}
.note {
  visibility: hidden;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vp-c-bg-soft);
  padding: 0.5rem;
  border-radius: 4px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.trigger:hover + .note {
  visibility: visible;
}
.trigger{
  color: #1838a4;
}
</style>