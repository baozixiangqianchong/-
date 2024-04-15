<!-- 折线图 -->
<template>
  <el-card>
    <template #header> 预约数据 </template>
    <div class="case">
      <el-select
        v-model="Screen"
        placeholder="筛选种类"
        :clearable="false"
        class="!w-[100px]"
      >
        <el-option label="天数" value="0" />
        <el-option label="月份" value="1" />
      </el-select>
      <!-- @ts-ignore -->
      <div>
        <el-date-picker
          class="!w-[340px]"
          v-model="seekTime"
          :type="types[0]"
          unlink-panels
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="shortcuts"
          :value-format="format"
        />
      </div>
    </div>
    <div :id="id" :class="className" :style="{ height, width }"></div>
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from "echarts";

import { daySeekApi, monthSeekApi } from "@/api/baozi/dashboard";
const seekTime = ref("");
const Screen = ref<string>("0");
const types = ref<any>(["daterange"]);
const format = ref("YYYY-MM-DD");

const shortcuts = ref([
  {
    text: "近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "近一个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "近三个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
]);

//更改返回的时间格式
function formatDate(dateString: any) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

watch(Screen, (newVal) => {
  seekTime.value = "";
  if (newVal == "1") {
    types.value[0] = "monthrange";
    format.value = "YYYYMM";
    shortcuts.value = [
      {
        text: "本月",
        value: () => {
          const end = new Date();
          const start = new Date();
          return [start, end];
        },
      },
      {
        text: "本年",
        value: () => {
          const end = new Date();
          const start = new Date(new Date().getFullYear(), 0);
          return [start, end];
        },
      },
      {
        text: "过去6个月",
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setMonth(start.getMonth() - 6);
          return [start, end];
        },
      },
    ];
  } else {
    format.value = "YYYY-MM-DD";
    types.value[0] = "daterange";
    shortcuts.value = [
      {
        text: "近一周",
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          return [start, end];
        },
      },
      {
        text: "近一个月",
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          return [start, end];
        },
      },
      {
        text: "近三个月",
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
          return [start, end];
        },
      },
    ];
  }
});
//转时间戳
function time(time: any) {
  return Math.floor(new Date(time).getTime() / 1000);
}
//日期数据有变化
watch(seekTime, (newVal) => {
  if (newVal) {
    if (Screen.value == "0") {
      // 天数
      daySeekApi(time(newVal[0]), time(newVal[1])).then(({ data }) => {
        options.value.xAxis[0].data = data.map((item: any) =>
          formatDate(item.day_time)
        );
        options.value.series[0].data = data.map(
          (item: any) => item.day_reserve_counts
        );
        flushData();
      });
    } else if (Screen.value == "1") {
      //月份
      monthSeekApi(newVal[0], newVal[1]).then(({ data }) => {
        options.value.xAxis[0].data = data.map((item: any) => item.month_time);
        options.value.series[0].data = data.map(
          (item: any) => item.month_reserve_counts
        );
        flushData();
      });
    }
  }
});

const props = defineProps({
  id: {
    type: String,
    default: "radarChart",
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
  title: {
    text: "",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      label: {
        backgroundColor: "#6a7985",
      },
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
      boundaryGap: false,
      data: [],
    },
  ],
  yAxis: [
    {
      type: "value",
    },
  ],
  series: [
    {
      name: "预约人数",
      type: "line",
      stack: "Total",
      areaStyle: {},
      emphasis: {
        focus: "series",
      },
      data: [],
    },
  ],
});

//刷新数据图标
function flushData() {
  const chart = echarts.init(
    document.getElementById(props.id) as HTMLDivElement
  );
  chart.setOption(options.value);
  window.addEventListener("resize", () => {
    chart.resize();
  });
}

onMounted(() => {
  const start = new Date();
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
  //先请求最近一周的报名情况
  daySeekApi(time(formatDate(start)), time(formatDate(new Date()))).then(
    ({ data }) => {
      if (data) {
        options.value.xAxis[0].data = data.map((item: any) =>
          formatDate(item.day_time)
        );
        options.value.series[0].data = data.map(
          (item: any) => item.day_reserve_counts
        );
      }
      flushData();
    }
  );
});
</script>

<style lang="scss">
.case {
  display: flex;
  justify-content: space-between;
  width: 450px;
}
</style>
