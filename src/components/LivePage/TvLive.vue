<template>
  <div class="tvLive-container">
    <ArtPlayerTv class="room-left-video-play" :url="link" />
    {{ title }} : {{ link }}
  </div>
</template>

<script>
import ArtPlayerTv from "@/components/Test/ArtPlayerTv";
export default {
  name: "TvLive",
  components: {ArtPlayerTv},
  data() {
    return {
      title: '',
      link: '',
    }
  },
  methods: {
    init(){
      this.title = this.$route.params.title
      this.link = this.$route.params.link
      if (typeof(this.title) == "undefined" || typeof(this.link) == "undefined") {
        this.title = sessionStorage.getItem("tvTitle");
        this.link = sessionStorage.getItem("tvLink");
      }
      sessionStorage.setItem('tvTitle', this.title);
      sessionStorage.setItem('tvLink', this.link);
      this.$notify({
        title: '注意',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        message: "<strong>测试功能</strong>，" +
            "直播源加载会很慢。如果长时间加载不成功，可以复制下方的直播地址在potplay等播放器中打开测试",
        duration: 5000,
        position: 'top-left',
        offset: 60
      });
    },
  },
  mounted() {
    this.init()
  },
}
</script>

<style scoped>
.room-left-video-play{
  width: 100%;
  height: 100%;
}
.tvLive-container{
  width: 100%;
  height: 90%;
}
</style>