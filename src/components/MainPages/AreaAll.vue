<template>
  <div v-loading="loading" element-loading-background="rgba(243, 246, 248, 0.8)" class="areaAll-room-container">
    <div class="areaAll-room-name">
      {{ areaName }}
    </div>
    <div class="areaAll-room-list">
      <RoomList ref="roomList" class="follows-room-list" :room-list="roomList"/>
    </div>
  </div>
</template>

<script>
import RoomList from "@/components/Common/RoomList";
import {getRecommendByAreaAll, getRecommendByPlatform, getRecommendByPlatformArea} from "@/api/liveList";

export default {
  name: "AreaAll",
  components: {RoomList},
  data(){
    return {
      page: 1,
      typeName: '',
      areaName: '',
      roomList: [],
      loading: false,
    }
  },
  methods: {
    init(){
      this.typeName = this.$route.query.typeName
      this.areaName = this.$route.query.areaName
      this.loading = true
      getRecommendByAreaAll(this.typeName, this.areaName, 1)
        .then(response => {
          if (response.data.code == 200){
            this.roomList = response.data.data
          }
          this.loading = false
        })
    },
    loadRoomList(){
      let _this = this;
      if (this.roomList.length<1){
        return
      }
      _this.$emit("startLoad")
      this.$refs.roomList.getLoad()
      this.page++
      console.log("to get page:"+this.page)
      getRecommendByAreaAll(this.typeName, this.areaName, this.page)
          .then(response => {
            if (response.data.code == 200){
              this.roomList.push(...response.data.data)
              this.$refs.roomList.loadFinish()
            }
            _this.$emit("loadFinish")
          })
    },
  },
  mounted() {
    this.init();
  },
  activated() {
    this.$emit("activated", 3)
  },
}
</script>

<style scoped>
.areaAll-room-container{
  height: 100%;
  width: 100%;
  position: relative;
}
.areaAll-room-name{
  position: absolute;
  left: 10px;
  font-weight: bold;
  font-size: 40px;
}
.areaAll-room-list{
  position: absolute;
  bottom: 0;
  left: 10px;
  top: 48px;
  width: 100%;
}
</style>
