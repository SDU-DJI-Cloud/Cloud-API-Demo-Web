<template>
  <div class="width-100 flex-row flex-justify-between flex-align-center" style="height: 60px;">
    <div class="height-100">
      <a-avatar :size="40" shape="square" :src="cloudapi" />
      <span class="ml10 fontBold">{{ workspaceName }}</span> <!-- 工作空间名称 -->
    </div>

    <a-space class="fz16 height-100" size="large">
        <router-link
        v-for="item in options"
        :key="item.key"
        :to="item.path"
        :class="{
            'menu-item': true,
        }">
          <span @click="selectedRoute(item.path)" :style="selected === item.path ? 'color: #2d8cf0;' : 'color: white'">{{ item.label }}</span>
        </router-link>
    </a-space>

    <div class="height-100 fz16 flex-row flex-justify-between flex-align-center">
      <a-dropdown>
        <div class="height-100">
          <span class="fz20 mt20" style="border: 2px solid white; border-radius: 50%; display: inline-flex;"><UserOutlined /></span>
          <span class="ml10 mr10" style="float: right;">{{ username }}</span> <!-- 用户名 -->
        </div>
        <template #overlay>
          <a-menu theme="dark" class="flex-column flex-justify-between flex-align-center">
            <a-menu-item>
              <span class="mr10" style="font-size: 16px;"><ExportOutlined /></span>
              <span @click="logout">退出登录</span> <!-- 退出登录 -->
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { defineComponent, onMounted, ref } from 'vue'
import { getRoot } from '/@/root'
import { getPlatformInfo } from '/@/api/manage'
import { ELocalStorageKey, ERouterChineseName, ERouterName } from '/@/types'
import { UserOutlined, ExportOutlined } from '@ant-design/icons-vue'
import cloudapi from '/@/assets/icons/cloudapi.png'

const root = getRoot()

interface IOptions {
  key: number
  label: string
  path:
    | string
    | {
        path: string
        query?: any
      }
  icon: string
}
const username = ref(localStorage.getItem(ELocalStorageKey.Username)) // 获取用户名
const workspaceName = ref('') // 工作空间名称
const options = [
  { key: 0, label: ERouterChineseName.WORKSPACE, path: '/' + ERouterName.WORKSPACE }, // 工作空间
  { key: 1, label: ERouterChineseName.MEMBERS, path: '/' + ERouterName.MEMBERS }, // 成员管理
  { key: 2, label: ERouterChineseName.DEVICES, path: '/' + ERouterName.DEVICES }, // 设备管理
  { key: 3, label: ERouterChineseName.FIRMWARES, path: '/' + ERouterName.FIRMWARES }, // 固件管理
]

const selected = ref<string>(root.$route.path)

onMounted(() => {
  getPlatformInfo().then(res => {
    workspaceName.value = res.data.workspace_name // 获取工作空间名称
  })
})

function selectedRoute (path: string) {
  selected.value = path // 选择的路由
}

const logout = () => {
  localStorage.clear() // 清除本地存储
  root.$router.push(ERouterName.PROJECT) // 返回项目页面
}
</script>

<style lang="scss" scoped>
@import '/@/styles/index.scss';

.fontBold {
  font-weight: 500;
  font-size: 18px;
}

</style>
