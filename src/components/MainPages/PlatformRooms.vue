<template>
 <div v-loading="loading" element-loading-background="rgba(243, 246, 248, 0.8)" class="platform-room-container">
   <div class="platform-room-name">
     {{ getPlatform(platform) }}
   </div>
   <div class="area-types">
     <div class="area-type-name">
       <div id="全部" @click="selectAll" class="area-dropdown-link">
        全部
       </div>
     </div>
     <div class="area-type-name" v-for="(areaType, index) in areaList" :key="index">
       <el-dropdown placement="bottom-start">
          <div :id="areaType[0].typeName" class="area-dropdown-link">
            {{ areaType[0].typeName }}
          </div>
         <el-dropdown-menu class="dropdown-menu" slot="dropdown">
           <el-dropdown-item @click.native="selectArea(areaInfo)" v-for="(areaInfo, index) in areaType" :key="index">{{ areaInfo.areaName }}</el-dropdown-item>
         </el-dropdown-menu>
       </el-dropdown>
     </div>
   </div>
   <div class="platform-room-list">
     <RoomList ref="roomList" class="follows-room-list" :room-list="roomList"/>
   </div>
 </div>
</template>

<script>
import RoomList from "@/components/Common/RoomList";
import {getAreas, getRecommendByPlatform, getRecommendByPlatformArea} from "@/api/liveList";
export default {
  name: "PlatformRooms",
  components: {RoomList},
  data(){
    return {
      page: 1,
      platform: null,
      roomList: [],
      loading: false,
      areaList: [],
      selectedArea: null,
    }
  },
  methods: {
    init(){
      let selectedDiv = document.getElementById("全部")
      selectedDiv.style.color = '#007ACC'
      selectedDiv.style.transform = 'scale(1.1)'
      this.platform = this.$route.params.platform
      this.loading = true
      getAreas(this.platform)
        .then(response => {
          if (response.data.code == 200){
            this.areaList = response.data.data
          }
        })
      getRecommendByPlatform(this.platform, this.page, 20)
        .then(response => {
          if (response.data.code == 200){
            this.roomList = response.data.data
          }
          this.loading = false
        })
    },
    loadRoomList(){
      if (this.roomList.length<1){
        return
      }
      this.$refs.roomList.getLoad()
      this.page++
      console.log("to get page:"+this.page)
      if (this.selectedArea == null){
        getRecommendByPlatform(this.platform, this.page, 20)
            .then(response => {
              if (response.data.code == 200){
                this.roomList.push(...response.data.data)
                this.$refs.roomList.loadFinish()
              }
            })
      }else {
        getRecommendByPlatformArea(this.platform, this.selectedArea.areaName, this.page, 20)
            .then(response => {
              if (response.data.code == 200){
                this.roomList.push(...response.data.data)
                this.$refs.roomList.loadFinish()
              }
            })
      }
    },
    getPlatform(platForm){
      if (platForm == 'bilibili'){
        return '哔哩哔哩'
      }
      if (platForm == 'douyu'){
        return '斗鱼'
      }
      if (platForm == 'huya'){
        return '虎牙'
      }
      if (platForm == 'cc'){
        return '网易CC'
      }
    },
    selectArea(areaInfo){
      this.page = 1
      this.selectedArea = areaInfo
      this.loading = true
      this.roomList = []
      getRecommendByPlatformArea(this.platform, areaInfo.areaName, 1, 20)
        .then(response => {
          if (response.data.code == 200){
            this.roomList = response.data.data
          }
          this.loading = false
        })
      let classList = document.getElementsByClassName('area-dropdown-link')
      for (let i = 0; i < classList.length; i++){
        classList[i].style.color = '#000000';
        classList[i].style.transform = ''
        classList[i].innerHTML = classList[i].id
      }
      let selectedDiv = document.getElementById(areaInfo.typeName)
      selectedDiv.style.color = '#007ACC'
      selectedDiv.style.transform = 'scale(1.1)'
      selectedDiv.innerText = selectedDiv.innerText+'·'+areaInfo.areaName
    },
    selectAll(){
      this.page = 1
      this.loading = true
      this.roomList = []
      this.selectedArea = null
      getRecommendByPlatform(this.platform, 1, 20)
          .then(response => {
            if (response.data.code == 200){
              this.roomList = response.data.data
            }
            this.loading = false
          })
      let classList = document.getElementsByClassName('area-dropdown-link')
      for (let i = 0; i < classList.length; i++){
        classList[i].style.color = '#000000';
        classList[i].style.transform = ''
        classList[i].innerHTML = classList[i].id
      }
      let selectedDiv = document.getElementById("全部")
      selectedDiv.style.transform = 'scale(1.1)'
      selectedDiv.style.color = '#007ACC'
    },
  },
  mounted() {
    this.init()
  },
  activated() {
    this.$emit("activated", 2)
  },
}
</script>

<style scoped>
.platform-room-container{
  height: 100%;
  width: 100%;
  position: relative;
}
.platform-room-name{
  position: absolute;
  left: 10px;
  font-weight: bold;
  font-size: 40px;
}
.platform-room-list{
  position: absolute;
  bottom: 0;
  left: 10px;
  top: 78px;
  width: 100%;
}
.area-types{
  position: absolute;
  display: inline-block;
  left: 15px;
  top: 59px;
  right: 0px;
  height: 25px;
}
.area-type-name{
  font-weight: bold;
  cursor: pointer;
  float: left;
  margin-right: 20px;
  text-align: center;
}
.area-dropdown-link{
  color: #000000;
  font-size: 17px;
  transition: all 0.1s;
}
.area-dropdown-link:hover{
  transform: scale(1.2);
}
.dropdown-menu{
  overflow: auto;
  max-height: 500px;
  background-color: #fbfdff;
  border: #8e8e8e;
}
.dropdown-menu::-webkit-scrollbar {
  width: 8px;
  /*height: 4px;*/
}
.dropdown-menu::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #8e8e8e;
}
</style>
