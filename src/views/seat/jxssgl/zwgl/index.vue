<!-- 座位管理 -->
<script setup lang="ts">
defineOptions({
  name: "User",
  inheritAttrs: false,
});

import {} from "@/api/user/types";
import type { UploadInstance } from "element-plus";
import { genFileId } from "element-plus";

import {
  allSeatApi,
  allSampusApi,
  allBuildingApi,
  allClassroomApi,
  batchDelApi,
  ExelApi,
  addBatchApi,
  SeatIdApi,
  AddApi,
  SeatupdateApi,
} from "@/api/baozi/zwgl/index";
import {
  UserQuery,
  CampusType,
  BuildingType,
  SeatForm,
  SeatPageVO,
  Tree,
} from "@/api/baozi/zwgl/types";

const queryFormRef = ref(ElForm); // 查询表单
const userFormRef = ref(ElForm); // 用户表单
const uploadRef = ref<UploadInstance>(); // 上传组件

const loading = ref(false); //  加载状态
const removeIds = ref([]); // 删除用户ID集合 用于批量删除
const queryParams = reactive<UserQuery>({
  page_no: 1,
  page_size: 10,
});

const total = ref(0); // 数据总数
const pageData = ref<SeatPageVO[]>(); // 用户分页数据
const campusList = ref<CampusType[]>(); // 校区下拉数据源
const buildingList = ref<BuildingType[]>(); // 楼栋下拉数据源
const classroomList = ref<BuildingType[]>(); // 楼栋下拉数据源

// 弹窗对象
const dialog = reactive({
  visible: false,
  type: "user-form",
  width: 800,
  title: "",
});

//测试

// 用户表单数据
const formData = reactive<SeatForm>({});

// 用户导入数据
const importData = reactive({
  deptId: undefined,
  file: undefined,
  fileList: [],
});

// 校验规则
const rules = reactive({
  campus_id: [{ required: true, message: "校区不能为空", trigger: "blur" }],
  building_id: [{ required: true, message: "楼栋不能为空", trigger: "blur" }],
  classroom_id: [{ required: true, message: "教室不能为空", trigger: "blur" }],
  seat_number: [{ required: true, message: "座位号不能为空", trigger: "blur" }],
  seat_reserve: [
    { required: true, message: "预约状态不能为空", trigger: "blur" },
  ],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  allSeatApi(queryParams)
    .then(({ data }) => {
      pageData.value = data.seat;
      total.value = data.record;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.page_no = 1;
  resetBroadside();
  handleQuery();
}

/**
 * 重置侧边树状导航
 */
function resetBroadside() {
  queryParams.campus_id = undefined;
  queryParams.building_id = undefined;
  queryParams.classroom_id = undefined;
}

/** 行选中 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 加载校区下拉数据源 */
async function loadSampus() {
  allSampusApi().then((response) => {
    campusList.value = response.data;
  });
}

/** 加载楼栋下拉数据源 */
async function loadBuilding(id?: any) {
  allBuildingApi(id).then((response) => {
    buildingList.value = response.data;
  });
}

/** 加载教室下拉数据源 */
async function loadClassroom(id?: any) {
  allClassroomApi(id).then((response) => {
    classroomList.value = response.data;
  });
}

//点击选择校区，查找楼栋
const SampusClick = (data: any) => {
  loadBuilding(data.ID);
};
//点击楼栋，查找教室
const BuildingClick = (data: any) => {
  loadClassroom(data.ID);
};
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
    await loadSampus();
    if (id) {
      dialog.title = "修改座位";
      SeatIdApi(id).then(({ data }) => {
        Object.assign(formData, { ...data[0] });
        loadBuilding(formData.campus_id);
        loadClassroom(formData.building_id);
      });
    } else {
      dialog.title = "新增座位";
    }
  } else if (dialog.type === "user-import") {
    // 用户导入弹窗
    dialog.title = "导入座位";
    dialog.width = 600;
    // loadSampus();
  }
}

/**
 * 关闭弹窗
 *
 * @param type 弹窗类型  用户表单：user-form | 用户导入：user-import
 */
function closeDialog() {
  dialog.visible = false;
  if (dialog.type === "user-form") {
    userFormRef.value.resetFields();
    userFormRef.value.clearValidate();
    formData.id = undefined;
    formData.seat_reserve = 0;
  } else if (dialog.type === "user-import") {
    importData.file = undefined;
    importData.fileList = [];
  }
}

// /** 表单提交 */
const handleSubmit = useThrottleFn(() => {
  if (dialog.type === "user-form") {
    userFormRef.value.validate((valid: any) => {
      if (valid) {
        const userId = formData.id;
        loading.value = true;
        if (userId) {
          SeatupdateApi(userId, formData)
            .then(() => {
              ElMessage.success("修改用户成功");
              closeDialog();
              resetQuery();
            })
            .finally(() => (loading.value = false));
        } else {
          AddApi(formData)
            .then(() => {
              ElMessage.success("新增用户成功");
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
    addBatchApi(importData?.file).then((response) => {
      ElMessage.success(response.data);
      closeDialog();
      resetQuery();
    });
  }
}, 3000);

/** 删除用户 */
function handleDelete(id?: number) {
  const dictTypeIds = [id || removeIds.value].join(",");
  ElMessageBox.confirm("确认删除用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(function () {
    const data = dictTypeIds.split(",").map(String);
    batchDelApi(data).then(() => {
      ElMessage.success("删除成功");
      resetQuery();
    });
  });
}

/** 下载导入模板 */
function downloadTemplate() {
  ExelApi().then((response: any) => {
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

const deptList = ref<Tree[]>();
const handleNodeClick = (data: Tree) => {
  // 重置搜索条件
  resetBroadside();
  /**
   * 校区座位查询，
   * 楼栋座位查询，
   * 教室座位查询
   */
  if (data.value == "00") {
    resetQuery();
  } else if (data.hasOwnProperty("campus_name")) {
    queryParams.campus_id = data.value;
    handleQuery();
  } else if (data.hasOwnProperty("name")) {
    queryParams.building_id = data.value;
    handleQuery();
  } else if (data.hasOwnProperty("location")) {
    queryParams.classroom_id = data.value;
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
          };
        });
        resolve(newData);
      });
    }
  } else if (node.level === 2) {
    if (node.data.hasOwnProperty("name")) {
      queryParams.building_id = node.data.value;
      handleQuery();
      allClassroomApi(node.data.value).then((response) => {
        const newData = response.data.map((item: any) => {
          // 创建一个新的对象，保留原始数据并添加 label 字段
          return {
            ...item,
            value: item.ID,
            label: item.location,
            leaf: true,
          };
        });
        resolve(newData);
      });
    } else if (node.data.hasOwnProperty("location")) {
      queryParams.classroom_id = node.data.value;
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
          :load="loadNode"
          :highlight-current="true"
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
      <!-- 主图 -->
      <el-col :lg="20" :xs="24">
        <!-- 搜索 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item prop="building_name">
              <el-input
                v-model="queryParams.building_name"
                placeholder="楼栋"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item prop="classroom_name">
              <el-input
                v-model="queryParams.classroom_name"
                placeholder="教室"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item prop="seat_number">
              <el-input
                v-model="queryParams.seat_number"
                placeholder="座位号"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item prop="seat_reserve">
              <el-select
                v-model="queryParams.seat_reserve"
                placeholder="预约状态"
                clearable
                class="!w-[100px]"
              >
                <el-option label="使用中" value="2" />
                <el-option label="已预约" value="1" />
                <el-option label="未预约" value="0" />
              </el-select>
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
              width="100"
            />
            <el-table-column
              key="campus_name"
              label="分区"
              align="center"
              prop="campus_name"
            />
            <el-table-column
              key="building_name"
              label="楼栋"
              align="center"
              prop="building_name"
            />
            <el-table-column
              label="教室"
              width="120"
              align="center"
              prop="classroom_name"
            />

            <el-table-column
              label="座位号"
              width="100"
              align="center"
              prop="seat_number"
            />
            <el-table-column label="预约状态" align="center" prop="status">
              <template #default="scope">
                <el-tag
                  :type="
                    scope.row.seat_reserve == 2
                      ? 'success'
                      : scope.row.seat_reserve == 1
                      ? ''
                      : 'info'
                  "
                  >{{
                    scope.row.seat_reserve == 2
                      ? "使用中"
                      : scope.row.seat_reserve == 1
                      ? "已预约"
                      : "未预约"
                  }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="220">
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
        <el-form-item label="所属校区" prop="campus_id">
          <el-tree-select
            v-model="formData.campus_id"
            placeholder="请选择所属校区"
            :data="campusList"
            :props="{
              label: 'campus_name',
              disabled: '',
              value: 'ID',
            }"
            filterable
            check-strictly
            :render-after-expand="false"
            @node-click="SampusClick"
          />
        </el-form-item>
        <el-form-item label="楼栋号" prop="building_id">
          <el-tree-select
            v-model="formData.building_id"
            placeholder="请选择所属楼栋"
            :data="buildingList"
            :props="{
              label: 'name',
              disabled: '',
              value: 'ID',
            }"
            filterable
            check-strictly
            :render-after-expand="false"
            @node-click="BuildingClick"
          />
        </el-form-item>

        <el-form-item label="教室" prop="classroom_id">
          <el-tree-select
            v-model="formData.classroom_id"
            placeholder="请选择所属教室"
            :data="classroomList"
            :props="{
              label: 'location',
              disabled: '',
              value: 'ID',
            }"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="座位号" prop="seat_number">
          <el-input v-model="formData.seat_number" placeholder="请输入座位号" />
        </el-form-item>
        <el-form-item label="预约状态" prop="seat_reserve">
          <el-radio-group v-model="formData.seat_reserve">
            <el-radio :label="2">使用中</el-radio>
            <el-radio :label="1">已预约</el-radio>
            <el-radio :label="0">未预约</el-radio>
          </el-radio-group>
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
