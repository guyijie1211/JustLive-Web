<template>
  <div id="player" ref="artRef" className="artplayer-app">
    <div id="artplayer-danmuku"></div>
  </div>
</template>

<script>
import Hls from 'hls.js';
import flvjs from 'flv.js';
import Artplayer from 'artplayer';
import Global from "@/components/Global";
import {getRealUrl} from "@/api/liveList";
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku'

export default {
  name: "ArtPlayerMobile",
  props: ['platform', 'roomId', 'isLive', ],
  data() {
    return {
      player: null,
      quality: [],
      ws: null,
      huyaAyyuid: '',
      eGameToken: '',
      videoType: null,
      hls: null,
      flv: null,
      danmuShow: true,
      danmuNumStep: 0,
    }
  },
  methods: {
    init() {
      let _this = this
      if (this.isLive) {
        getRealUrl(this.platform, this.roomId)
            .then(response => {
              let data = response.data.data
              let qualityTemp = []
              // eslint-disable-next-line no-prototype-builtins
              if (data.hasOwnProperty("token")) {
                this.eGameToken = data.token
              }
              // eslint-disable-next-line no-prototype-builtins
              if (data.hasOwnProperty("ayyuid")) {
                this.huyaAyyuid = data.ayyuid
              }
              // eslint-disable-next-line no-prototype-builtins
              if (data.hasOwnProperty("FD")) {
                let FD = {
                  html: "流畅",
                  url: data.FD,
                }
                qualityTemp.push(FD)
              }
              // eslint-disable-next-line no-prototype-builtins
              if (data.hasOwnProperty("LD")) {
                let LD = {
                  html: "清晰",
                  url: data.LD,
                }
                qualityTemp.push(LD)
              }
              // eslint-disable-next-line no-prototype-builtins
              if (data.hasOwnProperty("SD")) {
                let SD = {
                  html: "高清",
                  url: data.SD,
                }
                qualityTemp.push(SD)
              }
              // eslint-disable-next-line no-prototype-builtins
              if (data.hasOwnProperty("HD")) {
                let HD = {
                  html: "超清",
                  url: data.HD,
                }
                qualityTemp.push(HD)
              }
              // eslint-disable-next-line no-prototype-builtins
              if (data.hasOwnProperty("OD")) {
                let OD = {
                  default: true,
                  html: "原画",
                  url: data.OD,
                }
                qualityTemp.push(OD)
              }
              this.quality = qualityTemp
              _this.videoType = this.quality[this.quality.length - 1].url.indexOf("m3u8") > 0 ? 'customHls' : 'flv';
              var art = new Artplayer({
                container: this.$refs.artRef,
                autoplay: true, //自动播放
                isLive: true, //直播
                url: this.quality[this.quality.length - 1].url,
                // url: "",
                type: this.videoType,
                autoSize: true, //固定视频比例
                fullscreen: true, //全屏按钮
                setting: true, // 设置按钮
                volume: 1, //默认音量
                mutex: false, //假如页面里同时存在多个播放器，是否只能让一个播放器播放
                lang: 'zh-cn',  //
                quality: this.quality,
                airplay: true,
                customType: {
                  customHls: function playM3u8(video, url, art) {
                    if (Hls.isSupported()) {
                      const hls = new Hls();
                      hls.loadSource(url);
                      hls.attachMedia(video);
                      // optional
                      art.hls = hls;
                      art.once('url', () => hls.destroy());
                      art.once('destroy', () => hls.destroy());
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                      video.src = url;
                    } else {
                      art.notice.show = 'Unsupported playback format: m3u8';
                    }
                  },
                  flv: function playFlv(video, url, art) {
                    if (flvjs.isSupported()) {
                      const flv = flvjs.createPlayer({ type: 'flv', url });
                      flv.attachMediaElement(video);
                      flv.load();
                      // optional
                      art.flv = flv;
                      art.once('url', () => flv.destroy());
                      art.once('destroy', () => flv.destroy());
                    } else {
                      art.notice.show = 'Unsupported playback format: flv';
                    }
                  }
                },
                plugins: [
                  artplayerPluginDanmuku({
                    danmuku: [],
                    maxWidth: 100, // 输入框最大宽度，范围在[0 ~ Infinity]，填 0 则为 100% 宽度
                    mount: document.querySelector('#artplayer-danmuku'),
                  })
                ]
              });

              art.on('selector', (item) => {
                console.log("切换清晰度")
                console.log(item)
                // flv.destroy()
              });

              this.player = art
              if (this.platform == 'bilibili') {
                this.initBilibiliWs(art)
              } else if (this.platform == 'douyu') {
                this.initDouyuWs(art)
              } else if (this.platform == 'huya') {
                this.initHuyaWs(art)
              } else {
                _this.$emit("notSupport")
              }
            })
      }
    },
    initBilibiliWs(art) {
      const ws = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub');
      this.ws = ws
      let _this = this
      ws.onopen = function () {
        let sendInfo = Global.encode(JSON.stringify({
          roomid: Number(_this.roomId)
        }), 7)
        ws.send(sendInfo);
      };
      this.interval = setInterval(function () {
        ws.send(Global.encode('', 2));
      }, 30000);
      ws.onmessage = async function (msgEvent) {
        const packet = await Global.decode(msgEvent.data);
        switch (packet.op) {
          case 8:
            console.log('获取直播间弹幕成功');
            break;
          case 5:
            packet.body.forEach((body) => {
              switch (body.cmd) {
                case 'DANMU_MSG':
                  _this.emitDanmu(`${body.info[1]}`, `${body.info[2][1]}`);
                  art.plugins.artplayerPluginDanmuku.emit({
                    text: `${body.info[1]}`, // 弹幕文本
                    color: '#fff', // 弹幕局部颜色
                    border: false, // 是否显示描边
                    mode: 0, // 弹幕模式: 0表示滚动, 1静止
                  });
                  break;
              }
            })
            break;
        }
      };
    },
    initDouyuWs(art) {
      const ws = new WebSocket('wss://danmuproxy.douyu.com:8503/');
      let roomId = this.roomId
      let _this = this
      this.ws = ws
      ws.onopen = function () {
        let loginMsg = Global.douyuEncode("type@=loginreq/roomid@=" + roomId + "/")
        let joinGroupMsg = Global.douyuEncode("type@=joingroup/rid@=" + roomId + "/gid@=1/")
        let heartBeatMsg = Global.douyuEncode("type@=mrkl/")
        ws.send(heartBeatMsg);
        ws.send(loginMsg);
        ws.send(joinGroupMsg);
      };
      this.interval = setInterval(function () {
        let heartBeatMsg = Global.douyuEncode("type@=mrkl/")
        ws.send(heartBeatMsg);
      }, 45000);
      ws.onmessage = async function (msg) {
        const packet = await Global.douyuDecode(msg.data);
        switch (packet.body.type) {
          case "loginres":
            console.log('获取直播间弹幕成功');
            break;
          case "chatmsg":
            _this.emitDanmu(packet.body.txt, packet.body.nn);
            break;
        }
      };
    },
    initHuyaWs(art) {
      const ws = new WebSocket('wss://cdnws.api.huya.com/');
      let roomId = this.roomId
      let _this = this
      this.ws = ws
      ws.onopen = function () {
        let inRoomMsg = Global._bind_ws_info(_this.huyaAyyuid);
        let loginMsg = Global.huyaSendPingReq();
        ws.send(inRoomMsg);
        ws.send(loginMsg);
      };
      this.interval = setInterval(function () {
        let heartBeatMsg = Global.huyaSendPingReq()
        ws.send(heartBeatMsg);
      }, 30 * 1000);

      ws.onmessage = async function (msg) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(msg.data)
        reader.onload = function () {
          let msg_obj = Global._on_mes(this.result)
          if (msg_obj.type == "chat") {
            _this.emitDanmu(msg_obj.content, msg_obj.name);
          }
        }
      }
    },
    emitDanmu(text, from) {
      let _this = this;
      var newDanmu = {
        fromName: from,
        msg: text
      }
      _this.$emit("newDanmuSend", newDanmu)
    },
    weightChange(value) {
      switch (value) {
        case 0:
          return "lighter"
        case 50:
          return "normal"
        case 100:
          return "bolder"
      }
    },
  },
  beforeDestroy() {
    if (this.player) {
      this.player.destroy()
    }
    clearInterval(this.interval)
    if (this.ws) {
      this.ws.close()
    }
  },
  watch: {
    platform: function () {
      this.$nextTick(() => {
        this.init()
      });
    }
  },
}
</script>

<style scoped>
.artplayer-app {
  width: 100%;
  height: 100%;
  /*pointer-events: none;*/
}
</style>

<style>
.art-video-player .art-poster, .art-video-player .art-video {
  pointer-events: none;
}
</style>
