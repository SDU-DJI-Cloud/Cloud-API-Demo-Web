<template>
  <div class="login flex-column flex-justify-center flex-align-center m0 b0">
    <a-image
      style="width: 17vw; height: 10vw; margin-bottom: 50px"
      :src="djiLogo"
    />
    <p class="logo fz35 pb50">山东大学无人机云平台</p>
    <a-form
      layout="inline"
      :model="formState"
      class="flex-row flex-justify-center flex-align-center"
    >
      <a-form-item>
        <a-input v-model:value="formState.username" placeholder="用户名">
          <template #prefix
            ><UserOutlined style="color: rgba(0, 0, 0, 0.25)"
          /></template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          v-model:value="formState.password"
          type="password"
          placeholder="密码"
        >
          <template #prefix
            ><LockOutlined style="color: rgba(0, 0, 0, 0.25)"
          /></template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button
          class="m0"
          type="primary"
          html-type="submit"
          :disabled="formState.user === '' || formState.password === ''"
          @click="onSubmit"
        >
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref, UnwrapRef } from 'vue'
import { CURRENT_CONFIG } from '/@/api/http/config'
import { login, LoginBody, refreshToken } from '/@/api/manage'
import apiPilot from '/@/api/pilot-bridge'
import { getRoot } from '/@/root'
import router from '/@/router'
import { EComponentName, ELocalStorageKey, ERouterName, EUserType } from '/@/types'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import djiLogo from '/@/assets/icons/dji_logo.png'

const root = getRoot()

const formState: UnwrapRef<LoginBody> = reactive({
  username: 'pilot',
  password: 'pilot123',
  flag: EUserType.Pilot,
})
const isVerified = ref<boolean>(false)
onMounted(async () => {
  verifyLicense()
  if (!isVerified.value) {
    return
  }

  apiPilot.setPlatformMessage('云API平台', '', '')

  const token = localStorage.getItem(ELocalStorageKey.Token)
  if (token) {
    await refreshToken({})
      .then(res => {
        apiPilot.setComponentParam(EComponentName.Api, {
          host: CURRENT_CONFIG.baseURL,
          token: res.data.access_token
        })
        const jsres = apiPilot.loadComponent(EComponentName.Api, apiPilot.getComponentParam(EComponentName.Api))
        if (!jsres) {
          message.error('加载API模块失败。')
          return
        }
        apiPilot.setToken(res.data.access_token)
        localStorage.setItem(ELocalStorageKey.Token, res.data.access_token)
        root.$router.push(ERouterName.PILOT_HOME)
      })
      .catch(err => {
        message.error(err)
      })
  }
})
const onSubmit = async (e: any) => {
  await login(formState)
    .then(res => {
      if (!isVerified.value) {
        message.error('请先验证许可证。')
        return
      }
      console.log('登录结果:', res)
      if (res.code === 0) {
        apiPilot.setComponentParam(EComponentName.Api, {
          host: CURRENT_CONFIG.baseURL,
          token: res.data.access_token
        })
        const jsres = apiPilot.loadComponent(
          EComponentName.Api,
          apiPilot.getComponentParam(EComponentName.Api)
        )
        console.log('加载API模块结果:', jsres)
        apiPilot.setToken(res.data.access_token)
        localStorage.setItem(ELocalStorageKey.Token, res.data.access_token)
        localStorage.setItem(ELocalStorageKey.WorkspaceId, res.data.workspace_id)
        localStorage.setItem(ELocalStorageKey.UserId, res.data.user_id)
        localStorage.setItem(ELocalStorageKey.Username, res.data.username)
        localStorage.setItem(ELocalStorageKey.Flag, EUserType.Pilot.toString())
        message.success('登录成功')
        root.$router.push(ERouterName.PILOT_HOME)
      }
    })
    .catch(err => {
      message.error(err)
    })
}

function verifyLicense () {
  isVerified.value = apiPilot.platformVerifyLicense(CURRENT_CONFIG.appId, CURRENT_CONFIG.appKey, CURRENT_CONFIG.appLicense) &&
    apiPilot.isPlatformVerifySuccess()
  if (isVerified.value) {
    message.success('许可证验证成功。')
  } else {
    message.error('许可证验证失败。请检查许可证是否正确，或重新申请。')
  }
}
</script>

<style lang="scss" scoped>
@import '/@/styles/index.scss';
.login {
  // background-color: $dark-highlight;
  height: 100vh;
}
.logo {
  color: $primary;
}
</style>
