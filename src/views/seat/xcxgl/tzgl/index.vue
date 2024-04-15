<!--通知管理-->
<script setup lang="ts">
import { DictTypeForm } from "@/api/baozi/tzgl/types";

// 引入富文本
import Editor from "@/components/WangEditor/index.vue";

import {
  getQueryApi,
  addDictType,
  getUpdateApi,
  getDeleteApi,
  getByIdApi,
} from "@/api/baozi/tzgl";

const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const loading = ref(false);
const ids = ref([]);
const total = ref(0);

const url = ref(import.meta.env.VITE_APP_IMG_URL);

const queryParams = reactive({
  page_no: 1,
  page_size: 10,
  data: "",
});

const dictTypeList = ref();

const dialog = reactive<DialogOption>({
  visible: false,
});

const formData = reactive<DictTypeForm>({
  status: 1,
  type: 0,
});

const rules = reactive({
  head_img: [{ required: true, message: "请添加图片", trigger: "blur" }],
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
});

/** 查询 */
function handleQuery() {
  loading.value = true;
  getQueryApi(queryParams)
    .then(({ data }) => {
      dictTypeList.value = data.message;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 重置查询
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.page_no = 1;
  queryParams.data = "";
  handleQuery();
}

// /** 行复选框选中  */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.ID);
}

/**
 * 打开文章表单弹窗
 *
 * @param dicTypeId 文章类型ID
 */
function openDialog(dicTypeId?: number) {
  dialog.visible = true;
  if (dicTypeId) {
    dialog.title = "修改文章";
    getByIdApi(dicTypeId).then(({ data }) => {
      if (data.type == "OFFICIAL") {
        data.type = 0;
      } else if (data.type == "USER") {
        data.type = 1;
      }
      Object.assign(formData, data);
      formData.head_img = url.value + "/" + formData.head_img;
      localStorage.setItem("head_img", formData.head_img || "");
    });
  } else {
    dialog.title = "新增文章";
    localStorage.setItem("head_img", "");
  }
}

/** 文章表单提交 */
function handleSubmit() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = false;
      const dictTypeId = formData.ID;
      formData.head_img = formData.head_img?.slice(27);
      if (formData.type == "1") {
        formData.type = "USER";
      } else if (formData.type == "0") {
        formData.type = "OFFICIAL";
      }
      if (dictTypeId) {
        getUpdateApi(formData)
          .then(() => {
            ElMessage.success("修改成功");
            closeDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        // const data = {
        //   head_img_url: formData.head_img, //图片路径
        //   title: 123, //标题
        //   content: 123, //内容
        //   staus: 1, //消息状态
        // };
        addDictType(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleQuery();
            closeDialog();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// /** 关闭文章类型弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

// /**  重置文章表单 */
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.ID = undefined;
  formData.status = 1;
  formData.type = 1;
}

/** 删除文章 */
function handleDelete(dictTypeId?: number) {
  const dictTypeIds = [dictTypeId || ids.value].join();
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const data = dictTypeIds.split(",").map(Number);
    getDeleteApi(data).then(() => {
      ElMessage.success("删除成功");
      resetQuery();
    });
  });
}

onMounted(() => {
  handleQuery();
});
//时间格式化
const formatDatePart = (dateTime: any) => {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="" prop="name">
          <el-input
            v-model="queryParams.data"
            placeholder="标题"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery()">
            <i-ep-search />搜索
          </el-button>
          <el-button @click="resetQuery()"><i-ep-refresh />重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never" class="table-container">
      <template #header>
        <el-button type="success" @click="openDialog()"
          ><i-ep-plus />新增</el-button
        >
        <el-button
          type="danger"
          :disabled="ids.length === 0"
          @click="handleDelete()"
          ><i-ep-delete />删除</el-button
        >
      </template>
      <el-table
        v-loading="loading"
        highlight-current-row
        :data="dictTypeList"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" prop="ID" width="85" align="center" />
        <el-table-column
          label="封面"
          prop="head_img"
          width="300"
          align="center"
        >
          <template #default="scope">
            <el-image :src="`${url}/${scope.row.head_img}`" />
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="title" width="" />
        <el-table-column
          label="文章类型"
          align="center"
          prop="type"
          width="100"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'USER'" type="danger"
              >用户须知</el-tag
            >
            <el-tag v-else type="success">消息</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">发布</el-tag>
            <el-tag v-else type="info">未发布</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="CreatedAt"
          width="160"
        >
          <template #default="scope">
            {{ formatDatePart(scope.row.CreatedAt) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="openDialog(scope.row.ID)"
              ><i-ep-edit />编辑</el-button
            >
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="handleDelete(scope.row.ID)"
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

    <!-- 数据修改弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="980px"
      @close="closeDialog"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="封面图片" prop="head_img">
          <single-upload v-model="formData.head_img" />
        </el-form-item>
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="文章类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio :label="1">用户须知</el-radio>
            <el-radio :label="0">消息</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">发布</el-radio>
            <el-radio :label="0">不发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div style="border: 1px rgb(158 154 154 / 46.6%) solid">
            <editor
              v-model="formData.content"
              style="width: 100%; min-height: 200px"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
