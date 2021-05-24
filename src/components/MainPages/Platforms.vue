<template>
  <el-row class="platform-row" :gutter="20">
    <router-link :to="{name: 'platformRoom', params: {platform: 'douyu'}}">
      <el-col class="platform-col" :span="11">
        <div class="pic-div douyu-pic-div">
          <img class="douyu-pic" src="https://imgsrc.baidu.com/forum/pic/item/297a0bfc1e178a823f26bdc2e103738da977e81c.jpg">
        </div>
        <div class="platform-info">
          <div class="platform-info-title">斗鱼直播</div>
        </div>
      </el-col>
    </router-link>
    <router-link :to="{name: 'platformRoom', params: {platform: 'bilibili'}}">
      <el-col class="platform-col" :span="11">
        <div class="pic-div bilibili-pic-div">
          <img class="bilibili-pic" src="https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2124600341,1611607365&fm=15&gp=0.jpg">
        </div>
        <div class="platform-info">
          <div class="platform-info-title">哔哩哔哩直播</div>
        </div>
      </el-col>
    </router-link>
    <router-link :to="{name: 'platformRoom', params: {platform: 'huya'}}">
      <el-col class="platform-col" :span="11">
        <div class="pic-div huya-pic-div">
          <img class="huya-pic" src="https://imgsrc.baidu.com/forum/pic/item/902397dda144ad3469d79d09dea20cf430ad85d7.jpg">
        </div>
        <div class="platform-info">
          <div class="platform-info-title">虎牙直播</div>
        </div>
      </el-col>
    </router-link>
    <router-link :to="{name: 'platformRoom', params: {platform: 'cc'}}">
      <el-col class="platform-col" :span="11">
        <div class="pic-div cc-pic-div">
          <img class="cc-pic" src="https://imgsrc.baidu.com/forum/pic/item/0ff41bd5ad6eddc48041796937dbb6fd536633fa.jpg">
        </div>
        <div class="platform-info">
          <div class="platform-info-title">网易CC</div>
        </div>
      </el-col>
    </router-link>
  </el-row>
</template>

<script>
export default {
  name: "Platforms",
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
  width: 200px;
  /*flex 布局*/
  display: flex;
  /*实现垂直居中*/
  align-items: center;
  /*实现水平居中*/
  justify-content: center;
  text-align: justify;
}
.douyu-pic-div{
  background: #FD6833;
}
.bilibili-pic-div{
  background: #DE4D79;
}
.huya-pic-div{
  background: #FDFDFD;
}
.cc-pic-div{
  background: #FDFDFD;
}
.douyu-pic{

}
.bilibili-pic{
  object-fit: cover;
}
.huya-pic{
}
.cc-pic{
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
