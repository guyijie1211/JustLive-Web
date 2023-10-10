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
import {getRealUrlMultiSource} from "@/api/liveList";
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku'

export default {
  name: "ArtPlayerMobile",
  props: ['platform', 'roomId', 'isLive'],
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
      danmuStyle: {
        fontSize: "6%",
        color: "#ffffff",
        textShadow: true,
        opacity: 100,
        fontWeight: 50,
      },
      danmuSpeed: 10,
      danmuNum: 100,
      danmuArea: [10, '25%'],
      rateSourceSelector: [],
      rateSelector: [],
      selectSource: '',
      selectRate:'',
      sourceAndRateMap: new Map()
    }
  },
  methods: {
    init() {
      let _this = this
      if (localStorage.getItem("danmuStyle")) {
        this.danmuStyle = JSON.parse(localStorage.getItem("danmuStyle"))
      }
      if (localStorage.getItem("danmuSpeed")) {
        this.danmuSpeed = Number(localStorage.getItem("danmuSpeed"))
      }
      if (localStorage.getItem("danmuArea")) {
        this.danmuArea = localStorage.getItem("danmuArea").split(",")
      }
      if (this.isLive) {
        getRealUrlMultiSource(this.platform, this.roomId)
            .then(response => {
              let data = response.data.data
              let qualityMap = new Map()
              // eslint-disable-next-line no-prototype-builtins
              if (data.hasOwnProperty("token")) {
                this.eGameToken = data.token
              }
              // eslint-disable-next-line no-prototype-builtins
              if (data.hasOwnProperty("ayyuid")) {
                this.huyaAyyuid = data.ayyuid
              }
              for (let key in data) {
                // eslint-disable-next-line no-prototype-builtins
                if (data.hasOwnProperty(key)) {
                  qualityMap.set(key, data[key])
                }
              }

              let lastSelectSource = localStorage.getItem(`urlSource${this.platform}`)
              let lastSelectRate = localStorage.getItem(`urlRate${this.platform}`)
              console.log(`urlSource: ${lastSelectSource}, urlRate: ${lastSelectRate}`);

              // 设置当前选中的线路(需要根据上次选中的线路判断)
              if (lastSelectSource != null && qualityMap.has(lastSelectSource)) {
                _this.selectSource = lastSelectSource
              } else {
                _this.selectSource = qualityMap.keys().next().value
              }

              // 设置当前选中的清晰度(需要根据上次选中的判断)
              let lastSelectQualityList = qualityMap.get(_this.selectSource)
              if (lastSelectRate != null) {
                lastSelectQualityList.forEach(quality => {
                  if (quality.qualityName === lastSelectRate) {
                    _this.selectRate = lastSelectRate
                  }
                })
              }
              if (_this.selectRate === '') {
                _this.selectRate = lastSelectQualityList[0].qualityName
              }

              qualityMap.forEach(function(qualityList, sourceName, map) {
                // 渲染线路
                let isSelectSource = _this.selectSource === sourceName
                _this.rateSourceSelector.push({
                  default: isSelectSource,
                  html: sourceName,
                })

                // 处理清晰度
                qualityList.forEach(quality => {
                  let rateName = quality.qualityName
                  if (rateName.includes('PRO')) {
                    return
                  }
                  let isSelectRate = _this.selectRate === rateName
                  _this.sourceAndRateMap.set(`${sourceName}===${rateName}`, quality.playUrl)
                  // 渲染清晰度
                  if (isSelectSource) {
                    _this.rateSelector.push({
                      default: isSelectRate,
                      html: rateName,
                    })
                    if (isSelectRate) {
                      _this.playUrl = quality.playUrl
                    }
                  }
                })
              });

              var art = new Artplayer({
                container: this.$refs.artRef,
                autoplay: true, //自动播放
                isLive: true, //直播
                url: _this.playUrl,
                // url: "",
                type: _this.playUrl.indexOf("m3u8") > 0 ? 'customHls' : 'flv',
                autoSize: true, //固定视频比例
                fullscreen: true, //全屏按钮
                fullscreenWeb: true,
                setting: true, // 设置按钮
                volume: 1, //默认音量
                mutex: false, //假如页面里同时存在多个播放器，是否只能让一个播放器播放
                lang: 'zh-cn',  //
                airplay: true,
                customType: {
                  customHls: function (video, url, art) {
                    console.log("播放customHls")
                    if (Hls.isSupported()) {
                      console.log("customHls==isSupported")
                      const hls = new Hls();
                      hls.loadSource(url);
                      hls.attachMedia(video);
                      // optional
                      art.hls = hls;
                      art.once('destroy', () => hls.destroy());
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                      console.log("application/vnd.apple.mpegurl")
                      video.src = url;
                    } else {
                      console.log("Unsupported playback format: m3u8")
                      art.notice.show = 'Unsupported playback format: m3u8';
                    }
                  },
                  flv: function (video, url, art) {
                    if (flvjs.isSupported()) {
                      console.log("播放flv")
                      const flv = flvjs.createPlayer({ type: 'flv', url });
                      flv.attachMediaElement(video);
                      flv.load();
                      // optional
                      art.flv = flv;
                      art.on('destroy', () => {
                        console.log("destroyFlv")
                        flv.destroy()
                      })
                    } else {
                      art.notice.show = 'Unsupported playback format: flv';
                    }
                  }
                },
                controls: [
                  {
                    name: 'rateSource',
                    position: 'right',
                    html: _this.selectSource,
                    selector: _this.rateSourceSelector,
                    onSelect: function (item, $dom) {
                      _this.changPlayUrl(item.html, _this.selectRate, _this.player)
                      return item.html;
                    },
                  },
                  {
                    name: 'rate',
                    position: 'right',
                    html: _this.selectRate,
                    selector: _this.rateSelector,
                    onSelect: function (item, $dom) {
                      _this.changPlayUrl(_this.selectSource, item.html, _this.player)
                      return item.html;
                    },
                  },
                ],
                plugins: [
                  artplayerPluginDanmuku({
                    danmuku: [],
                    maxWidth: 100, // 输入框最大宽度，范围在[0 ~ Infinity]，填 0 则为 100% 宽度
                    mount: document.querySelector('#artplayer-danmuku'),
                    speed: _this.danmuSpeed, // 弹幕持续时间，单位秒，范围在[1 ~ 10]
                    opacity: _this.danmuStyle.opacity, // 弹幕透明度，范围在[0 ~ 1]
                    fontSize: _this.danmuStyle.fontSize, // 字体大小，支持数字和百分比
                    margin: _this.danmuArea, // 弹幕上下边距，支持数字和百分比
                  })
                ]
              });
              this.player = art
              // 弹幕配置变化监听
              art.on('artplayerPluginDanmuku:config', (option) => {
                console.info('配置变化', option);
                this.danmuStyle.fontSize = option.fontSize;
                this.danmuStyle.opacity = option.opacity;
                this.danmuSpeed = option.speed;
                this.danmuArea = option.margin;
                localStorage.setItem('danmuStyle', JSON.stringify(this.danmuStyle))
                localStorage.setItem('danmuSpeed', this.danmuSpeed)
                localStorage.setItem('danmuArea', this.danmuArea)
              });
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
            art.plugins.artplayerPluginDanmuku.emit({
              text: packet.body.txt, // 弹幕文本
              color: '#fff', // 弹幕局部颜色
              border: false, // 是否显示描边
              mode: 0, // 弹幕模式: 0表示滚动, 1静止
            });
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
            art.plugins.artplayerPluginDanmuku.emit({
              text: msg_obj.content, // 弹幕文本
              color: '#fff', // 弹幕局部颜色
              border: false, // 是否显示描边
              mode: 0, // 弹幕模式: 0表示滚动, 1静止
            });
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
    changPlayUrl(source, rate, art) {
      let playUrl = this.sourceAndRateMap.get(`${source}===${rate}`)
      localStorage.setItem(`urlSource${this.platform}`, source)
      localStorage.setItem(`urlRate${this.platform}`, rate)
      console.info(`切换直播源:${source}===${rate}`);
      // 关闭之前的流
      switch (art.type) {
        case 'flv':
          art.flv.unload()
          break;
        case 'customHls':
          art.hls.stopLoad()
          break;
        default:
          break;
      }
      if (playUrl.includes('.flv')) {
        art.type = 'flv'
      } else {
        art.type = 'customHls'
      }
      console.log(playUrl)
      art.switchUrl(playUrl)
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
