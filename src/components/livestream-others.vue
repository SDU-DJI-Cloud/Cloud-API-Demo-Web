<template>
  <div class="flex-column flex-justify-start flex-align-center">
    <video
      :style="{ width: '720px', height: '480px' }"
      id="video-webrtc"
      ref="videowebrtc"
      controls
      autoplay
      class="mt20"
    ></video>
    <p class="fz24">直播源选择</p>

    <div class="flex-row flex-justify-center flex-align-center mt10">
      <template v-if="liveState && isDockLive">
        <span class="mr10">镜头:</span>
        <a-radio-group v-model:value="lensSelected" button-style="solid">
          <a-radio-button v-for="lens in lensList" :key="lens" :value="lens">{{lens}}</a-radio-button>
        </a-radio-group>
      </template>
      <template v-else>
      <a-select
        style="width: 150px"
        placeholder="选择直播类型"
        @select="onLiveTypeSelect"
        v-model:value="livetypeSelected"
      >
        <a-select-option
          v-for="item in liveTypeList"
          :key="item.label"
          :value="item.value"
        >
          {{ item.label }}
        </a-select-option>
      </a-select>
      <a-select
        class="ml10"
        style="width:150px"
        placeholder="选择无人机"
        v-model:value="droneSelected"
      >
        <a-select-option
          v-for="item in droneList"
          :key="item.value"
          :value="item.value"
          @click="onDroneSelect(item)"
          >{{ item.label }}</a-select-option
        >
      </a-select>
      <a-select
        class="ml10"
        style="width:150px"
        placeholder="选择相机"
        v-model:value="cameraSelected"
      >
        <a-select-option
          v-for="item in cameraList"
          :key="item.value"
          :value="item.value"
          @click="onCameraSelect(item)"
          >{{ item.label }}</a-select-option
        >
      </a-select>
      </template>
      <a-select
        class="ml10"
        style="width:150px"
        placeholder="选择清晰度"
        @select="onClaritySelect"
        v-model:value="claritySelected"
      >
        <a-select-option
          v-for="item in clarityList"
          :key="item.value"
          :value="item.value"
          >{{ item.label }}</a-select-option
        >
      </a-select>
    </div>
    <div class="mt20">
      <p class="fz10" v-if="livetypeSelected == 2">
        请使用 VLC 媒体播放器播放 RTSP 直播 !!!
      </p>
      <p class="fz10" v-if="livetypeSelected == 2">
        RTSP 参数:{{ rtspData }}
      </p>
    </div>
    <div class="mt10 flex-row flex-justify-center flex-align-center">
      <a-button v-if="liveState && isDockLive" type="primary" large @click="onSwitch">切换镜头</a-button>
      <a-button v-else type="primary" large @click="onStart">播放</a-button>
      <a-button class="ml20" type="primary" large @click="onStop"
        >停止</a-button
      >
      <a-button class="ml20" type="primary" large @click="onUpdateQuality"
        >更新清晰度</a-button
      >
      <a-button v-if="!liveState || !isDockLive" class="ml20" type="primary" large @click="onRefresh"
        >刷新直播能力</a-button
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { CURRENT_CONFIG as config } from '/@/api/http/config'
import { changeLivestreamLens, getLiveCapacity, setLivestreamQuality, startLivestream, stopLivestream } from '/@/api/manage'
import { getRoot } from '/@/root'
import jswebrtc from '/@/vendors/jswebrtc.min.js'
import srs from '/@/vendors/srs.sdk.js'

const root = getRoot()

interface SelectOption {
  value: any,
  label: string,
  more?: any
}

const liveTypeList: SelectOption[] = [
  {
    value: 1,
    label: 'RTMP'
  },
  {
    value: 2,
    label: 'RTSP'
  },
  {
    value: 3,
    label: 'GB28181'
  },
  {
    value: 4,
    label: 'WEBRTC'
  }
]
const clarityList: SelectOption[] = [
  {
    value: 0,
    label: '自适应'
  },
  {
    value: 1,
    label: '流畅'
  },
  {
    value: 2,
    label: '标准'
  },
  {
    value: 3,
    label: '高清'
  },
  {
    value: 4,
    label: '超清'
  }
]

const videowebrtc = ref(null)
const livestreamSource = ref()
const droneList = ref()
const cameraList = ref()
const videoList = ref()
const droneSelected = ref()
const cameraSelected = ref()
const videoSelected = ref()
const claritySelected = ref()
const videoId = ref()
const liveState = ref<boolean>(false)
const livetypeSelected = ref()
const rtspData = ref()
const lensList = ref<string[]>([])
const lensSelected = ref<String>()
const isDockLive = ref(false)
const nonSwitchable = 'normal'
let webrtc: any = null

const onRefresh = async () => {
  droneList.value = []
  cameraList.value = []
  videoList.value = []
  droneSelected.value = null
  cameraSelected.value = null
  videoSelected.value = null
  await getLiveCapacity({})
    .then(res => {
      console.log(res)
      if (res.code === 0) {
        if (res.data === null) {
          console.warn('警告: 获取直播能力为空!!!')
          return
        }
        const resData: Array<[]> = res.data
        console.log('live_capacity:', resData)
        livestreamSource.value = resData

        const temp: Array<SelectOption> = []
        if (livestreamSource.value) {
          livestreamSource.value.forEach((ele: any) => {
            temp.push({ label: ele.name + '-' + ele.sn, value: ele.sn, more: ele.cameras_list })
          })
          droneList.value = temp
        }
      }
    })
    .catch(error => {
      message.error(error)
      console.error(error)
    })
}

onMounted(() => {
  onRefresh()
})
const onStart = async () => {
  console.log(
    '参数:',
    livetypeSelected.value,
    droneSelected.value,
    cameraSelected.value,
    videoSelected.value,
    claritySelected.value
  )
  const timestamp = new Date().getTime().toString()
  if (
    livetypeSelected.value == null ||
    droneSelected.value == null ||
    cameraSelected.value == null ||
    claritySelected.value == null
  ) {
    message.warn('警告: 未选择直播参数!!!')
    return
  }
  videoId.value =
    droneSelected.value + '/' + cameraSelected.value + '/' + (videoSelected.value || nonSwitchable + '-0')

  let liveURL = ''
  switch (livetypeSelected.value) {
    case 1: {
      // RTMP
      liveURL = config.rtmpURL + timestamp
      break
    }
    case 2: {
      // RTSP
      liveURL = `userName=${config.rtspUserName}&password=${config.rtspPassword}&port=${config.rtspPort}`
      break
    }
    case 3: {
      liveURL = `serverIP=${config.gbServerIp}&serverPort=${config.gbServerPort}&serverID=${config.gbServerId}&agentID=${config.gbAgentId}&agentPassword=${config.gbPassword}&localPort=${config.gbAgentPort}&channel=${config.gbAgentChannel}`
      break
    }
    case 4: {
      break
    }
    default:
      console.warn('警告: 直播类型不正确!!!')
      break
  }
  await startLivestream({
    url: liveURL,
    video_id: videoId.value,
    url_type: livetypeSelected.value,
    video_quality: claritySelected.value
  })
    .then(res => {
      if (res.code !== 0) {
        return
      }
      if (livetypeSelected.value === 3) {
        const url = res.data.url
        const videoElement = videowebrtc.value
        message.loading({
          content: '加载中...',
          duration: 4,
          onClose () {
            const player = new jswebrtc.Player(url, {
              video: videoElement,
              autoplay: true,
              onPlay: (obj: any) => {
                console.log('开始播放直播')
              }
            })
          }
        })
      } else if (livetypeSelected.value === 2) {
        console.log(res)
        rtspData.value = 'url:' + res.data.url
      } else if (livetypeSelected.value === 1) {
        const url = res.data.url
        const videoElement = videowebrtc.value
        console.log('开始直播:', url)
        console.log(videoElement)
        const player = new jswebrtc.Player(url, {
          video: videoElement,
          autoplay: true,
          onPlay: (obj: any) => {
            console.log('开始播放直播')
          }
        })
      } else if (livetypeSelected.value === 4) {
        const videoElement = videowebrtc.value as unknown as HTMLMediaElement
        videoElement.muted = true
        playWebrtc(videoElement, res.data.url)
      }
      liveState.value = true
    })
    .catch(err => {
      console.error(err)
    })
}
const onStop = () => {
  videoId.value =
    droneSelected.value + '/' + cameraSelected.value + '/' + (videoSelected.value || nonSwitchable + '-0')

  stopLivestream({
    video_id: videoId.value
  }).then(res => {
    if (res.code === 0) {
      message.success(res.message)
      liveState.value = false
      lensSelected.value = undefined
      console.log('停止播放直播')
    }
  })
}

const onUpdateQuality = () => {
  if (!liveState.value) {
    message.info('请先开启直播。')
    return
  }
  setLivestreamQuality({
    video_id: videoId.value,
    video_quality: claritySelected.value
  }).then(res => {
    if (res.code === 0) {
      message.success('已将清晰度设置为 ' + clarityList[claritySelected.value].label)
    }
  })
}

const onLiveTypeSelect = (val: any) => {
  livetypeSelected.value = val
}
const onDroneSelect = (val: SelectOption) => {
  droneSelected.value = val.value
  const temp: Array<SelectOption> = []
  cameraList.value = []
  cameraSelected.value = undefined
  videoSelected.value = undefined
  videoList.value = []
  lensList.value = []
  if (!val.more) {
    return
  }
  val.more.forEach((ele: any) => {
    temp.push({ label: ele.name, value: ele.index, more: ele.videos_list })
  })
  cameraList.value = temp
}
const onCameraSelect = (val: SelectOption) => {
  cameraSelected.value = val.value
  const result: Array<SelectOption> = []
  videoSelected.value = undefined
  videoList.value = []
  lensList.value = []
  if (!val.more) {
    return
  }

  val.more.forEach((ele: any) => {
    result.push({ label: ele.type, value: ele.index, more: ele.switch_video_types })
  })
  videoList.value = result
  if (videoList.value.length === 0) {
    return
  }
  const firstVideo: SelectOption = videoList.value[0]
  videoSelected.value = firstVideo.value
  lensList.value = firstVideo.more
  lensSelected.value = firstVideo.label
  isDockLive.value = lensList.value?.length > 0
}
const onVideoSelect = (val: SelectOption) => {
  videoSelected.value = val.value
  lensList.value = val.more
  lensSelected.value = val.label
}
const onClaritySelect = (val: any) => {
  claritySelected.value = val
}
const onSwitch = () => {
  if (lensSelected.value === undefined || lensSelected.value === nonSwitchable) {
    message.info(nonSwitchable + ' 镜头不可切换，请选择可切换的镜头。', 8)
    return
  }
  changeLivestreamLens({
    video_id: videoId.value,
    video_type: lensSelected.value
  }).then(res => {
    if (res.code === 0) {
      message.success('成功切换直播相机。')
    }
  })
}
const playWebrtc = (videoElement: HTMLMediaElement, url: string) => {
  if (webrtc) {
    webrtc.close()
  }
  webrtc = new srs.SrsRtcWhipWhepAsync()
  videoElement.srcObject = webrtc.stream
  webrtc.play(url).then(function (session: any) {
    console.info(session)
  }).catch(function (reason: any) {
    webrtc.close()
    console.error(reason)
  })
}
</script>

<style lang="scss" scoped>
@import '/@/styles/index.scss';
</style>
