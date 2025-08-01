<script setup>
const props = defineProps({
    src: {
        type: String,
        required: true
    }
});
</script>

<template>
    <div class="iframe-container">
        <iframe :src="props.src" frameborder="0" width="100%" height="500px"></iframe>
    </div>
</template>

<style scoped>
.iframe-container {
    position: relative;
    width: 100%;
    height: 500px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    overflow: hidden;
}

.iframe-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
