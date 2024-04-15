<!--柱图 -->
<template>
  <el-card>
    <template #header>
      <div class="title">教室对比</div>
    </template>
    <el-select
      style="visibility: hidden"
      placeholder="筛选种类"
      :clearable="false"
      class="!w-[100px]"
    >
      <el-option label="天数" value="0" />
      <el-option label="月份" value="1" />
    </el-select>
    <div :id="id" :class="className" :style="{ height, width }"></div>
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { barOrderApi } from "@/api/baozi/dashboard";
const props = defineProps({
  id: {
    type: String,
    default: "barChart",
  },
  className: {
    type: String,
    default: "",
  },
  width: {
    type: String,
    default: "200px",
    required: true,
  },
  height: {
    type: String,
    default: "200px",
    required: true,
  },
});

const options = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      data: [],
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        interval: 0, // 设置为 0 表示所有标签都显示
      },
    },
  ],
  yAxis: [
    {
      type: "value",
    },
  ],
  series: [
    {
      name: "预约数",
      type: "bar",
      barWidth: "60%",
      data: [],
    },
  ],
};
const chart = ref<any>("");
onMounted(() => {
  // 大小自适应
  window.addEventListener("resize", () => {
    chart.value.resize();
  });

  barOrderApi().then(({ data }) => {
    //得到数据进行替换
    options.xAxis[0].data = data.map(
      (item: any) => `${item.build_name}${item.location}`
    );
    options.series[0].data = data.map((item: any) => item.reserve_count);

    chart.value = markRaw(
      echarts.init(document.getElementById(props.id) as HTMLDivElement)
    );
    // 图表初始化
    chart.value.setOption(options);
  });
});
</script>
<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: space-between;

  .download {
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
