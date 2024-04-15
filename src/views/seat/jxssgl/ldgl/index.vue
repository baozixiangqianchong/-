<!-- 楼栋管理 -->
<script setup lang="ts">
//引入接口
import {
  selectFloorInfo,
  onceAddFloor,
  getFloorToId,
  updFloorToId,
  delFloorAdm,
  getAllSchoolInfo,
  getIdToName,
  setInfoToExcel,
  getExcel,
} from "./js";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

import { exportUser } from "@/api/user";

import { UserForm, UserQuery, UserPageVO } from "@/api/user/types";
import type { UploadInstance } from "element-plus";
import { genFileId } from "element-plus";

const queryFormRef = ref(ElForm); // 查询表单
const userFormRef = ref(ElForm); // 用户表单
const uploadRef = ref<UploadInstance>(); // 上传组件

const loading = ref(false); //  加载状态
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 100,
});
let dateTimeRange = ref("");

watch(dateTimeRange, (newVal) => {
  if (newVal) {
    queryParams.startTime = newVal[0];
    queryParams.endTime = newVal[1];
  }
});

// 弹窗对象
const dialog = reactive({
  visible: false,
  type: "user-form",
  width: 800,
  title: "",
});

// 用户表单数据
const formData = reactive<UserForm>({
  status: 1,
});

// 用户导入数据
const importData = reactive({
  deptId: undefined,
  file: undefined,
  fileList: [],
});

// 校验规则
const rules = reactive({
  username: [{ required: true, message: "楼栋名不能为空", trigger: "blur" }],
  mobile: [{ required: true, message: "请选择选项", trigger: "blur" }],
  Date: [{ required: true, message: "请选择日期", trigger: "blur" }],
  N: [{ required: true, message: "纬度不能为空", trigger: "blur" }],
  W: [{ required: true, message: "经度不能为空", trigger: "blur" }],
});

/** 条件查询 */
let al = ref([]); //条件查询和查询所有需要的数组
function handleQuery() {
  selectFloorInfo(
    currentPage4.value,
    pageSize4.value,
    queryParams.keyName?.trim(),
    undefined,
    undefined,
    queryParams.status?.trim() === "禁用"
      ? 0
      : queryParams.status?.trim() === "启用"
      ? 1
      : -1
  )
    .then((result) => {
      console.log("查询成功", result);
      al.value = result.data.build;
      console.log(al.value);
    })
    .catch((err) => {
      console.log("查询失败", err);
    });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.keyName = undefined;
  queryParams.status = undefined;
  all();
}

/** 行选中 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/**
 * 打开弹窗
 *
 * @param type 弹窗类型  用户表单：user-form | 用户导入：user-import
 * @param id 用户ID
 */
async function openDialog(type: string, id?: number) {
  formData.id = id;
  dialog.visible = true;
  dialog.type = type;
  if (dialog.type === "user-form") {
    // 用户表单弹窗
    if (id) {
      console.log(id);
      dialog.title = "修改楼栋信息";
      getFloorToId(id)
        .then((result) => {
          console.log("获取成功", result);
          formData.mobile = result.data.campus_name;
          formData.username = result.data.name;
          formData.campus = result.data.campus_id;
          formData.N = result.data.latitude;
          formData.W = result.data.longitude;
        })
        .catch((err) => {
          console.log("获取失败", err);
        });
    } else {
      dialog.title = "新增楼栋信息";
    }
  } else if (dialog.type === "user-import") {
    // 用户导入弹窗
    dialog.title = "导入楼栋信息";
    dialog.width = 600;
  }
}

/**
 * 关闭弹窗
 *
 * @param type 弹窗类型  用户表单：user-form | 用户导入：user-import
 */
function closeDialog() {
  dialog.visible = false;
  dateTimeRange.value = "";
  if (dialog.type === "user-form") {
    userFormRef.value.resetFields();
    userFormRef.value.clearValidate();

    formData.id = undefined;
    formData.status = 1;
  } else if (dialog.type === "user-import") {
    importData.file = undefined;
    importData.fileList = [];
  }
}

/** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  console.log("formdata", formData);
  // console.log("mobile", formData.Date[0],'value',value.value);
  let startTime;
  let endTime;
  if (formData.Date) {
    //禁用开始时间
    startTime = (new Date(formData.Date[0]).getTime() / 1000).toString() || "";
    //禁用结束时间
    endTime = (new Date(formData.Date[1]).getTime() / 1000).toString() || "";
  }

  if (dialog.type === "user-form") {
    userFormRef.value.validate((valid: any) => {
      console.log(
        "sdf",
        formData.username,
        startTime,
        endTime,
        1,
        formData.status,
        formData.id,
        "1"
      );
      if (valid) {
        const userId = formData.id;

        //修改
        let xqId =
          formData.mobile === "西区"
            ? 1
            : formData.mobile === "东区"
            ? 2
            : formData.mobile === "新东区"
            ? 3
            : 0;
        console.log("xqId", xqId);
        if (userId) {
          updFloorToId(
            formData.username,
            startTime,
            endTime,
            xqId,
            formData.status,
            formData.id,
            "1",
            Number(formData.W),
            Number(formData.N)
          ).then((result) => {
            closeDialog();
            all();
            dateTimeRange.value = "";
          });
        } else {
          console.log("新增");
          onceAddFloor(
            "未使用",
            formData.username,
            formData.mobile,
            formData.status,
            Number(formData.W),
            Number(formData.N),
            startTime || "",
            endTime || ""
          )
            .then(() => {
              ElMessage.success("新增用户成功");
              dateTimeRange.value = "";
              console.log("新增成功");
              closeDialog();
              resetQuery();
            })
            .catch((err) => {
              console.log("新增失败", err);
            });
        }
      }
    });
  } else if (dialog.type === "user-import") {
    console.log("导入");
    /*  if (!importData?.deptId) {
      ElMessage.warning("请选择部门");
      return false;
    } */
    console.log("a", importData.file);
    if (!importData?.file) {
      ElMessage.warning("上传Excel文件不能为空");
      return false;
    }
    setInfoToExcel(importData.file)
      .then((result) => {
        console.log("导入成功");
      })
      .catch((err) => {
        console.log("导入失败", err);
      });
    /* importUser(importData?.deptId, importData?.file).then((response) => {
      ElMessage.success(response.data);
      closeDialog();
      resetQuery();
    }); */
  }
}, 3000);

/** 删除用户 */
let arr = [];
function handleDelete(id?: number) {
  let userIds = [id || removeIds.value];
  if (!id) {
    // ElMessage.warning("请勾选删除项");
    for (let i = 0; i < removeIds.value.length; i++) {
      arr.push(removeIds.value[i]);
    }
    userIds = arr;
  }

  ElMessageBox.confirm("确认删除用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    delFloorAdm(userIds).then(() => {
      ElMessage.success("删除成功");
      all();
    });
  });
}

/** 下载导入模板 */
function downloadTemplate() {
  getExcel()
    .then((result) => {
      console.log("获取模板成功", JSON.parse(result));
    })
    .catch((err) => {
      console.log("获取模板失败", JSON.parse(err));
    });

  /* downloadTemplateApi().then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(
      response.headers["content-disposition"].split(";")[1].split("=")[1]
    );
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  }); */
}

/** Excel文件 Change */
function handleFileChange(file: any) {
  importData.file = file.raw;
}

/** Excel文件 Exceed  */
function handleFileExceed(files: any) {
  uploadRef.value!.clearFiles();
  const file = files[0];
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  importData.file = file;
}

/** 导出用户 */
function handleExport() {
  exportUser(queryParams).then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(
      response.headers["content-disposition"].split(";")[1].split("=")[1]
    );
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
}

onMounted(() => {
  all();
});
//查询所有
function all() {
  selectFloorInfo(
    currentPage4.value,
    pageSize4.value,
    undefined,
    undefined,
    undefined,
    -1
  )
    .then((result) => {
      console.log("成功", result);
      al.value = result.data.build;
      localStorage.setItem("sum", result.data.total.toString());
    })
    .catch((err) => {
      console.log("失败1", err);
    });
}
//数据总数
let sum = Number(localStorage.getItem("sum"));

//翻页
const currentPage4 = ref(1);
const pageSize4 = ref(10);
const small = ref(false);
const background = ref(true);
const disabled = ref(false);

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`);
  all();
};
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`);
  all();
};

// 下拉选择框
const value = ref("");

const options = [
  {
    value: "西区",
    label: "西区",
  },
  {
    value: "东区",
    label: "东区",
  },
  {
    value: "新东区",
    label: "新东区",
  },
];
const options1 = [
  {
    value: "启用",
    label: "启用",
  },
  {
    value: "禁用",
    label: "禁用",
  },
];
</script>

<template>
  <div class="app-container">
    <!-- 用户列表 -->
    <div class="search-container">
      <!-- 顶部搜索栏 -->
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords">
          <el-input
            v-model="queryParams.keyName"
            placeholder="楼栋名"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item prop="keywords">
          <el-select v-model="queryParams.status" placeholder="状态">
            <el-option
              v-for="item in options1"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <!-- 搜索按钮 -->
          <el-button type="primary" @click="handleQuery"
            ><i-ep-search />搜索</el-button
          >
          <!-- 重置按钮 -->
          <el-button @click="resetQuery">
            <i-ep-refresh />
            重置</el-button
          >
        </el-form-item>
        <div style="display: flex; justify-content: space-between">
          <div>
            <el-button type="success" @click="openDialog('user-form')"
              ><i-ep-plus />新增</el-button
            >
            <!-- 删除 -->
            <el-button
              type="danger"
              :disabled="removeIds.length === 0"
              @click="handleDelete()"
              ><i-ep-delete />批量删除</el-button
            >
          </div>
          <!-- 导入 -->
          <div>
            <el-dropdown split-button>
              导入
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="downloadTemplate">
                    <i-ep-download />下载模板</el-dropdown-item
                  >
                  <el-dropdown-item @click="openDialog('user-import')">
                    <i-ep-top />导入数据</el-dropdown-item
                  >
                  <!-- 导出 -->
                </el-dropdown-menu>
              </template> </el-dropdown
            >&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>
        <hr />
      </el-form>
    </div>

    <!-- 中间 -->
    <el-card shadow="never" class="table-container">
      <!-- 中间按钮 -->
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <!-- 原来的位置 -->
      </el-form>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="al"
        @selection-change="handleSelectionChange"
        style="width: 100%; height: 421px; overflow: auto"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column
          key="id"
          label="楼栋序号"
          align="center"
          prop="id"
          width="100"
        />
        <el-table-column
          key="floor"
          label="楼栋名"
          align="center"
          prop="name"
        />
        <!-- <el-table-column
          key="campusid"
          label="所属校区号"
          align="center"
          prop="campus_id"
        /> -->
        <el-table-column
          key="campus"
          label="所属校区"
          align="center"
          prop="campus_name"
        />
        <el-table-column
          key="campus"
          label="经度"
          align="center"
          prop="longitude"
        />
        <el-table-column
          key="campus"
          label="纬度"
          align="center"
          prop="latitude"
        />
        <el-table-column label="开放状态" align="center" prop="building_status">
          <template #default="{ row }">
            <el-tag
              v-if="`${row.building_status}` == 1"
              type="success"
              effect="dark"
              >启用</el-tag
            >
            <el-tag
              v-else-if="`${row.building_status}` == 0"
              type="danger"
              effect="dark"
              >禁用</el-tag
            >
            <el-tag v-else type="warning" effect="dark">未选择状态</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="创建时间"
          align="center"
          prop="created_at"
          width="160"
        >
          <template #default="{ row }">
            <span>{{ new Date(row.created_at).toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="禁用开始时间"
          align="center"
          prop="lock_start_time"
          width="160"
        >
          <template #default="{ row }">
            <span>{{
              row.lock_start_time
                ? new Date(row.lock_start_time).toLocaleString()
                : "/"
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="禁用结束时间"
          align="center"
          prop="lock_end_time"
          width="160"
        >
          <template #default="{ row }">
            <span>{{
              row.lock_end_time
                ? new Date(row.lock_end_time).toLocaleString()
                : "/"
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="220" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="openDialog('user-form', scope.row.id)"
              >修改</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row.id)"
              ><i-ep-delete />删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 各种弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      :width="dialog.width"
      append-to-body
      @close="closeDialog"
    >
      <!-- 用户新增/修改表单 -->
      <el-form
        v-if="dialog.type === 'user-form'"
        ref="userFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="楼栋名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入楼栋名" />
        </el-form-item>
        <el-form-item label="楼栋区域" prop="mobile">
          <!-- 下拉选择框 -->
          <el-select
            class="m-2"
            placeholder="请选择楼栋所在校区"
            v-model="formData.mobile"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="经度" prop="W">
          <el-input v-model="formData.W" placeholder="请输入楼栋所在经度" />
        </el-form-item>

        <el-form-item label="纬度" prop="N">
          <el-input v-model="formData.N" placeholder="请输入楼栋所在纬度" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="formData.status === 0" prop="Date">
          <el-date-picker
            v-model="formData.Date"
            type="daterange"
            range-separator="~"
            start-placeholder="锁定开始日期"
            end-placeholder="锁定结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>

      <!-- 用户导入表单 -->
      <el-form
        v-else-if="dialog.type === 'user-import'"
        :model="importData"
        label-width="100px"
      >
        <el-form-item label="Excel文件">
          <el-upload
            ref="uploadRef"
            action=""
            drag
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            :limit="1"
            :auto-upload="false"
            :file-list="importData.fileList"
            :on-change="handleFileChange"
            :on-exceed="handleFileExceed"
          >
            <el-icon class="el-icon--upload">
              <i-ep-upload-filled />
            </el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <template #tip>
              <div>xls/xlsx files</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <!-- 新增、修改弹窗底部操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style>
.el-select {
  margin-top: 0;
  margin-left: 0;
}
</style>
