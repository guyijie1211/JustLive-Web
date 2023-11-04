<template>
  <div id="player" class="artplayer-app" @dblclick="handleDBClick"></div>
</template>

<script>
import Hls from 'hls.js';
import flvjs from 'flv.js';
import Artplayer from 'artplayer';
import Global from "@/components/Global";
import {getHuyaInfo, getRealUrlMultiSource} from "@/api/liveList";
import Danmaku from 'danmaku';

export default {
  name: "ArtPlayerTest",
  props: ['platform','roomId','isLive','banActive',
    'banLevel','banContentList','checkedContentList',
    'danmuStyle','danmuSpeed','danmuArea','danmuNum'],
  data() {
    return {
      player: null,
      playUrl: '',
      ws: null,
      huyaAyyuid: '',
      eGameToken: '',
      hls: null,
      flv: null,
      danmaku: null,
      danmuShow: true,
      danmuNumStep: 0,
      rateSourceSelector: [],
      rateSelector: [],
      selectSource: '',
      selectRate:'',
      sourceAndRateMap: new Map()
    }
  },
  methods: {
    init(){
      let _this = this
      if (this.isLive){
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
               container: '.artplayer-app',
               autoplay: true, //自动播放
               isLive: true, //直播
               url: _this.playUrl,
               // url: "",
               type: _this.playUrl.indexOf("m3u8") > 0 ? 'customHls' : 'flv',
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
               // quality: this.quality, //不需要这个属性里了，清晰度切换现在手动实现
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
                   tooltip: '弹幕开关',
                   position: 'right',
                   html: '<i class="iconfont icon-danmukaiqi" style="font-size: 25px"></i>',
                   click: function () {
                     _this.danmuShow = !_this.danmuShow
                     if(_this.danmuShow) {
                       document.getElementsByClassName("iconfont icon-danmuguanbi")[0]
                           .setAttribute("class","iconfont icon-danmukaiqi");
                       _this.danmaku.show()
                     }else {
                       document.getElementsByClassName("iconfont icon-danmukaiqi")[0]
                           .setAttribute("class","iconfont icon-danmuguanbi");
                       _this.danmaku.hide()
                     }
                   },
                 },
                 {
                   name: 'rateSource',
                   position: 'right',
                   html: _this.selectSource,
                   style: {
                     marginRight: '5px',
                   },
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
                {
                  name: 'reload',
                  tooltip: '重新加载',
                  position: 'left',
                  html: '<i class="el-icon-refresh" style="font-size: 22px"></i>',
                  click: () => {
                    console.log('重新加载');
                    // 关闭之前的流
                    if(art.type === 'flv') {
                      art.flv.unload()
                    }
                    if(art.type === 'customHls') {
                      art.hls.stopLoad()
                    }
                    art.switchUrl(this.playUrl)
                  }
                }, 
               ],
             });
             art.on('resize', function (args) {
               _this.danmaku.resize();
             });

             this.danmaku = new Danmaku({
               container: document.getElementsByClassName('art-danmuku')[0],
               // media: document.getElementsByClassName('art-video')[0],
             });

             let speed = (this.danmuSpeed + 25)/100 * 200

             this.danmaku.speed = speed
             this.player = art
             if(this.platform == 'bilibili'){
               this.initBilibiliWs(art)
             }else if (this.platform == 'douyu') {
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
                    _this.emitDanmu(`${body.info[1]}`, `${body.info[2][1]}`);
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
              _this.emitDanmu(packet.body.txt, packet.body.nn);
            }
            break;
        }
      };
    },
    initHuyaWs(art){
      getHuyaInfo(this.roomId)
          .then(response => {
            let data = response.data.data
            console.log(data)
            console.log(data.luid)
            const ws = new WebSocket('wss://cdnws.api.huya.com/');
            let roomId = this.roomId
            let _this = this
            this.ws = ws
            ws.onopen = function () {
              let inRoomMsg = Global._bind_ws_info(data.luid);
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
                if (msg_obj?.type == "chat") {
                  if (_this.isBanned("999", msg_obj.content)) {
                    _this.emitDanmu(msg_obj.content, msg_obj.name);
                  }
                }
              }
            }
          })
    },
    initEgameWs(art){
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
    emitDanmu(text, from) {
      let _this = this;
      var someDanmakuAObj = {
        text: text, // Danmu text
        style: {
          fontSize: (this.danmuStyle.fontSize/100 * 40) + "px",
          color: this.danmuStyle.color,
          textShadow: this.danmuStyle.textShadow ? '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000' : '',
          opacity: this.danmuStyle.opacity/100,
          fontWeight: this.weightChange(this.danmuStyle.fontWeight),
        },
      };
      var newDanmu = {
        fromName: from,
        msg: text
      }
      _this.$emit("newDanmuSend", newDanmu)
      if (this.danmuNumStep > 0) {
        this.danmuNumStep --
        return
      } else {
        this.danmaku.emit(someDanmakuAObj)
        this.danmuNumStep = (100 - this.danmuNum)/10
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
    /**
     * 处理播放器的双击事件
     */
    handleDBClick() {
      this.player.fullscreenWeb = !this.player.fullscreenWeb;
    }
  },
  beforeDestroy() {
    if(this.player){
      this.player.destroy()
    }
    clearInterval(this.interval)
    if(this.ws){
      this.ws.close()
    }
    if (this.danmaku){
      this.danmaku.destroy();
    }
  },
  watch: {
    platform: function() {
      this.$nextTick(() => {
        this.init()
      });
    },
    //document.getElementsByClassName('art-danmuku')[0].style.height = "50%"
    danmuSpeed: function () {
      if (this.danmaku){
        let speed = (this.danmuSpeed + 20)/100 * 300
        this.danmaku.speed = speed
      }
    },
    danmuArea: function () {
      if (this.danmaku){
        this.danmaku.clear()
        document.getElementsByClassName('art-danmuku')[0].style.height = this.danmuArea + "%"
        this.danmaku.resize()
      }
    },
    danmuNum: function () {
      this.danmuNumStep = (100 - this.danmuNum)/10
    },
  },
}
</script>

<style scoped>
.artplayer-app{
  width: 100%;
  height: 100%;
  /*pointer-events: none;*/
  -moz-user-select: none;  /*火狐*/
  -webkit-user-select: none;  /*webkit浏览器*/
  -ms-user-select: none;  /*IE10*/
  -khtml-user-select: none;  /*早期浏览器*/
  user-select: none;
}
</style>

<style>
.art-video-player .art-poster, .art-video-player .art-video{
  pointer-events: none;
}
</style>
