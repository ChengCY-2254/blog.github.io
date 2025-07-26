<template>
  <div class="ow-color-generator">
    <!-- 功能区：文本和颜色输入 -->
    <div class="segments-container">
      <div v-for="(segment, index) in textSegments" :key="segment.id" class="segment-item">
        <input
          type="text"
          v-model="segment.text"
          placeholder="输入文本"
          class="text-input"
        />
        <div class="color-controls">
          <input
            type="color"
            v-model="segment.color"
            class="color-picker"
            title="选择自定义颜色"
          />
          <div class="preset-colors">
            <span
              v-for="preset in presetColors"
              :key="preset.name"
              class="preset-swatch"
              :style="{ backgroundColor: preset.color }"
              :title="preset.name"
              @click="segment.color = preset.color"
            ></span>
          </div>
        </div>
        <button @click="removeSegment(index)" class="remove-btn" title="删除此段">×</button>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button @click="addSegment" class="add-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>添加文本段</span>
      </button>
    </div>

    <!-- 效果预览 -->
    <div class="preview-section">
      <h3 class="section-title">效果预览</h3>
      <div class="preview-box">
        <span v-if="isTextEmpty" class="placeholder">实时预览将在此处显示</span>
        <span v-else v-for="(segment, index) in textSegments" :key="index" :style="{ color: segment.color }">
          {{ segment.text }}
        </span>
      </div>
    </div>

    <!-- 生成的代码 -->
    <div class="code-section">
      <h3 class="section-title">生成代码 (可用于游戏内)</h3>
      <div class="code-box">
        <code>{{ generatedCode }}</code>
        <button @click="copyToClipboard" class="copy-btn">{{ copyButtonText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 预设颜色
const presetColors = ref([
  { name: '红色', color: '#ff1493' },
  { name: '粉红', color: '#fc9acd' },
  { name: '紫色', color: '#a231b3' },
  { name: '蓝色', color: '#2313bb' },
  { name: '浅绿', color: '#53d7b6' },
  { name: '绿色', color: '#53d760' },
  { name: '黄色', color: '#f4e607' },
  { name: '橙色', color: '#f47c07' },
  { name: '棕黄', color: '#b0df22' },
]);

// 核心数据：存储所有文本段
const textSegments = ref([
  { id: Date.now(), text: '我是', color: '#f26700' },
  { id: Date.now() + 1, text: '火星', color: '#47C07FF' },
  { id: Date.now() + 2, text: '摩西', color: '#53d7b6' }
]);

// 计算属性，用于生成最终的游戏代码
const generatedCode = computed(() => {
  return textSegments.value
    .map(segment => {
      if (!segment.text) return '';
      // 移除 '#' 并转为大写, 拼接成 <FG{HEX}FF>text</FG> 格式
      const hex = segment.color.slice(1).toUpperCase();
      return `<FG${hex}FF>${segment.text}</FG>`;
    })
    .join('');
});

// 计算属性，判断预览区是否应该显示占位符
const isTextEmpty = computed(() => {
    return textSegments.value.every(s => !s.text.trim());
});

// 添加一个新的文本段
const addSegment = () => {
  textSegments.value.push({
    id: Date.now(),
    text: '',
    color: '#ffffff', // 默认为白色
  });
};

// 移除指定的文本段
const removeSegment = (index) => {
  textSegments.value.splice(index, 1);
};

// 复制功能
const copyButtonText = ref('复制');
const copyToClipboard = async () => {
  if (!generatedCode.value) return;
  try {
    await navigator.clipboard.writeText(generatedCode.value);
    copyButtonText.value = '已复制!';
    setTimeout(() => {
      copyButtonText.value = '复制';
    }, 2000);
  } catch (err) {
    console.error('复制失败:', err);
    copyButtonText.value = '失败';
  }
};

</script>

<style>
/* 根容器样式更新，实现沉浸式体验 */
.ow-color-generator {
  /* 移除背景、边框、内外边距和圆角，让组件扩展到父容器极限 */
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  border-radius: 0;
  /* 保留过渡和字体大小 */
  transition: background-color 0.5s, border-color 0.5s;
  font-size: 14px;
}

/* 保持内部各分区标题样式 */
.ow-color-generator .section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.segments-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.segment-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.text-input {
  flex-grow: 1;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-border);
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.25s, background-color 0.5s;
}
.text-input:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
}

.color-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background-color: transparent;
}
.color-picker::-webkit-color-swatch {
  border-radius: 50%;
  border: 2px solid var(--vp-c-border);
}
.color-picker::-moz-color-swatch {
  border-radius: 50%;
  border: 2px solid var(--vp-c-border);
}

.preset-colors {
  display: flex;
  gap: 5px;
}

.preset-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s ease;
}
.preset-swatch:hover {
  transform: scale(1.15);
}

.remove-btn, .add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--vp-c-border);
  cursor: pointer;
  transition: background-color 0.25s, border-color 0.25s;
}

.remove-btn {
  width: 32px;
  height: 32px;
  font-size: 20px;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
}
.remove-btn:hover {
    background-color: var(--vp-c-bg-mute);
    color: var(--vp-c-red-1);
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.add-btn {
  padding: 8px 16px;
  background-color: transparent;
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  font-weight: 500;
  gap: 6px;
}
.add-btn:hover {
  background-color: var(--vp-c-brand-soft);
}

/* 由于主容器的padding被移除，为保持与页面其他元素的间距，给功能分区增加上边距 */
.preview-section, .code-section {
  margin-top: 24px;
}

.preview-box, .code-box {
  background-color: var(--vp-c-bg);
  padding: 16px;
  border-radius: 8px;
  min-height: 50px;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid var(--vp-c-divider);
  word-break: break-all;
}
.code-box {
  position: relative;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
}
.preview-box .placeholder {
    color: var(--vp-c-text-3);
    font-weight: 400;
}

.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}
.copy-btn:hover {
  background-color: var(--vp-c-bg-mute);
}
</style>
