<!-- 轮播图管理 -->
<script setup lang="ts">
//引入接口
import {
  addData,
  delData,
  updateData,
  findData,
  findDataToTitle,
  updateState,
  upPhoto,
} from "./js";

import { RoleForm, RoleQuery } from "@/api/role/types";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const queryFormRef = ref(ElForm);
const roleFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref<number[]>([]);

const queryParams = reactive<RoleQuery>({
  pageNum: 1,
  pageSize: 10,
});

const dialog = reactive<DialogOption>({
  visible: false,
});

const formData = reactive<RoleForm>({
  id: "",
  code: "",
  name: "",
  title: "",
  priority: "",
  photo: "",
});

const rules = reactive({
  photo: [{ required: true, message: "请选择一张照片", trigger: "blur" }],
  priority: [
    { required: true, message: "请设置该照片优先级", trigger: "blur" },
  ],
});

/**
 * 轮播图专用
 */
let arr = [];
let arr1 = [];
let dt2 = ref([]);
function lunbotu() {
  findData(1, 999).then((result) => {
    dt2.value = result.data.struct;
    arr = [];
    arr1 = [];
    for (let i = 0; i < dt2.value.length; i++) {
      if (dt2.value[i].carousel_status == 1) {
        arr1.push({
          url: "http://110.40.228.197:8080/" + dt2.value[i].picture,
          yxj: dt2.value[i].priority,
        });
      }
    }
    arr1.sort((a, b) => b.yxj - a.yxj);
    console.log("成功", arr1.length);
    for (let i = 0; i < arr1.length; i++) {
      arr.push(arr1[i].url);
    }
    console.log("aarr", arr);
    localStorage.setItem("arr", JSON.stringify(arr));
    arr2 = JSON.parse(localStorage.getItem("arr"));
  });
}

/** 查询所有、根据title查询接口 */
let dt = ref([]);
let sum = ref();
async function handleQuery() {
  if (queryParams.keywords) {
    findDataToTitle(
      currentPage4.value,
      pageSize4.value,
      queryParams.keywords?.trim()
    )
      .then((result) => {
        console.log("筛选成功", result);
        dt.value = result.data.struct;
      })
      .catch((err) => {
        console.log("筛选失败", err);
      });
    return;
  }
  findData(currentPage4.value, pageSize4.value).then((result) => {
    console.log("查询成功", result.data.record);
    sum.value = result.data.record;
    dt.value = result.data.struct;
  });
}
/** 重置查询 */
function resetQuery() {
  if (queryParams.keywords) {
    queryParams.keywords = "";
  }
  handleQuery();
}

/** 行checkbox 选中事件 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/** 新增/修改弹出窗口以及修改数据  接口*/
let target = ref({ tar: false, ID: "" });
function openDialogAdd() {
  dialog.visible = true;
  dialog.title = "新增图片";
}

function openDialogUpd(id, status) {
  if (status == "1") {
    alert("已发布的照片不可修改，请先修改发布状态");
    return;
  }
  dialog.visible = true;
  dialog.title = "修改信息";
  target.value = { tar: true, ID: id.toString() };
}

// 修改发布状态 接口,错误无影响
function fabu(id) {
  let I1 = id.toString();
  updateState(I1).then((result) => {
    console.log("修改成功", result);
    lunbotu();
    handleQuery();
  });
}

/** 新增 接口 */
function handleSubmit(roleStatus?: string) {
  console.log("form", b.value);
  if (!target.value.tar) {
    let d = {
      title: formData.title?.toString() ? formData.title?.toString() : "无标题",
      priority: formData.priority?.toString(),
      picture: b.value ? b.value : 0,
      carousel_status: "0",
    };
    addData(JSON.stringify(d))
      .then((result) => {
        console.log("增加成功");
        handleQuery();
        closeDialog();
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let d2 = {
      id: target.value.ID,
      title: formData.title?.toString(),
      priority: formData.priority?.toString(),
      picture: b.value ? b.value : 0,
      carousel_status: "0",
    };
    updateData(JSON.stringify(d2))
      .then((result) => {
        target.value.tar = false;
        console.log("修改成功", result);
        closeDialog();
        handleQuery();
      })
      .catch((err) => {
        console.log("修改失败", err);
      });
  }
}

/** 关闭表单弹窗 */
function closeDialog() {
  console.log("f", formData.photo);
  if (formData.title) {
    formData.title = undefined;
  }
  dialog.visible = false;
}

//清空已上传图片

/** 删除照片 接口*/
function handleDelete(roleId?: number, roleStatus?: number) {
  if (roleStatus == "1") {
    alert("已发布的照片不可删除，请先修改发布状态");
    return;
  }
  let I2 = roleId?.toString();
  console.log("I2", I2);
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    loading.value = true;
    delData(I2)
      .then(() => {
        ElMessage.success("删除成功");
        resetQuery();
      })
      .catch((err) => {
        console.log("删除失败", err);
      })
      .finally(() => (loading.value = false));
  });
}

onMounted(() => {
  lunbotu();
  handleQuery();
});

// 输入框
interface RestaurantItem {
  value: string;
  link: string;
}
const restaurants = ref<RestaurantItem[]>([]);
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? restaurants.value.filter(createFilter(queryString))
    : restaurants.value;
  cb(results);
};
const createFilter = (queryString: string) => {
  return (restaurant: RestaurantItem) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    );
  };
};

//发送照片请求
let b = ref("");
function handleFileChange(file: any) {
  let formData = new FormData();
  formData.append("file", file.raw);
  upPhoto(formData)
    .then((result) => {
      console.log("成功", (b.value = result.data));
    })
    .catch((err) => {
      console.log("失败", err);
    });
}

import type { UploadProps } from "element-plus";
const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  (b.value = ""), console.log(uploadFile, uploadFiles);
};
let arr2 = JSON.parse(localStorage.getItem("arr"));

//分页
const currentPage4 = ref(1);
const pageSize4 = ref(10);
const small = ref(false);
const background = ref(true);
const disabled = ref(false);
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`);
  handleQuery();
};
</script>

<template>
  <div class="app-container">
    <!-- 轮播图位置 -->
    <div class="block text-center">
      <span class="demonstration">轮播图预览</span>
      <el-carousel height="250px">
        <el-carousel-item v-for="item in arr2" :key="item">
          <img :src="item" alt="" class="imgup" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 中间搜索框 -->
    <el-card shadow="never" class="table-container">
      <template #header>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item prop="keywords">
            <el-input
              v-model="queryParams.keywords"
              placeholder="标题"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>

          <!-- 中间按钮新增、删除 -->
          <el-form-item>
            <el-button type="primary" @click="handleQuery()"
              ><i-ep-search />搜索</el-button
            >
            <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>
            <el-button type="success" @click="openDialogAdd()"
              ><i-ep-plus />新增</el-button
            >
          </el-form-item>
        </el-form>

        <!-- <el-button
          type="danger"
          :disabled="ids.length === 0"
          @click="handleDelete()"
          ><i-ep-delete />批量删除</el-button
        > -->
      </template>

      <!-- 下方表格· -->
      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="dt"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
        style="height: 248px; overflow: auto"
      >
        <!-- 里面的prop是数据 -->
        <!-- <el-table-column type="selection" width="40" align="left" /> -->

        <el-table-column label="序号" align="center" prop="ID" width="90" />

        <el-table-column label="标题" align="center" prop="title" width="146" />

        <el-table-column label="图片" align="center" prop="picture" width="460">
          <template #default="{ row }">
            <!-- <img src="http://110.40.228.197:8080/`${row.picture}`" alt=""> -->
            <img
              :src="`http://110.40.228.197:8080/${row.picture}`"
              class="imgdown"
              style="width: 100px"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="优先级"
          align="center"
          width="100"
          prop="priority"
        />

        <!-- 发布状态 -->
        <el-table-column
          label="发布状态"
          align="center"
          width="137"
          prop="carousel_status"
        >
          <template #default="{ row }">
            <el-tag
              v-if="`${row.carousel_status}` == 0"
              type="warning"
              effect="dark"
              >待发布</el-tag
            >
            <el-tag
              v-else-if="`${row.carousel_status}` == 1"
              type="success"
              effect="dark"
              >已发布</el-tag
            >
          </template>
        </el-table-column>

        <el-table-column fixed="right" align="center" label="操作" width="323">
          <template #default="scope">
            <!-- 方法未写 -->
            <el-button
              type="primary"
              size="small"
              link
              @click="fabu(scope.row.ID)"
            >
              <i-ep-position />切换发布状态
            </el-button>

            <el-button
              type="primary"
              size="small"
              link
              @click="openDialogUpd(scope.row.ID, scope.row.carousel_status)"
            >
              <i-ep-edit />编辑
            </el-button>

            <el-button
              type="primary"
              size="small"
              link
              @click="handleDelete(scope.row.ID, scope.row.carousel_status)"
            >
              <i-ep-delete />删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="demo-pagination-block">
        <hr />
        <el-pagination
          v-model:current-page="currentPage4"
          v-model:page-size="pageSize4"
          :page-sizes="[10, 20, 30, 40]"
          :small="small"
          :disabled="disabled"
          :background="background"
          layout="total, sizes, prev, pager, next, jumper"
          :total="sum"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 表格操作编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="closeDialog"
    >
      <!-- :rules="rules" 先不验证-->
      <el-form ref="roleFormRef" :model="formData" label-width="100px">
        <el-form-item label="图片" prop="photo">
          <el-upload
            limit="1"
            class="upload-demo"
            action="http://110.40.228.197:8080/app/carousel/upload_image"
            :on-remove="handleRemove"
            list-type="picture"
            :on-change="handleFileChange"
          >
            <el-button type="primary">点击上传照片</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-input-number
            v-model="formData.priority"
            controls-position="right"
            :min="0"
            style="width: 100px"
          />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-col :span="12">
            <el-autocomplete
              v-model="formData.title"
              :fetch-suggestions="querySearch"
              :trigger-on-focus="false"
              clearable
              class="inline-input w-50"
              placeholder="请输入标题/选填"
            />
          </el-col>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit()">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.demonstration {
  color: var(--el-text-color-secondary);
}

.imgup {
  width: 600px;
  height: 100%;
}

.imgdown {
  width: 50% !important;
}
</style>
