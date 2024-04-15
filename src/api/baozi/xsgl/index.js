import request from "@/utils/request";

/**
 * 查询学生
 */
export function allStudentsApi(data) {
  return request({
    url: "/studentAdmin/query/allStudents",
    method: "post",
    data,
  });
}

/**
 * 取消学生违规
 */
export function cancelStudentApi(data) {
  return request({
    url: "/studentAdmin/cancel/studentByIds",
    method: "post",
    data: {
      student_ids: data,
    },
  });
}
