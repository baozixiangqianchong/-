<script setup lang="ts">
import { useTagsViewStore } from "@/store/modules/tagsView";

const tagsViewStore = useTagsViewStore();
</script>

<template>
  <section class="app-main">
    <router-view>
      <template #default="{ Component, route }">
        <transition name="fade-slide" mode="out-in">
          <keep-alive :include="tagsViewStore.cachedViews">
            <div :key="route.fullPath"><component :is="Component" /></div>
          </keep-alive>
        </transition>
      </template>
    </router-view>
  </section>
</template>

<style lang="scss" scoped>
.app-main {
  position: relative;
  width: 100%;

  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  overflow: hidden;
  background-color: var(--el-bg-color-page);
}

.fixed-header + .app-main {
  padding-top: 34px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    min-height: 100vh;
    padding-top: 84px;
  }
}

.isMix {
  .app-main {
    height: calc(100vh - 50px);
    overflow-y: auto;
  }

  .hasTagsView {
    .app-main {
      /* 84 = navbar + tags-view = 50 + 34 */
      height: calc(100vh - 84px);
    }

    .fixed-header + .app-main {
      min-height: calc(100vh - 50px);
      padding-top: 34px;
    }
  }
}

.isTop {
  .hasTagsView {
    .fixed-header + .app-main {
      padding-top: 34px;
    }
  }
}
</style>
