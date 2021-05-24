<template>
  <div id='my-player' class='abp'>
    <div id='my-comment-stage' class='container'></div>
  </div>
</template>

<script>
import "@/assets/css/style.css"
import Global from "@/components/Global";
import {CommentManager} from "@/assets/js/CommentCoreLibrary"

export default {
  name: "BilibiliDanmu",
  props: ['roomId'],
  data() {
    return {
      ws: null,
      interval: null,
      CM: null,
    };
  },
  methods: {
    init() {
      const ws = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub');
      this.ws = ws
      let _this = this
      // eslint-disable-next-line no-undef
      var CM = new CommentManager(document.getElementById('my-comment-stage'));
      this.CM = CM
      CM.init(); // 初始化
      CM.start(); // 启动弹幕
      //设置弹幕舞台等比缩放
      // cm.stage 的父对象或播放器容器等会变大的东西
      var containerParent = document.getElementById("my-player");
      // 记住默认大小，此处亦可换成固定的默认大小
      var defWidth = CM.width
      var defHeight = CM.height
      // 这里代表任何播放器/父对象的的resize，如果有多处可能触发resize的地方（如全屏化）都须绑定
      containerParent.addEventListener("onresize", function () {
        console.log("大小改变")
        var stage = CM.stage; // CommentManager 的 stage
        // 计算缩放比例，只看宽度
        var scale = containerParent.offsetWidth / defWidth;
        var relHeight = containerParent.offsetHeight / scale;
        // 把弹幕舞台设置成小版舞台
        CM.setBounds(defWidth, relHeight);
        stage.style.width = defWidth;
        stage.style.height = relHeight;
        // 用 CSS 来拉伸
        stage.style.transform = "scale(" + scale + ")";
      });
      ws.onopen = function () {
        ws.send(Global.encode(JSON.stringify({
          roomid: Number(_this.roomId)
        }), 7));
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
                  console.log(`${body.info[2][1]}: ${body.info[1]}`);
                  var someDanmakuAObj = {
                    "mode": 1,
                    "text": `${body.info[1]}`,
                    "size": 15,
                    "color": 0xffffff,
                    "dur": 16000
                  };
                  var newDanmu = {
                    fromName: `${body.info[2][1]}`,
                    msg: `${body.info[1]}`
                  }
                  _this.$emit("newDanmuSend", newDanmu)
                  CM.send(someDanmakuAObj);
                  break;
              }
            })
            break;
        }
      };
    },

  },

  mounted() {
    this.init()
  },
  destroyed() {
    clearInterval(this.interval)
    this.ws.close()
  }
}
</script>

<style scoped>
.abp {
}

.container {
  width: 100%;
  height: 70%;
}
</style>