<script setup lang="ts">
import { TopRight, BottomLeft } from "@element-plus/icons-vue";

defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { useTransition, TransitionPresets } from "@vueuse/core";

import { allInformationApi } from "@/api/baozi/dashboard";
const duration = 5000;

// 日预约
const dayData = ref(0); //今天的
const dayDataLast = ref(0); //之前的
const dayDataOutput = useCustomTransition(dayData);
const dayDataLastOutput = useCustomTransition(dayDataLast);

// 周预约
const weekData = ref(0);
const weekDataLast = ref(0);
const weekDataOutput = useCustomTransition(weekData);
const weekDataLastOutput = useCustomTransition(dayDataLast);
// 月预约
const monthData = ref(0);
const monthDataLast = ref(0);
const monthDataOutput = useCustomTransition(monthData);
const monthDataLastOutput = useCustomTransition(monthDataLast);

// 年预约
const yearData = ref(0);
const yearDataLast = ref(0);
const yearDataOutput = useCustomTransition(yearData);
const yearDataLastOutput = useCustomTransition(yearDataLast);

//动态变化数字
function useCustomTransition(data: number) {
  return useTransition(data, {
    duration: duration,
    transition: TransitionPresets.easeOutExpo,
  });
}
onMounted(() => {
  allInformationApi().then(({ data }) => {
    dayData.value = data.day_reserve_count;
    dayDataLast.value = data.last_day_reserve_count;
    monthData.value = data.month_reserve_count;
    monthDataLast.value = data.last_month_reserve_count;
    weekData.value = data.week_reserve_count;
    weekDataLast.value = data.last_week_reserve_count;
    yearData.value = data.year_reserve_count;
    yearDataLast.value = data.last_year_reserve_count;
  });
});

function Percent(before: any, instantly: any) {
  //before: 之前, instantly: 现在
  const denominator = before === 0 ? 1 : before; //分母

  return (instantly - before) / denominator;
}
</script>

<template>
  <div class="dashboard-container">
    <!-- 数据卡片 -->
    <el-row :gutter="10" class="mt-3">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]">
                今日预约次数
              </span>
              <el-tag type="success">日</el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(dayDataOutput) }}
            </div>
            <div>
              <!-- <el-icon color="#409EFC"><TopRight /></el-icon> -->
              <!-- <el-icon color="#fc5531"><BottomLeft /></el-icon> -->
              <!-- 动态更改组件 -->
              <el-icon
                :color="
                  Percent(dayDataLastOutput, dayDataOutput) < 0
                    ? '#fc5531'
                    : '#5ece67'
                "
              >
                <component
                  :is="
                    Percent(dayDataLastOutput, dayDataOutput) < 0
                      ? BottomLeft
                      : TopRight
                  "
                />
              </el-icon>

              {{
                `${Math.round(
                  Math.abs(Percent(dayDataLastOutput, dayDataOutput) * 100)
                )}%`
              }}
            </div>
          </div>
        </el-card>
      </el-col>

      <!--周-->
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]"
                >本周预约次数</span
              >
              <el-tag type="warning">周</el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(weekDataOutput) }}
            </div>
            <div>
              <el-icon
                :color="
                  Percent(weekDataLastOutput, weekDataOutput) < 0
                    ? '#fc5531'
                    : '#5ece67'
                "
              >
                <component
                  :is="
                    Percent(weekDataLastOutput, weekDataOutput) < 0
                      ? BottomLeft
                      : TopRight
                  "
                />
              </el-icon>
              {{
                `${Math.round(
                  Math.abs(Percent(weekDataLastOutput, weekDataOutput) * 100)
                )}%`
              }}
            </div>
          </div>
        </el-card>
      </el-col>

      <!--销售额-->
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]"
                >本月预约次数</span
              >
              <el-tag>月</el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(monthDataOutput) }}
            </div>
            <div>
              <el-icon
                :color="
                  Percent(monthDataLastOutput, monthDataOutput) < 0
                    ? '#fc5531'
                    : '#5ece67'
                "
              >
                <component
                  :is="
                    Percent(monthDataLastOutput, monthDataOutput) < 0
                      ? BottomLeft
                      : TopRight
                  "
                />
              </el-icon>
              {{
                `${Math.round(
                  Math.abs(Percent(monthDataLastOutput, monthDataOutput) * 100)
                )}%`
              }}
            </div>
          </div>
        </el-card>
      </el-col>

      <!--订单量-->
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-[var(--el-text-color-secondary)]"
                >今年预约次数</span
              >
              <el-tag type="danger">年</el-tag>
            </div>
          </template>

          <div class="flex items-center justify-between mt-5">
            <div class="text-lg text-right">
              {{ Math.round(yearDataOutput) }}
            </div>
            <div>
              <el-icon
                :color="
                  Percent(yearDataLastOutput, yearDataOutput) < 0
                    ? '#fc5531'
                    : '#5ece67'
                "
              >
                <component
                  :is="
                    Percent(yearDataLastOutput, yearDataOutput) < 0
                      ? BottomLeft
                      : TopRight
                  "
                />
              </el-icon>
              {{
                `${Math.round(
                  Math.abs(Percent(yearDataLastOutput, yearDataOutput) * 100)
                )}%`
              }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Echarts 图表 -->
    <el-row :gutter="10" class="mt-3">
      <el-col :xs="24" :sm="12" :lg="24" class="mb-2">
        <RadarChart
          id="radarChart"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :lg="12" class="mb-2">
        <PieChart
          id="pieChart"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>
      <el-col :sm="24" :lg="12" class="mb-2">
        <BarChart
          id="barChart"
          height="400px"
          width="100%"
          class="bg-[var(--el-bg-color-overlay)]"
        />
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .data-box {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    font-weight: bold;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    box-shadow: var(--el-box-shadow-dark);
  }

  .svg-icon {
    fill: currentcolor !important;
  }
}
</style>
