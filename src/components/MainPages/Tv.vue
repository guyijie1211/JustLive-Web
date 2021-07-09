<template>
  <div v-loading="loading" element-loading-background="rgba(243, 246, 248, 0.8)" class="tv-container">
    <div class="tv-big-word">
      电视频道(测试)
    </div>
<!--    <div class="tv-menu">-->
<!--      <div class="tv-menu-typeName" @click="selectTvArea(area)" v-for="(area, index) in tvAreaList" :key="index">-->
<!--        {{area}}-->
<!--      </div>-->
<!--    </div>-->
    <div class="tv-list">
      <transition-group name="areapic">
        <div v-for="(tvInfo, index) in tvList" :key="index" class="tv-list-col">
          <div @click="toTvLive(tvInfo.name, tvInfo.url)" class="tv-list-card">
            {{tvInfo.name}}
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import {getTv} from "@/api/liveList";

export default {
  name: "Tv",
  data() {
    return {
      loading: false,
      tvList: [],
      indexNow: 0,
    }
  },
  methods: {
    init(){
      let _this = this
      this.loading = true
      getTv().then(response => {
            if (response.data.code == 200){
              let result = response.data.data;
              this.tvList = result;
            }
            this.loading = false
          })
    },
    toTvLive(title, link) {
      this.$router.push({ name: 'tvLive', params:{ title : title, link : link } });
    },
  },
  mounted() {
    this.init()
  },
  activated() {
    this.$emit("activated", 4)
  }
}
</script>

<style scoped>
.tv-container{
  position: relative;
  height: 100%;
  width: 100%;
}
.tv-big-word{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-weight: bold;
  font-size: 40px;
}
.tv-menu{
  position: absolute;
  top: 60px;
  height: 25px;
  right: 0;
  left: 10px;
}
.tv-list{
  position: absolute;
  top: 105px;
  left: 0;
  right: 0;
}
.tv-menu-typeName{
  font-weight: bold;
  cursor: pointer;
  float: left;
  margin-right: 20px;
  text-align: center;
  transition: all 0.2s;
}
.tv-menu-typeName:hover {
  transform: scale(1.2);
}
.tv-list-card{
  margin-left: 20px;
  height: 100%;
  width: 180px;
  box-shadow: 0px 0px 4px 1px #474747;
  transition: all 0.1s;
}
.tv-list-card:hover{
  cursor: pointer;
  transform: scale(1.1);
}
.tv-pic{
  height: 100%;
  width: 100%;
}
.tv-list-col{
  position: relative;
  margin-bottom: 30px;
  height: 50px;
  text-align: center;
  float: left;
}
.tv-list-under-card{
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