<script setup lang="ts">
import {
  getRolePage,
  updateRole,
  getRoleForm,
  addRole,
  deleteRoles,
  getRoleMenuIds,
  updateRoleMenus,
  getPolicyForRole,
  deleteRolePolicy,
  createRole,
  allocate,
} from "@/api/role";
import { getMenuOptions } from "@/api/menu";

import { RolePageVO, RoleForm, RoleQuery } from "@/api/role/types";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const roleQxFormRef = ref(ElForm);

const queryFormRef = ref(ElForm);
const roleFormRef = ref(ElForm);
const menuRef = ref(ElTree);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<RoleQuery>({
  pageNum: 1,
  pageSize: 10,
  data: "",
});

const roleList = ref<RolePageVO[]>();

const dialog = reactive<DialogOption>({
  visible: false,
});

const rollQxAddDialog = reactive({
  visible: false,
});

const formQxData = reactive({
  role_name: "",
  url: "",
  method: "",
});
let currentCheckedMenuIds = reactive([]);
let currentRole = ref("");

const formData = reactive<RoleForm>({
  sort: 1,
  status: 1,
  code: "",
  name: "",
});

const rules = reactive({
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  dataScope: [{ required: true, message: "请选择数据权限", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "blur" }],
});

const qxRules = reactive({
  role_name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  url: [{ required: true, message: "请输入角色权限", trigger: "blur" }],
  method: [{ required: true, message: "请选择请求方法", trigger: "blur" }],
});

const menuDialogVisible = ref(false);

const menuList = ref<OptionType[]>([]);

interface CheckedRole {
  id?: number;
  name?: string;
}
let checkedRole: CheckedRole = reactive({});

/** 查询 */
function handleQuery() {
  loading.value = true;
  let myqueryParams = {
    page_no: queryParams.pageNum,
    page_size: queryParams.pageSize,
    data: queryParams.keywords || "",
  };
  getRolePage(myqueryParams)
    .then(({ data }) => {
      let dataObj = [];
      for (let item of data.all_roles) {
        let newItem = {
          ...item,
          code: item["gormadapter_casbin_rule"].V0,
          sort: item.ordered,
          id: item["gormadapter_casbin_rule"].ID,
          name: item["gormadapter_casbin_rule"].V1,
        };
        dataObj.push(newItem);
      }
      roleList.value = dataObj;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}
/** 重置查询 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行checkbox 选中事件 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/** 打开角色表单弹窗 */
function openDialog(roleId?: number) {
  dialog.visible = true;
  if (roleId) {
    dialog.title = "修改角色";
    getRoleForm(roleId).then(({ data }) => {
      let myData = {
        id: data.gormadapter_casbin_rule.ID,
        code: data.gormadapter_casbin_rule.V0,
        name: data.gormadapter_casbin_rule.V1,
      };
      Object.assign(formData, myData);
    });
  } else {
    dialog.title = "新增角色";
  }
}

/** 打开新增权限弹窗 */
function openRoleQxAddDialog(roleId?: number) {
  rollQxAddDialog.visible = true;

  // if (roleId) {
  //   dialog.title = "修改角色";
  //   getRoleForm(roleId).then(({ data }) => {
  //     let myData = {
  //       id: data.gormadapter_casbin_rule.ID,
  //       code: data.gormadapter_casbin_rule.V0,
  //       name: data.gormadapter_casbin_rule.V1
  //     }
  //     console.log(formData, data, '----------------================')
  //     Object.assign(formData, myData);
  //   });
  // } else {
  //   dialog.title = "新增角色";
  // }
}

function handleRollQxAddSubmit() {
  roleQxFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      let myFormQxData = {
        gormadapter_casbin_rule: {
          V0: formQxData.role_name, //角色
          V1: formQxData.url, //角色权限
          V2: formQxData.method, //请求方法
        },
        role_name: formQxData.url, //权限名称
      };
      createRole(myFormQxData)
        .then(() => {
          ElMessage.success("新增成功");
          closeRollQxAddDialog();
          resetQuery();
        })
        .finally(() => (loading.value = false));
    }
  });
}

/** 角色保存提交 */
function handleSubmit() {
  roleFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const roleId = formData.id;
      let myFormData = {
        id: formData.id,
        role: formData.name,
        role_code: formData.code * 1,
        status: formData.status,
        ordered: formData.sort,
      };
      if (roleId !== undefined) {
        updateRole(myFormData)
          .then(() => {
            ElMessage.success("修改成功");
            closeDialog();
            resetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        addRole(myFormData)
          .then(() => {
            ElMessage.success("新增成功");
            closeDialog();
            resetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/** 关闭表单弹窗 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/** 关闭角色权限新增弹窗 */
function closeRollQxAddDialog() {
  rollQxAddDialog.visible = false;
  // resetForm();
}

/** 重置表单 */
function resetForm() {
  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();

  formData.id = undefined;
  formData.sort = 1;
  formData.status = 1;
}

/** 删除角色 */
function handleDelete(roleId?: number) {
  const roleIds = [roleId || ids.value].join(",");
  if (!roleIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    loading.value = true;
    let myroleIds = roleIds.split(",");
    let myroleIds1 = [];
    for (let item of myroleIds) {
      myroleIds1.push(item * 1);
    }
    deleteRoles(myroleIds1)
      .then(() => {
        ElMessage.success("删除成功");
        resetQuery();
      })
      .finally(() => (loading.value = false));
  });
}
function getOptionsIds(arr, res = []) {
  for (let item of arr) {
    if (item.is_control == 1) {
      res.push(item.value);
    }
    if (item.children && item.children.length > 0) {
      getOptionsIds(item.children, res);
    }
  }
  return res;
}

/** 打开分配菜单弹窗 */
function openMenuDialog(row: RolePageVO) {
  // checkedRole = {
  //   id: row.id,
  //   name: row.name,
  // };
  // getPolicyForRole(row.name)
  //   .then((res) => {
  //     menuDialogVisible.value = true;
  //     loading.value = true;
  //     let myRes = [];
  //     for (let item of res.data) {
  //       let obj = {
  //         label: item.gormadapter_casbin_rule.V1,
  //         value: item.gormadapter_casbin_rule.ID,
  //       };
  //       myRes.push(obj);
  //     }
  //     menuList.value = myRes;
  //   })
  //   .finally(() => {
  //     loading.value = false;
  //   });

  const roleId = row.id;
  if (roleId) {
    checkedRole = {
      id: roleId,
      name: row.name,
    };
    menuDialogVisible.value = true;
    loading.value = true;
    getMenuOptions(row.code)
      .then((res) => {
        menuList.value = res.data;
        let checkedMenuIds = getOptionsIds(res.data);
        console.log(checkedMenuIds, res.data, "--------------返现的权限id");
        currentCheckedMenuIds = checkedMenuIds;
        currentRole = row.name;
        // currentRole = row.
        Promise.resolve().then(() => {
          checkedMenuIds.forEach((menuId) => {
            menuRef.value.setChecked(menuId, true, false);
          });
        });
      })
      .finally(() => {
        loading.value = false;
      });

    // // 获取所有的菜单
    // getMenuOptions().then((response) => {
    //   menuList.value = response.data;
    //   // 回显角色已拥有的菜单
    //   getRoleMenuIds(roleId)
    //     .then(({ data }) => {
    //       const checkedMenuIds = data;
    //       console.log("勾选权限", checkedMenuIds);
    //       checkedMenuIds.forEach((menuId) =>
    //         menuRef.value.setChecked(menuId, true, false)
    //       );
    //     })
    //     .finally(() => {
    //       loading.value = false;
    //     });
    // });
  }
}

function getDeletIds(currentArr, newArr) {
  return currentArr.reduce((arr, item) => {
    if (!newArr.includes(item)) arr.push(item);
    return arr;
  }, []);
}

function getSaveIds(currentArr, newArr) {
  return newArr.reduce((arr, item) => {
    if (!currentArr.includes(item)) arr.push(item);
    return arr;
  }, []);
}

/** 角色分配菜单保存提交 */
function handleRoleMenuSubmit() {
  // const checkedMenuIds: number[] = menuRef.value
  //   .getCheckedNodes(false, true)
  //   .map((node: any) => node.value);

  // loading.value = true;
  // // 调用删除接口
  // deleteRolePolicy(checkedMenuIds)
  //   .then(() => {
  //     ElMessage.success("删除成功");
  //     menuDialogVisible.value = false;
  //     resetQuery();
  //   })
  //   .finally(() => {
  //     loading.value = false;
  //   });

  const checkedMenuIds: number[] = menuRef.value
    .getCheckedNodes(false, true)
    .map((node: any) => node.value);
  let delete_ids = getDeletIds(currentCheckedMenuIds, checkedMenuIds);
  let save_ids = getSaveIds(currentCheckedMenuIds, checkedMenuIds);
  let obj = {
    role: currentRole,
    delete_ids,
    save_ids,
  };

  loading.value = true;
  // 分配权限
  allocate(obj)
    .then((res) => {
      ElMessage.success("分配权限成功");
      menuDialogVisible.value = false;
      resetQuery();
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      loading.value = false;
    });
  console.log(obj);
}

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="角色名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery"
            ><i-ep-search />搜索</el-button
          >
          <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>
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
        ref="dataTableRef"
        v-loading="loading"
        :data="roleList"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="角色名称" prop="name" min-width="100" />
        <el-table-column label="角色编码" prop="code" width="150" />

        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="排序" align="center" width="80" prop="sort" />

        <el-table-column fixed="right" label="操作" width="320">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click="openMenuDialog(scope.row)"
            >
              <i-ep-position />分配权限
            </el-button>
            <!-- <el-button
              type="primary"
              size="small"
              link
              @click="openRoleQxAddDialog()"
            >
              <i-ep-position />新增权限
            </el-button> -->
            <el-button
              type="primary"
              size="small"
              link
              @click="openDialog(scope.row.id)"
            >
              <i-ep-edit />编辑
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
            >
              <i-ep-delete />删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="closeDialog"
    >
      <el-form
        ref="roleFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <el-input-number
            v-model="formData.code"
            placeholder="请输入角色编码"
            style="width: 200px"
          />
        </el-form-item>

        <!-- <el-form-item label="数据权限" prop="dataScope">
          <el-select v-model="formData.dataScope">
            <el-option :key="0" label="全部数据" :value="0" />
            <el-option :key="1" label="部门及子部门数据" :value="1" />
            <el-option :key="2" label="本部门数据" :value="2" />
            <el-option :key="3" label="本人数据" :value="3" />
          </el-select>
        </el-form-item> -->

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 100px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 角色权限添加表单窗口 -->
    <el-dialog
      v-model="rollQxAddDialog.visible"
      title="添加角色权限"
      width="500px"
      @close="closeRollQxAddDialog"
    >
      <el-form
        ref="roleQxFormRef"
        :model="formQxData"
        :qxRules="qxRules"
        label-width="100px"
      >
        <el-form-item label="角色" prop="role_name">
          <el-input v-model="formQxData.role_name" placeholder="请输入角色" />
        </el-form-item>
        <el-form-item label="角色权限" prop="url">
          <el-input v-model="formQxData.url" placeholder="请输入角色权限" />
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-input v-model="formQxData.method" placeholder="请输入请求方法" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleRollQxAddSubmit"
            >确 定</el-button
          >
          <el-button @click="closeRollQxAddDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配菜单弹窗  -->
    <el-dialog
      v-model="menuDialogVisible"
      :title="'【' + checkedRole.name + '】权限分配'"
      width="800px"
    >
      <el-scrollbar v-loading="loading" max-height="600px">
        <el-tree
          ref="menuRef"
          node-key="value"
          show-checkbox
          :data="menuList"
          :default-expand-all="true"
        >
          <template #default="{ data }">
            {{ data.label }}
          </template>
        </el-tree>
      </el-scrollbar>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleRoleMenuSubmit"
            >确 定</el-button
          >
          <el-button @click="menuDialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
