export function outputError(source, error) {
  console.log(error.response ? error.response : error.message)
  source.$message({
    showClose: true,
    message: '出错了，请按F12查看浏览器日志。',
    type: 'error'
  })      
}