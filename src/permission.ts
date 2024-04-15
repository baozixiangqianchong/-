// 总结：
// 这是一个路由守卫
// 对登录和未登录做了处理
// 未登录则可以跳转白名单中的路由或重定向到首页
// 登录后
import router from "@/router";
import { useUserStoreHook } from "@/store/modules/user";
import { usePermissionStoreHook } from "@/store/modules/permission";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false }); // 进度条

const permissionStore = usePermissionStoreHook();

// 白名单路由 白名单就是为了不受导航守卫的限制
const whiteList = ["/login"];
router.beforeEach(async (to, from, next) => {
  NProgress.start();
  const hasToken = localStorage.getItem("accessToken");
  if (hasToken) {
    if (to.path === "/login") {
      // 如果已登录，跳转首页
      next({ path: "/" });
      NProgress.done();
    } else {
      const userStore = useUserStoreHook();
      const hasRoles = userStore.user.roles && userStore.user.roles.length > 0;
      if (hasRoles) {
        // 未匹配到任何路由，跳转404
        if (to.matched.length === 0) {
          from.name ? next({ name: from.name }) : next("/404");
        } else {
          next();
        }
      } else {
        try {
          const { roles } = await userStore.getUserInfo();
          // const { roles } = await userStore.getUserInfo();
          const accessRoutes = await permissionStore.generateRoutes(roles);
          accessRoutes.forEach((route) => {
            router.addRoute(route);
          });
          next({ ...to, replace: true });
          // next("/login");
          // next("/dashboard");
        } catch (error) {
          // 移除 token 并跳转登录页
          await userStore.resetToken();
          next(`/login?redirect=${to.path}`);
          NProgress.done();
        }
      }
    }
  } else {
    // 未登录可以访问白名单页面
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});