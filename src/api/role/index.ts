import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { RoleQuery, RolePageResult, RoleForm } from "./types";

// 分配菜单权限给角色
export function allocate(data: any) {
  return request({
    url: "/auth/casbin/allocate",
    method: "post",
    data,
  });
}

// 根据当前角色添加角色权限
export function createRole(data) {
  return request({
    url: "/auth/casbin/createRole",
    method: "post",
    data,
  });
}

// 根据当前角色获取该角色的所有权限
export function deleteRolePolicy(ids) {
  return request({
    url: "/auth/casbin/deleteRolePolicy",
    method: "post",
    data: {
      role_ids: ids,
    },
  });
}

// 根据当前角色获取该角色的所有权限
export function getPolicyForRole(roleName) {
  return request({
    url: "/auth/casbin/getPolicyForRole",
    method: "get",
    params: {
      role: roleName,
    },
  });
}
/**
 * 获取角色分页数据
 *
 * @param queryParams
 */
export function getRolePage(
  queryParams?: RoleQuery
): AxiosPromise<RolePageResult> {
  return request({
    url: "/auth/casbin/getAllRoles",
    method: "post",
    data: queryParams,
  });
}

/**
 * 获取角色下拉数据
 *
 * @param queryParams
 */
export function getRoleOptions(
  queryParams?: RoleQuery
): AxiosPromise<OptionType[]> {
  return request({
    url: "/api/v1/roles/options",
    method: "get",
    params: queryParams,
  });
}

/**
 * 获取角色的菜单ID集合
 *
 * @param queryParams
 */
export function getRoleMenuIds(roleId: number): AxiosPromise<number[]> {
  return request({
    url: "/api/v1/roles/" + roleId + "/menuIds",
    method: "get",
  });
}

/**
 * 分配菜单权限给角色
 *
 * @param queryParams
 */
export function updateRoleMenus(
  roleId: number,
  data: number[]
): AxiosPromise<any> {
  return request({
    url: "/api/v1/roles/" + roleId + "/menus",
    method: "put",
    data: data,
  });
}

/**
 * 获取角色详情
 *
 * @param id
 */
export function getRoleForm(id: number): AxiosPromise<RoleForm> {
  return request({
    url: "/auth/casbin/getRoleById",
    method: "get",
    params: { id: id },
  });
}

/**
 * 添加角色
 *
 * @param data
 */
export function addRole(data: RoleForm) {
  return request({
    url: "/auth/casbin/updateRole",
    method: "post",
    data: data,
  });
}

/**
 * 更新角色
 *
 * @param id
 * @param data
 */
export function updateRole(data: RoleForm) {
  return request({
    url: "/auth/casbin/changeRole",
    method: "post",
    data: data,
  });
}

/**
 * 批量删除角色，多个以英文逗号(,)分割
 *
 * @param ids
 */
export function deleteRoles(ids: string) {
  return request({
    url: "/auth/casbin/deleteByIds",
    method: "post",
    data: {
      ids: ids,
    },
  });
}
