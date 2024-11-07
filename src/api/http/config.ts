export const CURRENT_CONFIG = {
  // license
  appId: '153316', // You need to go to the development website to apply.
  appKey: 'e4f5e20686424d405d869da4f95a31c', // You need to go to the development website to apply.
  appLicense:
    'YIsFkX9a82ys4c5e3N4kAeusfhfBqZjB2yrNhvmRGgiee9ROai6yaLPn2pE5uObPh9v8UcY/Db2WnSayUzfvhTvuD5/UPY5H3Hjpw37XBKoBDAqr5dxw5y7Mah4iUElgPlrPHyK+yJ/5CAG/c8gfmoXy8YhcI55gMsUE0K4xsE0=', // You need to go to the development website to apply.

  // http
  baseURL: 'http://192.168.1.111:6789/', // This url must end with "/". Example: 'http://192.168.1.1:6789/'
  websocketURL: 'ws://192.168.1.111:6789/api/v1/ws', // Example: 'ws://192.168.1.1:6789/api/v1/ws'

  // livestreaming
  // RTMP  Note: This IP is the address of the streaming server. If you want to see livestream on web page, you need to convert the RTMP stream to WebRTC stream.
  rtmpURL: 'Please enter the rtmp access address.', // Example: 'rtmp://192.168.1.1/live/'
  // GB28181 Note:If you don't know what these parameters mean, you can go to Pilot2 and select the GB28181 page in the cloud platform. Where the parameters same as these parameters.
  gbServerIp: 'Please enter the server ip.',
  gbServerPort: 'Please enter the server port.',
  gbServerId: 'Please enter the server id.',
  gbAgentId: 'Please enter the agent id',
  gbPassword: 'Please enter the agent password',
  gbAgentPort: 'Please enter the local port.',
  gbAgentChannel: 'Please enter the channel.',
  // RTSP
  rtspUserName: 'Please enter the username.',
  rtspPassword: 'Please enter the password.',
  rtspPort: '8554',
  // Agora
  agoraAPPID: '9993a6a60d95436db6e78d55a3c81879',
  agoraToken:
    '007eJxTYHBL27nvt1tBiYZdzj/3ox+5GmbOsJ5x5A+DM6edlureVjYFBktLS+NEs0QzgxRLUxNjs5Qks1RzixRT00TjZAtDC3PLdcU66Q2BjAyiE/6wMDJAIIjPzFCcUsrAAADPIx1m',
  agoraChannel: 'sdu',

  // map
  // You can apply on the AMap website.
  amapKey: 'a42dc05ecb98e9db9da2c66b0b33b06c',
}
