<!-- 预约管理 -->
<script setup lang="ts">
//接口
import { selKeywords, canSub, dataList } from "./js";

import { MenuQuery, MenuForm, MenuVO } from "@/api/menu/types";

defineOptions({
  name: "Menu",
  inheritAttrs: false,
});

import { MenuTypeEnum } from "@/enums/MenuTypeEnum";

//分页
const currentPage4 = ref(1);
const pageSize4 = ref(100);
const small = ref(false);
const background = ref(true);
const disabled = ref(false);

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
  handleQuery();
};
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`);
  handleQuery();
};

const queryFormRef = ref(ElForm); //重置查询用到
const menuFormRef = ref(ElForm); //重置表单用到

const loading = ref(false); //重置父组件
const dialog = reactive<DialogOption>({
  //打开或者关闭弹窗使用
  visible: false,
});

let queryParams = reactive<MenuQuery>({}); //重置父组件用到

const formData = reactive<MenuForm>({
  //多处用到
  parentId: 0,
  visible: 1,
  sort: 1,
  type: MenuTypeEnum.MENU,
  alwaysShow: 0,
  keepAlive: 0,
});

// 选择表格的行菜单ID
const selectedRowMenuId = ref<number | undefined>(); //行点击事件用到

/**
 * 获取并渲染数据
 */
let m = ref([]);

function handleQuery() {
  if (
    queryParams.keywords1 ||
    queryParams.keywords2 ||
    queryParams.keywords3 ||
    queryParams.keywords4 ||
    queryParams.keywords5 ||
    queryParams.keywords6 ||
    queryParams.keywords7
  ) {
    //开始时间戳//以毫秒为单位，除以1000之后以秒为单位
    let timeStart =
      new Date(`${queryParams.keywords7?.[0]}`).getTime() / 1000 || undefined;
    //结束时间戳
    let timeEnd =
      new Date(`${queryParams.keywords7?.[1]}`).getTime() / 1000 || undefined;

    console.log(
      "数据",
      currentPage4.value,
      pageSize4,
      queryParams.keywords1,
      queryParams.keywords2,
      queryParams.keywords3,
      queryParams.keywords4,
      queryParams.keywords5,
      queryParams.keywords6,
      timeStart,
      timeEnd
    );
    selKeywords(
      currentPage4.value,
      pageSize4.value,
      queryParams.keywords1,
      queryParams.keywords2,
      queryParams.keywords3,
      queryParams.keywords4,
      queryParams.keywords5,
      queryParams.keywords6,
      timeStart,
      timeEnd
    )
      .then(({ data }) => {
        console.log("请求成功a", data);
        m.value = data.reservation;
        console.log("m1", m);
        console.log("m1", m.value.length);
      })
      .catch((err) => {
        console.log("请求出错", err);
      });
    return;
  }
  // 获取所有数据并渲染
  dataList(currentPage4.value, pageSize4.value).then(({ data }) => {
    console.log("成功", data);
    m.value = data.reservation;
    //本地存储所有信息条数
    let ma = data.record;
    localStorage.setItem("sum", `${ma}`);
  });
}

/** 重置查询 */
function resetQuery() {
  if (queryParams.keywords1) {
    queryParams.keywords1 = "";
  }
  if (queryParams.keywords2) {
    queryParams.keywords2 = "";
  }
  if (queryParams.keywords3) {
    queryParams.keywords3 = "";
  }
  if (queryParams.keywords4) {
    queryParams.keywords4 = "";
  }
  if (queryParams.keywords5) {
    queryParams.keywords5 = "";
  }
  if (queryParams.keywords6) {
    queryParams.keywords6 = "";
  }
  if (queryParams.keywords7) {
    queryParams.keywords7 = "";
  }
  handleQuery();
}

/**行点击事件 */
function onRowClick(row: MenuVO) {
  selectedRowMenuId.value = row.id;
}

//取消预约，menuId可以直接获取id,该错误无影响
function handleDelete(menuId: number, menuStatu: number) {
  if (menuStatu === "0") {
    ElMessageBox.confirm("确认取消当前预约记录吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      canSub(menuId).then(() => {
        console.log("取消预约成功");
        handleQuery();
      });
    });
  } else {
    alert("该条预约已开始/被取消，不可取消");
  }
}

/** 关闭弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

//状态下拉框
const options = [
  {
    value: "0",
    label: "未开始",
  },
  {
    value: "1",
    label: "已开始",
  },
  {
    value: "2",
    label: "违规取消",
  },
  {
    value: "3",
    label: "用户取消",
  },
];

/** 重置表单 */
function resetForm() {
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();
  formData.id = undefined;
  formData.parentId = 0;
  formData.visible = 1;
  formData.sort = 1;
  formData.perm = undefined;
  formData.component = undefined;
  formData.path = undefined;
  formData.redirect = undefined;
  formData.alwaysShow = undefined;
  formData.keepAlive = undefined;
}

onMounted(() => {
  handleQuery(); //与数据渲染有关
});

//获取本地存储的预约记录条数
let ss = Number(localStorage.getItem("sum"));
</script>

<template>
  <div class="app-container">
    <!-- 上方搜索区 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        &nbsp;
        <el-form-item prop="keywords">
          <el-input
            v-model="queryParams.keywords6"
            placeholder="姓名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="keywords">
          <el-input
            v-model="queryParams.keywords2"
            placeholder="学号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="keywords">
          <el-input
            v-model="queryParams.keywords1"
            placeholder="楼栋号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="keywords">
          <el-input
            v-model="queryParams.keywords5"
            placeholder="教室"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="keywords">
          <el-input
            v-model="queryParams.keywords3"
            placeholder="座位号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item prop="keywords">
          <el-select
            v-model="queryParams.keywords4"
            class="m-2"
            placeholder="预约状态"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="keywords">
          <!-- 时间搜索，type为类型，range-separator为中间连接符，start/end-placeholder为前后框初始内容 -->
          <el-date-picker
            v-model="queryParams.keywords7"
            type="datetimerange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />&nbsp;
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><template #icon><i-ep-search /></template>搜索</el-button
          >
          <el-button @click="resetQuery">
            <template #icon><i-ep-refresh /></template>
            重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!-- 中间表格区 -->
    <el-card shadow="never" class="table-container">
      <!-- 可能与登录有关，不可注释 -->
      <el-table
        v-loading="loading"
        :data="m"
        highlight-current-row
        row-key="id"
        :expand-row-keys="['1']"
        @row-click="onRowClick"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren',
        }"
        style="width: 100%; height: 403px; overflow: auto"
      >
        <!-- label为表头名字 -->
        <el-table-column label="序号" align="center" width="90" prop="id" />

        <el-table-column label="姓名" align="center" width="80" prop="name" />

        <el-table-column
          label="学号"
          align="center"
          width="150"
          prop="student_number"
        />

        <el-table-column
          label="楼栋号"
          align="center"
          width="100"
          prop="building_name"
        />

        <el-table-column
          label="教室"
          align="center"
          width="70"
          prop="ClassroomLocation"
        />

        <el-table-column
          label="座位号"
          align="center"
          width="80"
          prop="seat_number"
        />

        <el-table-column
          label="创建时间"
          align="center"
          width="200"
          prop="appointment_created_at"
        >
          <template #default="{ row }">
            <span>{{
              new Date(`${row.appointment_created_at}`).toLocaleString()
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="开始时间"
          align="center"
          width="200"
          prop="appointment_time_start"
        >
          <template #default="{ row }">
            <span>{{
              new Date(`${row.appointment_time_start}`).toLocaleString()
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="结束时间"
          align="center"
          width="200"
          prop="appointment_time_end"
        >
          <template #default="{ row }">
            <span>{{
              new Date(`${row.appointment_time_end}`).toLocaleString()
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="预约状态"
          align="center"
          width="120"
          prop="reserve_status"
        >
          <!-- 错误无影响 -->
          <template #default="{ row }">
            <!-- <el-tag :color="red">1 </el-tag> -->
            <el-tag
              v-if="`${row.reserve_status}` == 0"
              type="success"
              effect="dark"
              >未开始</el-tag
            >
            <el-tag
              v-else-if="`${row.reserve_status}` == 1"
              type="info"
              effect="dark"
              >已开始</el-tag
            >
            <el-tag
              v-else-if="`${row.reserve_status}` == 2"
              type="danger"
              effect="dark"
              >违规取消</el-tag
            >
            <el-tag v-else type="warning" effect="dark">用户取消</el-tag>
          </template>
        </el-table-column>

        <!-- click.stop后面的括号可以得到该行数据的内容 -->
        <el-table-column fixed="right" align="center" label="操作" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="handleDelete(scope.row.id, scope.row.reserve_status)"
              ><i-ep-delete />
              取消预约
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 翻页；total总条数 current-page当前页数 page-size每页条数-->
      <div class="demo-pagination-block">
        <hr />
        <el-pagination
          v-model:current-page="currentPage4"
          v-model:page-size="pageSize4"
          :page-sizes="[100, 200, 300, 400]"
          :small="small"
          :disabled="disabled"
          :background="background"
          layout="total, sizes, prev, pager, next, jumper"
          :total="ss"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      destroy-on-close
      append-to-body
      width="1000px"
      @close="closeDialog"
      top="5vh"
    />
  </div>
</template>
