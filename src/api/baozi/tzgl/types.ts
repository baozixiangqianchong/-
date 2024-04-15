/**
 * 文章表单类型声明
 */
export interface DictTypeForm {
  /**
   * 文章ID
   */
  ID?: number;
  /**
   *  文章标题
   */
  title?: string;
  /**
   * 状态(1:启用;0:禁用)
   */
  status: number;
  /**
   * 封面图片
   */
  head_img?: string;
  /**
   * 文章内容
   */
  content?: string;

  /**
   * 文章类型
   */
  type?: number | string;
}
/**
 * 文章列表类型声明
 */
export interface DictTypeForm {
  /**
   * 文章ID
   */
  ID?: number;
  /**
   *  文章标题
   */
  title?: string;
  /**
   * 状态(1:启用;0:禁用)
   */
  status: number;
  /**
   * 封面图片
   */
  head_img?: string;
  /**
   * 文章内容
   */
  content?: string;

  /**
   * 文章类型
   */
  type?: number | string;
  /**
   * 创建时间
   */
  CreatedAt?: string;
}
