<template>
  <div id="player" class="artplayer-app"></div>
</template>

<script>
import Hls from 'hls.js';
import flvjs from 'flv.js';
import Artplayer from 'artplayer';
import Global from "@/components/Global";
import { getRealUrl } from "@/api/liveList";
import Danmaku from 'danmaku';
import { douyuColorList } from '../../assets/js/colorList';
import { DecToHex } from '../../assets/js/colorConverter'

export default {
  name: "ArtPlayerTest",
  props: ['platform', 'roomId', 'isLive', 'banActive',
    'banLevel', 'banContentList', 'checkedContentList',
    'danmuStyle', 'danmuSpeed', 'danmuArea', 'danmuNum'],
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
      danmaku: null,
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
              container: '.artplayer-app',
              autoplay: true, //自动播放
              isLive: true, //直播
              url: this.quality[this.quality.length - 1].url,
              // url: "",
              type: this.videoType,
              autoSize: true, //固定视频比例
              pip: true,  //画中画
              fullscreen: true, //全屏按钮
              aspectRatio: true,  // 长宽比
              setting: true, // 设置按钮
              fullscreenWeb: true,  //网页全屏按钮
              volume: 1, //默认音量
              flip: true, //翻转
              screenshot: true,//截图
              mutex: false, //假如页面里同时存在多个播放器，是否只能让一个播放器播放
              lang: 'zh-cn',  //
              quality: this.quality,
              airplay: true,
              customType: {
                // customHls: function (video, url) {
                //   const hls = new Hls();
                //   hls.loadSource(url);
                //   hls.attachMedia(video);
                //   _this.hls = hls
                // },
                // flv: function (video, url) {
                //   const flvPlayer = flvjs.createPlayer({
                //     type: 'flv',
                //     url: url,
                //   });
                //   flvPlayer.attachMediaElement(video);
                //   flvPlayer.load();
                //   _this.flv = flvPlayer
                // },
                customHls: function (video, url, art) {
                  console.log("播放customHls")
                  if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    // optional
                    art.hls = hls;
                    art.once('url', () => hls.destroy());
                    art.once('destroy', () => hls.destroy());
                    art.once('switch', () => hls.destroy());
                  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                  } else {
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
                    art.on('selector', (item) => {
                      console.log("切换清晰度")
                      console.log(item)
                      // flv.destroy()
                    });
                    art.once('destroy', () => flv.destroy());
                    console.log("destroyFlv")
                    // art.once('switch', () => flv.destroy());
                  } else {
                    art.notice.show = 'Unsupported playback format: flv';
                  }
                }
              },
              controls: [
                {
                  tooltip: '弹幕开关',
                  position: 'right',
                  html: '<i class="iconfont icon-danmukaiqi" style="font-size: 25px"></i>',
                  click: function () {
                    _this.danmuShow = !_this.danmuShow
                    if (_this.danmuShow) {
                      document.getElementsByClassName("iconfont icon-danmuguanbi")[0]
                        .setAttribute("class", "iconfont icon-danmukaiqi");
                      _this.danmaku.show()
                    } else {
                      document.getElementsByClassName("iconfont icon-danmukaiqi")[0]
                        .setAttribute("class", "iconfont icon-danmuguanbi");
                      _this.danmaku.hide()
                    }
                  },
                },
              ],
            });

            // if (_this.videoType == 'customHls') {
            //   art.on('destroy', function (args) {
            //     _this.hls.destroy();
            //   });
            //   art.on('switch', function (args) {
            //     _this.hls.destroy();
            //     art.play = true;
            //   });
            // } else if (_this.videoType == 'flv') {
            //   art.on('destroy', function (args) {
            //     _this.flv.destroy();
            //   });
            //   art.on('switch', function (args) {
            //     _this.flv.destroy();
            //     art.play = true;
            //   });
            // }
            art.on('selector', (item) => {
              console.log("切换清晰度")
              console.log(item)
              // flv.destroy()
            });
            art.on('resize', function (args) {
              _this.danmaku.resize();
            });

            this.danmaku = new Danmaku({
              container: document.getElementsByClassName('art-danmuku')[0],
              // media: document.getElementsByClassName('art-video')[0],
            });

            let speed = (this.danmuSpeed + 25) / 100 * 200

            this.danmaku.speed = speed
            this.player = art
            if (this.platform == 'bilibili') {
              this.initBilibiliWs(art)
            } else if (this.platform == 'douyu') {
              this.initDouyuWs(art)
            } else if (this.platform == 'huya') {
              this.initHuyaWs(art)
            } else if (this.platform == 'egame') {
              this.initEgameWs(art)
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
                  if (_this.isBanned(body.info[4][0], `${body.info[1]}`)) {
                    _this.emitDanmu(`${body.info[1]}`, `${body.info[2][1]}`);
                  }
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
            if (_this.isBanned(packet.body.level, packet.body.txt)) {
              _this.emitDanmu(packet.body.txt, packet.body.nn, packet.body.col);
            }
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
            if (_this.isBanned("999", msg_obj.content)) {
              _this.emitDanmu(msg_obj.content, msg_obj.name, msg_obj.color);
            }
          }
        }
      }
    },
    initEgameWs(art) {
      const ws = new WebSocket('wss://barragepush.egame.qq.com/sub');
      this.ws = ws
      let _this = this
      ws.onopen = function () {
        let sendInfo = Global.eGameEncode(_this.eGameToken);
        ws.send(sendInfo);
      };
      this.interval = setInterval(function () {
        ws.send(Global.eGameHeart());
      }, 30000);
      ws.onmessage = async function (msgEvent) {
        const packet = await Global.eGameDecode(msgEvent.data);
        let data = packet.body[0].bin_data
        for (let i = 0; i < data.length; i++) {
          let msgData = data[i]
          let type = msgData.type
          if (type == 0 || type == 3 || type == 9) {
            if (_this.isBanned(msgData.ext.lvnew, msgData.content)) {
              _this.emitDanmu(msgData.content, msgData.nick);
            }
          }
        }
      };
    },

    testDanmuBan(text) {
      for (let i = 0; i < this.checkedContentList.length; i++) {
        let banContent = this.checkedContentList[i];
        let reg = new RegExp(banContent);
        if (reg.test(text)) {
          return true;
        }
      }
      return false;
    },
    isReg(reg) {
      let isReg;
      try {
        isReg = eval(reg) instanceof RegExp;
      } catch (e) {
        isReg = false;
      }
      return isReg;
    },
    isBanned(level, danmuContent) {
      let _this = this;
      if (!_this.banActive || (Number(level) > Number(_this.banLevel) && !_this.testDanmuBan(danmuContent))) {
        return true;
      }
      return false;
    },
    emitDanmu(text, from, col) {
      let _this = this;
      let oColor
      if (!col || col == -1) {
        oColor = this.danmuStyle.color
      }
      if (col > 0 && col < 10) {
        oColor = douyuColorList[col]
      }
      if (col > 10) {
        oColor = '#' + DecToHex(col)
      }
      var someDanmakuAObj = {
        text: text, // Danmu text
        style: {
          fontSize: (this.danmuStyle.fontSize / 100 * 40) + "px",
          // color: this.danmuStyle.color,
          color: oColor,
          textShadow: this.danmuStyle.textShadow ? '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000' : '',
          opacity: this.danmuStyle.opacity / 100,
          fontWeight: this.weightChange(this.danmuStyle.fontWeight),
        },
      };
      var newDanmu = {
        fromName: from,
        msg: text,
        col: oColor
      }
      _this.$emit("newDanmuSend", newDanmu)
      if (this.danmuNumStep > 0) {
        this.danmuNumStep--
        return
      } else {
        this.danmaku.emit(someDanmakuAObj)
        this.danmuNumStep = (100 - this.danmuNum) / 10
      }
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
    if (this.danmaku) {
      this.danmaku.destroy();
    }
  },
  watch: {
    platform: function () {
      this.$nextTick(() => {
        this.init()
      });
    },
    //document.getElementsByClassName('art-danmuku')[0].style.height = "50%"
    danmuSpeed: function () {
      if (this.danmaku) {
        let speed = (this.danmuSpeed + 20) / 100 * 300
        this.danmaku.speed = speed
      }
    },
    danmuArea: function () {
      if (this.danmaku) {
        this.danmaku.clear()
        document.getElementsByClassName('art-danmuku')[0].style.height = this.danmuArea + "%"
        this.danmaku.resize()
      }
    },
    danmuNum: function () {
      this.danmuNumStep = (100 - this.danmuNum) / 10
    },
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
.art-video-player .art-poster,
.art-video-player .art-video {
  pointer-events: none;
}
</style>
