<template>
  <div>
    <div class="artplayer-app" ></div>
  </div>
</template>

<script>
import Hls from 'hls.js';
import Artplayer from 'artplayer';

export default {
  name: "ArtPlayerTv",
  props: ['url'],
  data() {
    return {
      player: null,
    }
  },
  methods: {
    init(){
      let _this = this
      var art = new Artplayer({
        container: '.artplayer-app',
        autoplay: true, //自动播放
        isLive: true, //直播
        url: this.url,
        // url: "http://ivi.bupt.edu.cn/hls/cctv7hd.m3u8",
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
        customType: {
          customHls: function (video, url) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            _this.hls = hls
          },
        },
      });
      art.on('destroy', function (args) {
        _this.hls.destroy();
      });
      this.player = art
    },
  },
  beforeDestroy() {
    if(this.player){
      this.player.destroy()
    }
  },
  watch: {
    url: function() {
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
