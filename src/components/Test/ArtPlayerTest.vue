<template>
  <div class="artplayer-app" ></div>
</template>

<script>
import Hls from 'hls.js';
import Artplayer from 'artplayer';
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';
import Global from "@/components/Global";
import {getRealUrl} from "@/api/liveList";

export default {
  name: "ArtPlayerTest",
  props: ['platform','roomId','isLive','banActive',
    'banLevel','banContentList','checkedContentList'],
  data() {
    return {
      player: null,
      quality: [],
      ws: null,
      huyaAyyuid: '',
      hls: null,
    }
  },
  methods: {
    init(){
      let _this = this
      if (this.isLive){
       getRealUrl(this.platform, this.roomId)
           .then(response => {
             let data = response.data.data
             let qualityTemp = []
             // eslint-disable-next-line no-prototype-builtins
             if (data.hasOwnProperty("ayyuid")) {
               this.huyaAyyuid = data.ayyuid
             }
             // eslint-disable-next-line no-prototype-builtins
             if (data.hasOwnProperty("FD")) {
               let FD = {
                 name: "流畅",
                 url: data.FD,
               }
               qualityTemp.push(FD)
             }
             // eslint-disable-next-line no-prototype-builtins
             if (data.hasOwnProperty("LD")) {
               let LD = {
                 name: "清晰",
                 url: data.LD,
               }
               qualityTemp.push(LD)
             }
             // eslint-disable-next-line no-prototype-builtins
             if (data.hasOwnProperty("SD")) {
               let SD = {
                 name: "高清",
                 url: data.SD,
               }
               qualityTemp.push(SD)
             }
             // eslint-disable-next-line no-prototype-builtins
             if (data.hasOwnProperty("HD")) {
               let HD = {
                 name: "超清",
                 url: data.HD,
               }
               qualityTemp.push(HD)
             }
             // eslint-disable-next-line no-prototype-builtins
             if (data.hasOwnProperty("OD")) {
               let OD = {
                 default: true,
                 name: "原画",
                 url: data.OD,
               }
               qualityTemp.push(OD)
             }
             this.quality = qualityTemp
             var art = new Artplayer({
               container: '.artplayer-app',
               autoplay: true, //自动播放
               isLive: true, //直播
               url: this.quality[this.quality.length-1].url,
               type: 'customHls',
               autoSize: true, //固定视频比例
               autoMini: true, //自动小窗播放
               setting: true,   //设置按钮
               pip: true,  //画中画
               fullscreen: true, //全屏按钮
               aspectRatio: true,  //
               fullscreenWeb: true,  //网页全屏按钮
               backdrop: true,
               lang: 'zh-cn',  //
               quality: this.quality,
               customType: {
                 customHls: function (video, url) {
                   const hls = new Hls();
                   hls.loadSource(url);
                   hls.attachMedia(video);
                   _this.hls = hls
                 },
               },
               plugins: [
                 artplayerPluginDanmuku({
                   speed: 8, // Animation time
                   opacity: 0.8, // Opacity
                   color: '#fff', // Font color
                   size: 17, // Font size
                   maxlength: 50, // The maximum number of words in the danmu
                   margin: [10, 20], // Margin top and margin bottom
                   synchronousPlayback: false, // Synchronous playback speed
                 }),
               ],
               controls: [
                 {
                   position: 'right',
                   html: '弹幕开关',
                   click: function () {
                     if(art.plugins.artplayerPluginDanmuku.isHide) {
                       art.plugins.artplayerPluginDanmuku.show();
                     }else {
                       art.plugins.artplayerPluginDanmuku.hide();
                     }
                   },
                 },
               ],
             });
             art.on('destroy', function (args) {
               _this.hls.destroy();
             });
             art.on('switch', function (args) {
               _this.hls.destroy();
               art.play = true;
             });
             this.player = art
             if(this.platform == 'bilibili'){
               this.initBilibiliWs(art)
             }else if (this.platform == 'douyu') {
               this.initDouyuWs(art)
             } else if (this.platform == 'huya') {
               this.initHuyaWs(art)
             }else {
               _this.$emit("notSupport")
             }
           })
     }
    },
    initBilibiliWs(art){
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
                    var newDanmu = {
                      fromName: `${body.info[2][1]}`,
                      msg: `${body.info[1]}`
                    }
                    _this.$emit("newDanmuSend", newDanmu)
                    var someDanmakuAObj = {
                      text: `${body.info[1]}`, // Danmu text
                      color: '#fff', // Danmu color
                      size: 17, // Danmu size
                      border: false, // Danmu border
                      mode: 0, // Danmu mode: 0-scroll or 1-static
                    };
                    art.plugins.artplayerPluginDanmuku.emit(someDanmakuAObj);
                  }
                  break;
              }
            })
            break;
        }
      };
    },
    initDouyuWs(art){
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
              var someDanmakuAObj = {
                text: packet.body.txt, // Danmu text
                color: '#fff', // Danmu color
                size: 10, // Danmu size
                border: false, // Danmu border
                mode: 0, // Danmu mode: 0-scroll or 1-static
              };
              art.plugins.artplayerPluginDanmuku.emit(someDanmakuAObj);
              var newDanmu = {
                fromName: packet.body.nn,
                msg: packet.body.txt
              }
              _this.$emit("newDanmuSend", newDanmu)
            }
            break;
        }
      };
    },
    initHuyaWs(art){
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
              var someDanmakuAObj = {
                text: msg_obj.content, // Danmu text
                color: '#fff', // Danmu color
                size: 10, // Danmu size
                border: false, // Danmu border
                mode: 0, // Danmu mode: 0-scroll or 1-static
              };
              art.plugins.artplayerPluginDanmuku.emit(someDanmakuAObj);
              var newDanmu = {
                fromName: msg_obj.name,
                msg: msg_obj.content
              }
              _this.$emit("newDanmuSend", newDanmu)
            }
          }
        }
      }
    },
    testDanmuBan(text){
      for (let i=0; i<this.checkedContentList.length; i++) {
        let banContent = this.checkedContentList[i];
        let reg = new RegExp(banContent);
        if (reg.test(text)){
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
      if(!_this.banActive || (Number(level)>Number(_this.banLevel) && !_this.testDanmuBan(danmuContent))) {
        return true;
      }
      return false;
    },
  },
  mounted() {

  },
  beforeDestroy() {
    if(this.player){
      this.player.destroy()
    }
    clearInterval(this.interval)
    if(this.ws){
      this.ws.close()
    }
  },
  watch: {
    platform: function() {
      this.$nextTick(() => {
        this.init()
      });
    }
  },
}
</script>

<style scoped>
.artplayer-app{
  width: 100%;
  height: 100%;
  /*pointer-events: none;*/
}
</style>

<style>
.art-video-player .art-poster, .art-video-player .art-video{
  pointer-events: none;
}
</style>
