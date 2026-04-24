# 简约好用的json编辑chrome插件

## 简介

基于 [josdejong/jsoneditor](https://github.com/josdejong/jsoneditor) 封装的chrome插件，喜欢简洁的朋友一定要试试！（效果视频：https://v.douyin.com/NpY9VNd/ ）

![效果图](https://raw.githubusercontent.com/sunzsh/chromeapp-jsonedit/506bbb4c14878fe97a3e80d400a6231cf2f78f90/screenshot.png)


## 更新记录
### 2022-04-12
1. 解决初次安装时报错（不影响使用）
2. 解决剪切板内容为非标准json时打开`clipboard`模式会报错的问题
### 2022-04-06
1. 支持在地址后追加参数来指定打开方式，例如：`...index.html?clipboard`
    * `无参数` 默认加载最后一次编辑过的json
    * `none` 打开一个空的编辑器
    * `clipboard` 自动读取剪切板里的内容加载并格式化
2. 支持字体缩放并记忆
3. 恢复支持了格式错误的提醒
4. 重构了自定义按钮的样式

## 使用方法
### 作为 Chrome 扩展使用
1. 下载源码
2. 在 Chrome 中打开 `chrome://extensions`
3. 右上角开启“开发者模式”
4. 点击“加载已解压的扩展程序”，选择源码根目录
5. 在工具栏固定“JsonEditor”，点击图标打开编辑器

### 作为网页/PWA 使用
1. 在源码目录启动一个本地静态服务器，例如 `python3 -m http.server 8000`
2. 在 Chrome 中打开 `http://localhost:8000`
3. 可以在地址后追加 `?clipboard` 自动加载剪切板里的 json，例如 `http://localhost:8000/?clipboard`
4. \[可选\] 方便以后进入，建议打开后添加到收藏夹，或通过浏览器安装为 PWA
5. \[可选\] 可以配合安装 [alfred插件](https://github.com/sunzsh/favoritesWorkflow4Alfred/blob/main/jsonEditor.alfredworkflow) 快速打开（支持按住 command 自动加载剪切板内 json）

### AI 格式化非规范 JSON
1. 点击顶部工具栏的 `AI配置`
2. 填写 OpenAPI 地址、模型名称和 API Key，默认地址为 `https://api.deepseek.com`，默认模型为 `deepseek-v4-flash`
3. 将非规范 JSON 粘贴到编辑器
4. 在 `代码` 模式下点击 `AI格式化`，程序会调用 AI 并把返回的合法 JSON 覆盖到当前编辑器

AI 格式化使用的提示词为：

```text
帮我 json 格式化，只输出 json 格式的格式化后的内容即可，不要输出其他任何内容
当前编辑器内容
```

API Key 只保存在当前浏览器的 localStorage 中，不会写入源码。

### 历史记录
1. 点击 `保存` 时可以输入保存名称
2. 点击 `历史` 可以按“名称 - 年月日时分秒”查看最近 5 条保存记录
3. 点击历史项本身会恢复该记录，点击历史项右侧展开菜单里的 `删除` 可以删除该记录

## 特别鸣谢
* ★★★ 没有 [Jos de Jong](https://github.com/josdejong) 开源的 [josdejong/jsoneditor](https://github.com/josdejong/jsoneditor) ，就不会有这个小工具
* [sungf](https://github.com/sungf) 、 [zhaoeryu](https://github.com/zhaoeryu)  贡献的源码提供了历史记录的功能
* [git-403](https://github.com/git-403) 贡献了加载加载剪切板的代码和思路
* [Cherry-toto](https://github.com/Cherry-toto) 贡献了字体缩放的初始代码
