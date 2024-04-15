import request from "@/utils/request";

/**
 * 获取教室，搜索
 */
export function getQueryApi(data) {
  return request({
    url: "/classroomAdmin/query/classroom",
    method: "post",
    data,
  });
}
/**
 * 通过ID查询教室
 */
export function getClassroomIdApi(id) {
  return request({
    url: "/classroomAdmin/getClassroom/id",
    method: "get",
    params: {
      classroom_id: id,
    },
  });
}
/**
 * 修改教室信息
 */
export function UpdateClassroomApi(data) {
  return request({
    url: "/classroomAdmin/update/classroom",
    method: "post",
    data,
  });
}
/**
 * 新增教室信息
 */
export function AddClassroomApi(data) {
  return request({
    url: "/classroomAdmin/add/classroom",
    method: "post",
    data,
  });
}

/**
 * 删除教室信息
 */
export function DeleteClassroomApi(data) {
  return request({
    url: "/classroomAdmin/delete/classroom",
    method: "post",
    data: {
      classroom_ids: data,
    },
  });
}
/**
 * 导入数据
 */
export function LeadApi(data) {
  return request({
    url: "/classroomAdmin/upload/classroom",
    method: "post",
    data: {
      classroom: data,
    },
  });
}
