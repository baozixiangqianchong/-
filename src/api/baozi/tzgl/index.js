import request from "@/utils/request";

/**
 * 获取文章，搜索
 */
export function getQueryApi(data) {
  return request({
    url: "/admin/query/announcement",
    method: "post",
    data,
  });
}

/**
 * 文章删除
 */
export function getDeleteApi(data) {
  return request({
    url: "/admin/delete/announcement",
    method: "post",
    data: {
      announcement_ids: data,
    },
  });
}

/**
 * 文章修改
 */
export function getUpdateApi(formData) {
  return request({
    url: "/admin/update/announcement",
    method: "post",
    data: {
      id: formData.ID,
      head_img: formData.head_img,
      title: formData.title,
      content: formData.content,
      status: formData.status,
      type: formData.type,
    },
  });
}

/**
 * 新增文章
 */
export function addDictType(formData) {
  return request({
    url: "/admin/create/announcement",
    method: "post",
    data: {
      head_img_url: formData.head_img,
      title: formData.title,
      content: formData.content,
      status: formData.status,
      type: formData.type,
    },
  });
}

/**
 * 根据ID查找文章
 */
export function getByIdApi(id) {
  return request({
    url: `/admin/query/announcementById`,
    method: "get",
    params: {
      id,
    },
  });
}
