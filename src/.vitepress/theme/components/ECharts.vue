<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

import type { EChartsOption } from 'echarts'
import { useData } from 'vitepress'

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer
])

const props = defineProps({
  option: {
    type: Object as () => EChartsOption,
    required: true,
    default: () => ({})
  },
  theme: {
    type: String,
    default: 'auto'
  },
  initOptions: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['chart-ready', 'chart-updated'])

const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.EChartsType | null>(null)
const { isDark } = useData()

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  const theme = props.theme === 'auto' 
    ? isDark.value ? 'dark' : 'light' 
    : props.theme
  
  // 销毁现有实例
  chartInstance.value?.dispose()
  
  // 创建新实例
  chartInstance.value = echarts.init(
    chartRef.value, 
    theme, 
    props.initOptions
  )
  
  // 应用配置
  chartInstance.value.setOption(props.option)
  
  // 发射事件
  emit('chart-ready', chartInstance.value)
}

// 响应窗口大小变化
const resizeHandler = () => {
  chartInstance.value?.resize()
}

// 监听主题变化
watch(isDark, () => {
  // 重绘图表适配主题变化
  initChart()
})

// 监听参数变化
watch(() => props.option, (newOption) => {
  if (chartInstance.value && newOption) {
    chartInstance.value.setOption(newOption)
    emit('chart-updated', chartInstance.value)
  }
}, { deep: true })

onMounted(() => {
  // 客户端渲染才初始化
  if (typeof window !== 'undefined') {
    initChart()
    window.addEventListener('resize', resizeHandler)
  }
})

onUnmounted(() => {
  chartInstance.value?.dispose()
  window.removeEventListener('resize', resizeHandler)
})
</script>

<template>
  <div 
    ref="chartRef" 
    class="echarts-container"
    :style="{
      width: '100%',
      height: '400px',
      minHeight: '300px'
    }"
  />
</template>

<style>
.echarts-container {
  margin: 1.5rem 0;
}
</style>