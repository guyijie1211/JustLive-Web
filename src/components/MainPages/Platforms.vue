<template>
  <el-row class="platform-row" :gutter="20">
    <el-col :sm="{ span: 12 }"  class="el-col-item">
      <router-link
        class="platform-col"
        :to="{ name: 'platformRoom', params: { platform: 'douyu' } }"
      >
        <div class="pic-div douyu-pic-div">
          <img
            class="douyu-pic"
            src="https://imgsrc.baidu.com/forum/pic/item/297a0bfc1e178a823f26bdc2e103738da977e81c.jpg"
          />
        </div>
        <div class="platform-info">
          <div class="platform-info-title">斗鱼直播</div>
        </div>
      </router-link>
    </el-col>

    <el-col :sm="{ span: 12 }"  class="el-col-item">
      <router-link
        class="platform-col"
        :to="{ name: 'platformRoom', params: { platform: 'bilibili' } }"
      >
        <div class="pic-div bilibili-pic-div">
          <img
            class="bilibili-pic"
            src="../../../pic/bilibili-logo.png"
            height="50"
            width="120"
          />
        </div>
        <div class="platform-info">
          <div class="platform-info-title">哔哩直播</div>
        </div>
      </router-link>
    </el-col>

    <el-col :sm="{ span: 12 }" class="el-col-item">
      <router-link
        class="platform-col"
        :to="{ name: 'platformRoom', params: { platform: 'huya' } }"
      >
        <div class="pic-div huya-pic-div">
          <img
            class="huya-pic"
            src="https://imgsrc.baidu.com/forum/pic/item/902397dda144ad3469d79d09dea20cf430ad85d7.jpg"
          />
        </div>
        <div class="platform-info">
          <div class="platform-info-title">虎牙直播</div>
        </div>
      </router-link>
    </el-col>

    <el-col :sm="{ span: 12 }" class="el-col-item">
      <router-link
        class="platform-col"
        :to="{ name: 'platformRoom', params: { platform: 'cc' } }"
      >
        <div class="pic-div cc-pic-div">
          <img
            class="cc-pic"
            src="https://imgsrc.baidu.com/forum/pic/item/0ff41bd5ad6eddc48041796937dbb6fd536633fa.jpg"
          />
        </div>
        <div class="platform-info">
          <div class="platform-info-title">网易CC</div>
        </div>
      </router-link>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "Platforms",
  activated() {
    this.$emit("activated", 2)
  },
}
</script>

<style scoped>
.platform-row {
  height: 100%;
  width: 100%;
}
.el-col-item {
  margin:10px 0;
}
.platform-col {
  height: 300px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  background-color: #d2d2d2;
  border-radius: 10px;
  transition: all 0.2s;
  text-decoration: none;
  padding: 20px;
}
.platform-col:hover {
  transform: scale(1.04);
}
.pic-div {
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
.douyu-pic-div {
  background: #fd6833;
  max-width: 100%;
}
.bilibili-pic-div {
  background: #de4d79;
  max-width: 100%;
}
.huya-pic-div {
  background: #fdfdfd;
  max-width: 100%;
}
.cc-pic-div {
  background: #fdfdfd;
  max-width: 100%;
}
.douyu-pic {
  object-fit: contain;
  max-width: 100%;
}
.bilibili-pic {
  object-fit: contain;
  max-width: 100%;
}
.huya-pic {
  object-fit: contain;
  max-width: 100%;
}
.cc-pic {
  max-width: 100%;
  object-fit: contain;
}
.platform-info {
  flex: 2;
  margin-left: 10px;
}
.platform-info-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
}
a:link {
  text-decoration: none;
  color: #4e4c4c;
}
a:active {
  text-decoration: blink;
}
a:hover {
  /* text-decoration: underline; */
  color: #4e4c4c;
}
a:visited {
  text-decoration: none;
  color: #4e4c4c;
}
</style>
