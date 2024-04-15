import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { FileInfo } from "./types";
import { upPhoto } from "@/views/seat/xcxgl/lbtgl/js";
/**
 * 上传文件
 *
 * @param file
 */
export function uploadFileApi(file: File) {
  /**
   * 获取本地存储，并截取路径
   */
  // let oldimg = localStorage.getItem("head_img") || "";
  // oldimg = oldimg.slice(27);
  // console.log(typeof oldimg);

  return request({
    url: "/admin/upload/headImg",
    method: "post",
    data: {
      head_img: file,
      old_img_name: "",
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function uploadFileApi1(file: File): AxiosPromise<FileInfo> {
  const formData = new FormData();
  formData.append("file", file);
  /* return upPhoto(formData).then((result) => {
    
  }).catch((err) => {
    
  }); */
  return request({
    url: "/carousel/upload_image",
    method: "post",
    data: { file },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
/**
 * 删除文件
 *
 * @param filePath 文件完整路径
 */
export function deleteFileApi(filePath?: string) {
  return request({
    url: "/api/v1/files",
    method: "delete",
    params: { filePath: filePath },
  });
}
