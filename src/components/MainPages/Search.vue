<template>
  <div v-loading="loading" element-loading-background="rgba(243, 246, 248, 0.8)" class="search-container">
    <div class="search-bar">
      <el-select class="search-bar-select" size="middle" v-model="value" placeholder="选择平台">
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
        </el-option>
      </el-select>
      <el-input size="middle" class="search-bar-input" v-model="keyWord" @keydown.enter.native="toSearch"></el-input>
      <el-button class="search-bar-btn" type="primary" @click="toSearch">搜索</el-button>
    </div>
    <div class="search-result">
      <div class="search-result-list">
        <el-row class="search-result-row" :gutter="30">
          <el-col class="search-result-col" :span="8" v-for="(owner, index) in resultList" :key="index">
            <el-card @click.native="toRoom(owner.platform, owner.roomId)" class="search-result-card" shadow="hover">
              <div class="search-result-card-head">
                <img class="search-head-pic" :src=owner.headPic />
              </div>
              <div class="search-result-card-right">
                <div class="result-name">
                  {{ getPlatform(owner.platform) }} · {{ owner.nickName }}
                </div>
                <div>
                  <div :class="isLive(owner.isLive) ? 'info-isLive' : 'info-notLive'">{{ isLive(owner.isLive) ? "直播中" : "未开播" }}</div>
                </div>
                <div class="result-follows">
                  关注人数:{{ handleOnline(owner.followers) }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import {getSearch} from "@/api/liveList";
import Global from "@/components/Global";

export default {
  name: "Search",
  data(){
    return {
      keyWord: '',
      options: [],
      value: 'douyu',
      selectType: '0',
      resultList: [],
      loading: false,
      userInfo: {},
      watchPlatformList: Global.platformList
    }
  },
  methods: {
    init(){
      this.$emit("inSearch")
      if (localStorage.getItem('userInfo')) {
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'))
      }
      this.keyWord = this.$route.query.keyWord
      this.toSearch()
      // let li = document.getElementsByClassName("result-li")[0]
      // li.style.color = '#007ACC'
      var platformList = Global.getPlatformList()
      platformList.forEach(platformInfo => {
        this.options.push({
          value: platformInfo.code,
          label: platformInfo.name
        })
      })
    },
    isLive(isLive){
      if (isLive == "0"){
        return false
      }else {
        return true
      }
    },
    toRoom(platform, roomId){
      this.$router.push({ name: 'liveRoom', query:{ platform : platform, roomId : roomId } });
    },
    handleOnline(online){
      let num = online.toString().trim()
      if (num.length > 4){
        let numCut = num.substring(0, num.length-4)
        let afterPoint = num.substring(num.length-4,num.length-3)
        return numCut+'.'+afterPoint+'万'
      }else {
        return num+'人'
      }
    },
    toSearch(){
      if(this.keyWord.trim()!=''){
        if (this.userInfo.uid == undefined) {
          this.$message({
            message: '搜索功能需登录使用',
            type: 'warning'
          });
          return;
        }
        this.$router.push({ name: 'search', query:{ keyWord : this.keyWord } })
        this.resultList = []
        this.loading = true
        getSearch(this.value, this.keyWord, this.userInfo.uid)
            .then(response => {
              if (response.data.code == 200) {
                this.resultList = response.data.data
              } else {
                this.$message({
                  message: '请求过多',
                  type: 'warning'
                });
              }
              this.loading = false
            })
      }
    },
    getPlatform(platForm){
      var platformName = Global.getPlatform(platForm)
      return platformName
    },
  },
  mounted() {
    this.init()
  },
  activated() {
    console.log('active')
    this.$emit("inSearch")
  },
  beforeDestroy(){
    this.$emit("exitSearch")
  },
  watch: {
    'watchPlatformList'(newVal, oldVal) {
      var platformList = Global.getPlatformList()
      platformList.forEach(platformInfo => {
        this.options.push({
          value: platformInfo.code,
          label: platformInfo.name
        })
      })
    }
  }
}
</script>

<style scoped>
.search-container{
  position: relative;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}
.search-container::-webkit-scrollbar {
  width: 8px;
  /*height: 4px;*/
}
.search-container::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #8e8e8e;
}
.search-bar{
  position: absolute;
  top: 20px;
  width: 100%;
  height: 50px;
  overflow: hidden;
}
.search-bar-select{
  margin-left: 30%;
  width: 110px;
}
.search-bar-input{
  margin-left: 10px;
  width: 300px;
}
.search-bar-btn{
  margin-left: 10px;
}
.search-result{
  position: absolute;
  top: 70px;
  width: 100%;
  bottom: 0px;
}
.result-ul{
  position: absolute;
  left: 40%;
  list-style: none;
  height: 25px;
  margin-block: 5px;
}
.result-li{
  font-weight: bold;
  cursor: pointer;
  position: relative;
  margin-right: 20px;
  text-align: center;
  width: auto;
  display: inline;
  float:left;
  height: 100%;
}
.result-li:hover{
  color: #007ACC;
}
.under-result-li{
  position: absolute;
  bottom: 0px;
  height: 4px;
  width: 33px;
  background: #007ACC;
  transition: all 0.3s;
  transform: translateX(0px);
}
.search-result-list{
  position: absolute;
  width: 100%;
  bottom: 0px;
  top: 38px;
}
.search-result-col{
  width: 29%;
  margin-bottom: 20px;
  margin-left:50px;
}
.search-result-card-head{
  position: absolute;
  top: 10px;
  left: 10px;
  height: 70px;
  width: 70px;
}
.search-head-pic{
  width: 100%;
  height: 100%;
  border-radius: 10px;
}
.search-result-card{
  height: 90px;
  width: 90%;
  position: relative;
  transition: all 0.2s;
}
.search-result-card:hover{
  cursor: pointer;
  transform: scale(1.1);
}
.search-result-card-right{
  position: absolute;
  top: 10px;
  left: 100px;
  font-weight: bold;
}
.info-isLive{
  margin-top: 6px;
  margin-right: 5px;
  float: left;
  height: 18px;
  width: 45px;
  background-color: #c10f0f;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #F3F6F8;
}
.info-notLive{
  margin-top: 6px;
  margin-right: 5px;
  float: left;
  height: 18px;
  width: 45px;
  background-color: #979797;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #F3F6F8;
}
.result-follows{
  position: absolute;
  top: 50px;
  width: 200px;
  font-weight: normal;
  font-size: 13px;
}
.result-name{
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 210px;
}
</style>
