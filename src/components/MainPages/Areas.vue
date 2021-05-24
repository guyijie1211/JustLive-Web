<template>
 <div class="areas-container">
   <div class="areas-big-word">
     分区列表
   </div>
   <div class="areas-menu">
     <div class="areas-menu-typeName" @click="selectAreaType(index)" v-for="(areaList, index) in allAreas" :key="index">
       {{areaList[0].typeName}}
     </div>
   </div>
   <el-row class="areas-list">
     <el-col :span="4" v-for="(areaInfo, index) in areaInfoList" :key="index" class="areas-list-col">
       <div @click="toAreaList(areaInfo.typeName, areaInfo.areaName)" class="areas-list-card">
         <img class="areas-pic" :src="areaInfo.areaPic">
         <div class="areas-list-under-card">
            {{ areaInfo.areaName }}
         </div>
       </div>
     </el-col>
   </el-row>
 </div>
</template>

<script>
import {getAllAreas, getRecommendByPlatform, getRecommendByPlatformArea} from "@/api/liveList";

export default {
  name: "Areas",
  data() {
    return {
      allAreas: [],
      areaInfoList: [],
      indexNow: 0,
      page: 1,
    }
  },
  methods: {
    init(){
      getAllAreas()
        .then(response => {
          if (response.data.code == 200){
            this.allAreas = response.data.data
            this.areaInfoList = this.allAreas[0].slice(0, 24)
          }
        })
    },
    toAreaList(typeName, areaName){
      this.$router.push({ name: 'areaAll', query:{ typeName : typeName, areaName : areaName } });
    },
    selectAreaType(index){
      this.indexNow = index
      this.areaInfoList = []
      this.areaInfoList = this.allAreas[index].slice(0, 24)
    },
    loadRoomList(){
      if (this.areaInfoList.length<1){
        return
      }
      this.page++
      let page = this.page
      this.areaInfoList.push(...this.allAreas[this.indexNow].slice((page-1)*24, page*24))
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
  },
  mounted() {
    this.init()
  },
  activated() {
    this.$emit("activated", 3)
  },
}
</script>

<style scoped>
.areas-container{
  position: relative;
  height: 100%;
  width: 100%;
}
.areas-big-word{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-weight: bold;
  font-size: 40px;
}
.areas-menu{
  position: absolute;
  top: 60px;
  height: 25px;
  right: 0;
  left: 10px;
}
.areas-list{
  position: absolute;
  top: 105px;
  left: 0;
  right: 0;
}
.areas-menu-typeName{
  font-weight: bold;
  cursor: pointer;
  float: left;
  margin-right: 20px;
  text-align: center;
  transition: all 0.2s;
}
.areas-menu-typeName:hover {
  transform: scale(1.2);
}
.areas-list-card{
  margin-left: 20px;
  height: 100%;
  width: 180px;
  box-shadow: 0px 0px 4px 1px #474747;
  transition: all 0.1s;
}
.areas-list-card:hover{
  cursor: pointer;
  transform: scale(1.1);
}
.areas-pic{
  height: 100%;
  width: 100%;
  object-fit: fill;
}
.areas-list-col{
  position: relative;
  margin-bottom: 60px;
  height: 240px;
}
.areas-list-under-card{
  position: absolute;
  bottom: -35px;
  width: 180px;
  height: 30px;
  text-align: center;
  font-weight: bold;
  color: #4e4c4c;
  font-size: 20px;
}
</style>
