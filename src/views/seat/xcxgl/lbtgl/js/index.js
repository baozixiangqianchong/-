//轮播图js
import request from "@/utils/request";

//新增数据
export function addData(data) {
  return request({
    url: "/carousel/add",
    method: "POST",
    data,
  });
}

//删除数据
export function delData(id) {
  return request({
    url: `/carousel/del?id=${id}`,
    method: "GET",
  });
}

//修改数据
export function updateData(data) {
  console.log("da", data);
  return request({
    url: `/carousel/update`,
    method: "POST",
    data,
  });
}

//查询数据
export function findData(page, page_size) {
  return request({
    url: `/carousel?page=${page}&page_size=${page_size}`,
    method: "GET",
  });
}

//根据标题查询数据
export function findDataToTitle(page, page_size, title) {
  console.log("%", page, page_size, title);
  return request({
    url: `/carousel/query_title?page=${page}&page_size=${page_size}&title=${title}`,
    method: "GET",
  });
}

//修改发布状态
export function updateState(id) {
  console.log(typeof id);
  console.log("id", id);
  return request({
    url: `/carousel/publish`,
    method: "POST",
    data: {
      id,
    },
  });
}

//上传图片
export function upPhoto(file) {
  request.defaults.headers["Content-Type"] = "multipart/form-data";
  return request({
    url: "/carousel/upload_image",
    method: "POST",
    data: file,
  });
}
