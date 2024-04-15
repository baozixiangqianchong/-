<!-- 饼图 -->
<template>
  <el-card>
    <template #header> 学院预约</template>
    <el-select
      v-model="Screen"
      placeholder="筛选种类"
      :clearable="false"
      class="!w-[100px]"
    >
      <el-option label="近一周" value="0" />
      <el-option label="近半月" value="1" />
      <el-option label="近一个月" value="2" />
    </el-select>
    <div :id="id" :class="className" :style="{ height, width }"></div>
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { pieOrderApi } from "@/api/baozi/dashboard";
const Screen = ref<string>("0");

const props = defineProps({
  id: {
    type: String,
    default: "pieChart",
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
const options = ref({
  grid: {
    left: "2%",
    right: "2%",
    bottom: "10%",
    containLabel: true,
  },
  legend: {
    top: "bottom",
    textStyle: {
      color: "#999",
    },
  },
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b} : {c} ({d}%)",
  },
  series: [
    {
      name: "预约信息",
      type: "pie",
      radius: [10, 120],
      center: ["50%", "50%"],
      roseType: "area",
      itemStyle: {
        borderRadius: 1,
      },
      data: [],
    },
  ],
});
//选择框
watch(Screen, (newVal) => {
  flushData(newVal);
});

function flushData(newVal: any) {
  pieOrderApi(newVal).then(({ data }) => {
    options.value.series[0].data = data.map((item: any) => {
      return { value: item.reserve_person_count, name: item.college_name };
    });
    const chart = echarts.init(
      document.getElementById(props.id) as HTMLDivElement
    );
    chart.setOption(options.value);
    window.addEventListener("resize", () => {
      chart.resize();
    });
  });
}

onMounted(() => {
  flushData(Screen.value);
});
</script>

<style lang="scss" scoped>
li {
  display: flex;
  height: 40px;
}
</style>
