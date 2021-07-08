<template>
 <div v-loading="loading" element-loading-background="rgba(243, 246, 248, 0.8)" class="areas-container">
   <div class="areas-big-word">
     分区列表
   </div>
   <div class="areas-menu">
     <div class="areas-menu-typeName" @click="selectAreaType(index)" v-for="(areaList, index) in allAreas" :key="index">
       {{areaList[0].typeName}}
     </div>
   </div>
   <el-row class="areas-list">
     <transition-group name="areapic">
       <el-col :span="4" v-for="(areaInfo, index) in areaInfoList" :key="index" class="areas-list-col">
         <div @click="toAreaList(areaInfo.typeName, areaInfo.areaName)" class="areas-list-card">
           <el-image :fit="fit"
                     class="areas-pic"
                     :scroll-container="getElePic()"
                     :src="areaInfo.areaPic"
                     @load="imageLoad($event)" lazy/>
           <div class="areas-list-under-card">
              {{ areaInfo.areaName }}
           </div>
         </div>
       </el-col>
     </transition-group>
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
      fit: "fill",
      loading: false,
    }
  },
  methods: {
    imageLoad(e){
      e.currentTarget.style.opacity = "0"
      this.fadeIn(e.currentTarget, 50);
    },
    fadeIn(element,speed){
      var num = 0;
      var st = setInterval(function(){
        num++;
        element.style.opacity = num/10;
        if(num>=10)  {  clearInterval(st);  }
      },speed);
    },
    getElePic(){
      return document.getElementById('home-main');
    },
    init(){
      this.loading = true
      getAllAreas()
        .then(response => {
          if (response.data.code == 200){
            this.allAreas = response.data.data
            this.areaInfoList = this.allAreas[0].slice(0, 24)
          }
          this.loading = false
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
.areapic-enter{
  margin-top: 100px;
}
.areapic-enter-active{
  transition: all 0.7s;
}
</style>
