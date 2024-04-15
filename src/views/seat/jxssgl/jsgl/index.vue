<!-- 教室管理 -->
<script setup lang="ts">
defineOptions({
  name: "User",
  inheritAttrs: false,
});

import {
  classRoomQuery,
  classRoomPageVO,
  classRoomForm,
  Tree,
} from "@/api/baozi/jsgl/types";
import {
  getQueryApi,
  getClassroomIdApi,
  UpdateClassroomApi,
  AddClassroomApi,
  DeleteClassroomApi,
  LeadApi,
} from "@/api/baozi/jsgl";
import { allSampusApi, allBuildingApi } from "@/api/baozi/zwgl/index";

import type { UploadInstance } from "element-plus";
import { genFileId } from "element-plus";

const queryFormRef = ref(ElForm); // 查询表单
const userFormRef = ref(ElForm); // 用户表单
const uploadRef = ref<UploadInstance>(); // 上传组件

const loading = ref(false); //  加载状态
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const queryParams = reactive<classRoomQuery>({
  page_no: 1,
  page_size: 10,
});
//搜索框时间
const seekTime = ref("");
//设置时间
// const setTime = ref("");
const setTime = ref<[Date, Date]>([new Date(), new Date()]);
const total = ref(0); // 数据总数
const pageData = ref<classRoomPageVO[]>(); // 用户分页数据

//搜索框时间变化
watch(seekTime, (newVal) => {
  if (newVal) {
    queryParams.lock_start_time = newVal[0];
    queryParams.lock_end_time = newVal[1];
  } else {
    queryParams.lock_start_time = "";
    queryParams.lock_end_time = "";
  }
});
watch(setTime, (newVal) => {
  if (newVal) {
    formData.lock_start_time = newVal[0];
    formData.lock_end_time = newVal[1];
  } else {
    formData.lock_start_time = "";
    formData.lock_end_time = "";
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
const formData = reactive<classRoomForm>({
  classroom_status: 1,
  is_large_classroom: 0,
});

// 用户导入数据
const importData = reactive({
  deptId: undefined,
  file: undefined,
  fileList: [],
});

// 校验规则
const rules = reactive({
  location: [{ required: true, message: "教室号不能为空", trigger: "blur" }],
  build_name: [{ required: true, message: "楼栋号不能为空", trigger: "blur" }],
  seating: [{ required: true, message: "座位数不能为空", trigger: "blur" }],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  getQueryApi(queryParams)
    .then((res) => {
      pageData.value = res.data.classrooms;
      total.value = res.data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  seekTime.value = "";
  queryParams.page_no = 1;
  queryParams.lock_start_time = undefined;
  queryParams.lock_end_time = undefined;
  resetBroadside();
  handleQuery();
}

/**
 * 重置侧边树状导航
 */
function resetBroadside() {
  queryParams.campus_id = undefined;
  queryParams.building_id = undefined;
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
  dialog.visible = true;
  dialog.type = type;

  if (dialog.type === "user-form") {
    // 用户表单弹窗
    if (id) {
      dialog.title = "修改教室";
      getClassroomIdApi(id).then(({ data }) => {
        Object.assign(formData, { ...data });
        // 转换为数字格式
        formData.is_large_classroom = Number(formData.is_large_classroom);

        //修改表单时间框的格式，进行展示
        if (data.lock_start_time && data.lock_end_time) {
          setTime.value = [
            formatDatePart(data.lock_start_time),
            formatDatePart(data.lock_end_time),
          ];
        }
      });
    } else {
      dialog.title = "新增教室";
    }
  } else if (dialog.type === "user-import") {
    // 用户导入弹窗
    dialog.title = "导入教室";
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
  setTime.value = [];
  if (dialog.type === "user-form") {
    userFormRef.value.resetFields();
    userFormRef.value.clearValidate();
    formData.id = undefined;
    formData.classroom_status = 1;
  } else if (dialog.type === "user-import") {
    importData.file = undefined;
    importData.fileList = [];
  }
}

/** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  if (dialog.type === "user-form") {
    userFormRef.value.validate((valid: any) => {
      formData.is_large_classroom = String(formData.is_large_classroom);
      if (valid) {
        const userId = formData.id;
        loading.value = true;
        if (userId) {
          UpdateClassroomApi(formData)
            .then(() => {
              ElMessage.success("修改教室成功");
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        } else {
          AddClassroomApi(formData)
            .then(() => {
              ElMessage.success("新增教室成功");
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        }
      }
    });
  } else if (dialog.type === "user-import") {
    if (!importData?.file) {
      ElMessage.warning("上传Excel文件不能为空");
      return false;
    }
    LeadApi(importData?.file).then((response) => {
      ElMessage.success(response.data);
      closeDialog();
      resetQuery();
    });
  }
}, 3000);

/** 删除用户 */
function handleDelete(id?: number) {
  const dictTypeIds = [id || removeIds.value].join(",");

  ElMessageBox.confirm("确认删除教室?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    const data = dictTypeIds.split(",").map(Number);
    DeleteClassroomApi(data).then(() => {
      ElMessage.success("删除成功");
      resetQuery();
    });
  });
}

/** 下载导入模板 */
function downloadTemplate() {
  // downloadTemplateApi().then((response: any) => {
  //   const fileData = response.data;
  //   const fileName = decodeURI(
  //     response.headers["content-disposition"].split(";")[1].split("=")[1]
  //   );
  //   const fileType =
  //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";
  //   const blob = new Blob([fileData], { type: fileType });
  //   const downloadUrl = window.URL.createObjectURL(blob);
  //   const downloadLink = document.createElement("a");
  //   downloadLink.href = downloadUrl;
  //   downloadLink.download = fileName;
  //   document.body.appendChild(downloadLink);
  //   downloadLink.click();
  //   document.body.removeChild(downloadLink);
  //   window.URL.revokeObjectURL(downloadUrl);
  // });
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

onMounted(() => {
  handleQuery();
  allSampusApi().then((response) => {
    const newData = response.data.map((item: any) => {
      return {
        ...item,
        value: item.ID,
        label: item.campus_name,
      };
    });
    newData.unshift({
      value: "00",
      label: "全部",
      leaf: true,
    });
    deptList.value = newData;
  });
});
// 修改时间格式
function formatDate(startDateTime: any, endDateTime: any) {
  if (!startDateTime || !endDateTime) return "--/--";

  const formattedStart = formatDatePart(startDateTime);
  const formattedEnd = formatDatePart(endDateTime);

  return `${formattedStart} — ${formattedEnd}`;
}
// 格式化日期
const formatDatePart = (dateTime: any) => {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
const deptList = ref<Tree[]>();
const handleNodeClick = (data: Tree) => {
  resetBroadside();
  /**
   * 校区教室查询，
   * 楼栋教室查询，
   */
  if (data.value == "00") {
    resetQuery();
  } else if (data.hasOwnProperty("campus_name")) {
    queryParams.campus_id = data.value;
    handleQuery();
  } else if (data.hasOwnProperty("name")) {
    queryParams.building_id = data.value;
    handleQuery();
  }
};
//懒加载
function loadNode(node: any, resolve: any) {
  if (node.level === 1) {
    if (node.data.hasOwnProperty("campus_name")) {
      queryParams.campus_id = node.data.value;
      handleQuery();
      allBuildingApi(node.data.value).then((response) => {
        const newData = response.data.map((item: any) => {
          // 创建一个新的对象，保留原始数据并添加 label 字段
          return {
            ...item,
            value: item.ID,
            label: item.name,
            leaf: true,
          };
        });
        resolve(newData);
      });
    } else if (node.data.hasOwnProperty("name")) {
      queryParams.building_id = node.data.value;
      handleQuery();
      resolve([]);
    }
  } else {
    resolve([]);
  }
}
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <el-tree
          :data="deptList"
          :props="{ children: 'children', label: 'label', isLeaf: 'leaf' }"
          lazy
          :accordion="true"
          :highlight-current="true"
          :load="loadNode"
          :style="{
            'font-size': '14px',
            margin: '0px',
            padding: '15px',
          }"
          class="mt-2"
          :indent="30"
          @node-click="handleNodeClick"
        />
      </el-col>
      <!-- 搜索部分 -->
      <el-col :lg="20" :xs="24">
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item prop="location">
              <el-input
                v-model="queryParams.location"
                placeholder="教室号"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item prop="classroom_property">
              <el-input
                v-model="queryParams.classroom_property"
                placeholder="教室属性"
                clearable
                style="width: 200px"
              />
            </el-form-item>

            <el-form-item prop="classroom_status">
              <el-select
                v-model="queryParams.classroom_status"
                placeholder="状态"
                clearable
                class="!w-[100px]"
              >
                <el-option label="正常" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-date-picker
                class="!w-[400px]"
                v-model="seekTime"
                clearable
                type="datetimerange"
                range-separator="~"
                start-placeholder="锁定开始时间"
                end-placeholder="锁定截止时间"
                value-format="YYYY-MM-DD HH:mm"
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

        <el-card shadow="never" class="table-container">
          <template #header>
            <div class="flex justify-between">
              <div>
                <el-button type="success" @click="openDialog('user-form')"
                  ><i-ep-plus />新增</el-button
                >
                <el-button
                  type="danger"
                  :disabled="removeIds.length === 0"
                  @click="handleDelete()"
                  ><i-ep-delete />删除</el-button
                >
              </div>
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
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>

          <el-table
            v-loading="loading"
            :data="pageData"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              key="id"
              label="编号"
              align="center"
              prop="id"
              width="80"
            />
            <el-table-column
              key="build_name"
              label="楼栋号"
              align="center"
              prop="build_name"
            />
            <el-table-column label="教室号" align="center" prop="location" />
            <el-table-column
              label="教室属性"
              align="center"
              prop="classroom_property"
            />
            <el-table-column label="合教" align="center">
              <template #default="scope">
                {{ scope.row.is_large_classroom == 1 ? "是" : "否" }}
              </template>
            </el-table-column>
            <el-table-column label="座位数" align="center" prop="seating" />
            <el-table-column label="状态" align="center">
              <template #default="scope">
                <el-tag
                  :type="scope.row.classroom_status == 1 ? 'success' : 'info'"
                  >{{
                    scope.row.classroom_status == 1 ? "正常" : "禁用"
                  }}</el-tag
                >
              </template>
            </el-table-column>

            <el-table-column label="禁用时间" align="center" width="280">
              <template #default="scope">
                {{
                  scope.row.lock_start_time == ""
                    ? "--/--"
                    : formatDate(
                        scope.row.lock_start_time,
                        scope.row.lock_end_time
                      )
                }}
              </template>
            </el-table-column>

            <el-table-column label="操作" align="center" width="180">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="openDialog('user-form', scope.row.id)"
                  ><i-ep-edit />编辑</el-button
                >
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="handleDelete(scope.row.id)"
                  ><i-ep-delete />删除</el-button
                >
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

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      :width="dialog.width"
      append-to-body
      @close="closeDialog"
    >
      <!-- 用户新增/编辑表单 -->
      <el-form
        v-if="dialog.type === 'user-form'"
        ref="userFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="禁用时间">
          <el-date-picker
            class="!w-[400px]"
            v-model="setTime"
            type="datetimerange"
            range-separator="~"
            start-placeholder="锁定开始时间"
            end-placeholder="锁定截止时间"
            value-format="YYYY-MM-DD HH:mm"
            :disabled="formData.classroom_status == 1"
          />
        </el-form-item>
        <el-form-item label="楼栋号" prop="build_name">
          <el-input v-model="formData.build_name" placeholder="请输入楼栋号" />
        </el-form-item>

        <el-form-item label="教室号" prop="location">
          <el-input v-model="formData.location" placeholder="请输入教室号" />
        </el-form-item>

        <el-form-item label="座位数" prop="seating">
          <el-input v-model="formData.seating" placeholder="请输入座位数" />
        </el-form-item>
        <el-form-item label="教室属性" prop="classroom_property">
          <el-input
            v-model="formData.classroom_property"
            multiple
            placeholder="请输入教室属性"
          />
        </el-form-item>

        <el-form-item label="合教" prop="is_large_classroom">
          <el-radio-group v-model="formData.is_large_classroom">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="statusname">
          <el-radio-group v-model="formData.classroom_status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- 教室导入表单 -->
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
      <!-- 弹窗底部操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
