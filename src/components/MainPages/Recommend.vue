<template>
  <div v-loading="loading" element-loading-background="rgba(243, 246, 248, 0.8)" class="recommend-container">
    <div class="recommend-big-word">
      首页推荐
    </div>
    <div class="recommend-menu">
      <RoomList ref="roomList" class="recommend-room-list" :room-list="roomList" :userInfo="userInfo" :isLogin="isLogin"/>
    </div>
    </div>
</template>

<script>
import {getRecommend, getRecommendByPlatform, getRecommendByPlatformArea} from "@/api/liveList";
import RoomList from "@/components/Common/RoomList";

export default {
  name: "Recommend",
  components: {RoomList},
  props: ['isLogin', 'userInfo'],
  data() {
    return {
      roomList: [],
      nowCarousel: null,
      player: null,
      videoElement: null,
      loading: false,
      page: 1,
    }
  },
  methods: {
    getRooms(){
      this.loading = true
      getRecommend(1, 20)
        .then(response => {
          if (response.data.code == 200){
            this.roomList = response.data.data
          }
          this.loading = false
        })
    },
    toRoom(platform, roomId){
      this.$router.push({ name: 'liveRoom', query:{ platform : platform, roomId : roomId } });
    },
    loadRoomList(){
      if (this.roomList.length<1){
        return
      }
      this.$refs.roomList.getLoad()
      this.page++
      console.log("to get page:"+this.page)
        getRecommend(this.page,20)
            .then(response => {
              if (response.data.code == 200){
                this.roomList.push(...response.data.data)
                this.$refs.roomList.loadFinish()
              }
            })
    },
  },
  mounted() {
    this.$emit("activated", 0)
    this.getRooms()
    this.videoElement = document.querySelector('#myVideo')
  },
  activated() {
    this.$emit("activated", 0)
  }
}
</script>

<style scoped>
.recommend-container{
  height: 100%;
  width: 100%;
  position: relative;
}
.recommend-big-word{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-weight: bold;
  font-size: 40px;
}
.recommend-menu{
  position: absolute;
  top: 60px;
  height: 25px;
  right: 0;
  left: 10px;
}
</style>
