/**
 * 角色查询参数
 */
export type RoleQuery = PageQuery;

/**
 * 角色分页对象
 */
export interface RolePageVO {
  /**
   * 角色编码
   */
  code?: string;

  /**
   * 角色ID
   */
  id?: number;
  /**
   * 角色名称
   */
  name?: string;
  /**
   * 排序
   */
  sort?: number;
  /**
   * 角色状态
   */
  status?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 修改时间
   */
  updateTime?: Date;
}

/**
 * 角色分页
 */
export type RolePageResult = PageResult<RolePageVO[]>;

/**
 * 角色表单对象
 */
export interface RoleForm {
  /**
   * 角色ID
   */
  id?: string;

  /**
   * 角色编码
   */
  // code: string;
  role_code: number;
  /**
   * 数据权限
   */
  dataScope?: number;

  /**
   * 角色名称
   */
  // name: string;
  role: string;
  /**
   * 排序
   */
  // sort?: number;
  ordered: number;
  /**
   * 角色状态(1-正常；0-停用)
   */
  // status?: number;

  /**
   * 图片标题
   */
  title?: string;

  /**
   * 图片状态
   */
  status?: string;

  /**
   * 图片链接
   */
  photo?: string;

  /**
   * 图片优先级
   */
  priority?: string;
}
