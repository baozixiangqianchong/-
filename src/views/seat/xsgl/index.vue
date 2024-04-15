<!-- 学生管理 -->
<script setup lang="ts">
defineOptions({
  name: "User",
  inheritAttrs: false,
});

import { allStudentsApi, cancelStudentApi } from "@/api/baozi/xsgl/index";
import { UserQuery, UserPageVO } from "@/api/baozi/xsgl/types";

const queryFormRef = ref(ElForm); // 查询表单

const loading = ref(false); //  加载状态
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const queryParams = reactive<UserQuery>({
  page_no: 1,
  page_size: 10,
});

const dateTimeRange = ref(""); //获取时间
const total = ref(0); // 数据总数
const pageData = ref<UserPageVO[]>(); // 用户分页数据

watch(dateTimeRange, (newVal) => {
  if (newVal) {
    queryParams.violation_lock_time_start = timeStamp(newVal[0]);
    queryParams.violation_lock_time_end = timeStamp(newVal[1]);
  }
});

function timeStamp(inputDate: any) {
  // 创建一个日期对象
  const dateObject = new Date(inputDate + "T00:00:00Z");
  // 获取时间戳（毫秒）
  const timestampInMilliseconds = dateObject.getTime();
  // 将毫秒转换为秒
  const timestampInSeconds = Math.floor(timestampInMilliseconds / 1000);

  return Number(timestampInSeconds);
}

/** 查询 */
function handleQuery() {
  loading.value = true;
  if (queryParams.student_number) {
    queryParams.student_number = Number(queryParams.student_number);
  }
  allStudentsApi(queryParams)
    .then(({ data }) => {
      pageData.value = data.students;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  dateTimeRange.value = "";
  queryParams.violation_lock_time_end = undefined;
  queryParams.violation_lock_time_start = undefined;

  queryParams.page_no = 1;
  handleQuery();
}

/** 行选中 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.ID);
}

/** 取消用户锁定 */
function handleDelete(id?: number) {
  const userIds = [id || removeIds.value].join(",");
  ElMessageBox.confirm("确认取消用户锁定?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    const data = userIds.split(",").map(Number);
    cancelStudentApi(data).then(() => {
      ElMessage.success("取消成功");
      resetQuery();
    });
  });
}
// 转换时间格式
function formatDateTime(startDateTimeString: any, endDateTimeString: any) {
  if (!startDateTimeString || !endDateTimeString) {
    return "--/--";
  }

  const startDateObject = new Date(startDateTimeString);
  const endDateObject = new Date(endDateTimeString);

  const startYear = startDateObject.getFullYear();
  const startMonth = (startDateObject.getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const startDay = startDateObject.getDate().toString().padStart(2, "0");

  const endYear = endDateObject.getFullYear();
  const endMonth = (endDateObject.getMonth() + 1).toString().padStart(2, "0");
  const endDay = endDateObject.getDate().toString().padStart(2, "0");

  if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
    return `--/--`;
  } else {
    return `${startYear}-${startMonth}-${startDay} -- ${endYear}-${endMonth}-${endDay}`;
  }
}
onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :lg="24" :xs="24">
        <!-- 搜索部分 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item prop="college">
              <el-input
                v-model="queryParams.college"
                placeholder="学院"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item prop="major">
              <el-input
                v-model="queryParams.major"
                placeholder="专业"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item prop="grade">
              <el-input
                placeholder="年级"
                clearable
                v-model="queryParams.grade"
                @keyup.enter="handleQuery"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item prop="class">
              <el-input
                placeholder="班级"
                clearable
                v-model:model-value="queryParams.class"
                @keyup.enter="handleQuery"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item prop="name">
              <el-input
                placeholder="姓名"
                clearable
                v-model="queryParams.name"
                @keyup.enter="handleQuery"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item prop="student_number">
              <el-input
                placeholder="学号"
                clearable
                v-model="queryParams.student_number"
                @keyup.enter="handleQuery"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item prop="student_status">
              <el-select
                v-model="queryParams.student_status"
                clearable
                placeholder="状态"
                class="!w-[100px]"
              >
                <el-option label="正常" value="正常" />
                <el-option label="违规" value="违规" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-date-picker
                class="!w-[340px]"
                v-model="dateTimeRange"
                type="daterange"
                range-separator="~"
                start-placeholder="锁定开始时间"
                end-placeholder="锁定截止时间"
                value-format="YYYY-MM-DD"
                :clearable="false"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery"
                ><i-ep-search />搜索</el-button
              >
              <el-button @click="resetQuery">
                <i-ep-refresh />
                重置</el-button
              >
            </el-form-item>
          </el-form>
        </div>

        <!-- 展示数据 -->
        <el-card shadow="never" class="table-container">
          <!-- <template #header>
            <el-button
              type="danger"
              :disabled="removeIds.length === 0"
              @click="handleDelete()"
              >取消锁定</el-button
            >
          </template> -->
          <el-table
            v-loading="loading"
            :data="pageData"
            @selection-change="handleSelectionChange"
          >
            <!-- <el-table-column type="selection" width="50" align="center" /> -->

            <el-table-column
              key="id"
              label="头像"
              align="center"
              prop="head"
              width="80"
            >
              <template #default="scope">
                <el-avatar :src="scope.row.head" />
              </template>
            </el-table-column>
            <el-table-column
              key="college"
              label="学院"
              align="center"
              prop="college"
            />
            <el-table-column label="专业" align="center" prop="major" />
            <el-table-column
              label="学号"
              align="center"
              prop="student_number"
            />
            <el-table-column label="年级" align="center" prop="grade" />
            <el-table-column label="班级" align="center" prop="class" />
            <el-table-column label="姓名" align="center" prop="name" />
            <el-table-column label="状态" align="center" prop="student_status">
              <template #default="scope">
                <el-tag
                  :type="scope.row.student_status == 0 ? 'success' : 'info'"
                  >{{ scope.row.student_status == 0 ? "正常" : "违规" }}</el-tag
                >
              </template>
            </el-table-column>

            <el-table-column label="禁用时间" align="center" width="190">
              <template #default="scope">
                {{
                  formatDateTime(
                    scope.row.violation_lock_time_start,
                    scope.row.violation_lock_time_end
                  )
                }}
              </template>
            </el-table-column>

            <el-table-column label="操作" align="center" width="180">
              <template #default="scope">
                <el-button
                  v-hasPerm="['xsgl:xsgl:cancel']"
                  :disabled="scope.row.violation_lock_time_start == null"
                  type="primary"
                  link
                  size="small"
                  @click="handleDelete(scope.row.ID)"
                >
                  取消锁定
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.page_no"
            v-model:limit="queryParams.page_size"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
