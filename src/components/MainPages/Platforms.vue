<template>
  <el-row class="platform-row" :gutter="20">
    <div v-for="(platformInfo, key) in platformList" :key="key">
      <div  @click="toPlatform(platformInfo.code, platformInfo.name)">
        <el-col class="platform-col" :span="11">
          <div class="pic-div">
            <img class="douyu-pic" :src="platformInfo.logoImage">
          </div>
          <div class="platform-info">
            <div class="platform-info-title">{{ platformInfo.name }}</div>
          </div>
        </el-col>
      </div>
    </div>
  </el-row>
</template>

<script>
import {getAllSupportPlatforms} from "../../api/liveList";

export default {
  name: "Platforms",
  data() {
    return {
      platformList: [],
      loading: false,
    }
  },
  methods: {
    init(){
      this.loading = true
      getAllSupportPlatforms()
          .then(response => {
            if (response.data.code === 200){
              this.platformList = response.data.data.platformList
            }
            this.loading = false
          })
    },
    toPlatform(platformCode, platformName){
      this.$router.push({ name: 'platformRoom', params: {platform: platformCode, platformName: platformName} });
    },
  },
  mounted() {
    this.init()
  },
  activated() {
    this.$emit("activated", 2)
  }
}
</script>

<style scoped>
.platform-row{
  height: 100%;
  width: 100%;
}
.platform-col{
  position: relative;
  margin-left: 30px;
  background-color: #d2d2d2;
  margin-bottom: 30px;
  height: 300px;
  border-radius: 10px;
  transition: all 0.2s;
}
.platform-col:hover{
  cursor: pointer;
  transform: scale(1.04);
}
.pic-div{
  float: left;
  margin-top: 10px;
  height: 280px;
  width: 280px;
  /*flex 布局*/
  display: flex;
  /*实现垂直居中*/
  align-items: center;
  /*实现水平居中*/
  justify-content: center;
  text-align: justify;
}
.douyu-pic{
  height: 100%;
  width: 100%;
  object-fit: cover;
}
.platform-info{
  position: absolute;
  top: 40%;
  right: 0px;
  left: 210px;
}
.platform-info-title{
  font-size: 35px;
  font-weight: bold;
  text-align: center;
  width: 100%;
}
a:link { text-decoration: none;color: #4e4c4c}
a:active { text-decoration:blink}
a:hover { text-decoration:underline;color: #4e4c4c}
a:visited { text-decoration: none;color: #4e4c4c}
</style>
