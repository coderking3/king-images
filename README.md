# King Images

King Images 是一个功能强大的图片上传和管理工具，支持多种图片格式，提供便捷的上传、管理和复制功能。无论是开发者还是内容创作者，都能通过本工具高效地处理和组织图片资源。

## 主要功能

### 图片上传

- **多种上传方式**：支持拖拽上传、点击选择和粘贴上传
- **批量处理**：支持多图片同时上传，并显示实时上传进度
- **格式支持**：兼容JPG、PNG、GIF、WebP等常见图片格式
- **上传进度**：实时显示上传速度、剩余时间和成功/失败状态

### 图片管理

- **智能图库**：自适应网格布局，根据图片比例优化显示效果
- **预览功能**：支持图片放大预览，提供流畅的浏览体验
- **格式转换**：支持原图、WebP、Markdown和自定义格式一键复制

### 数据导入导出

- **数据备份**：一键导出所有图片数据为JSON文件
- **快速恢复**：支持导入备份数据，自动处理重复ID

### 用户体验

- **登录方式**：支持二维码扫码登录和账号密码登录
- **响应式设计**：适配不同设备屏幕，提供一致的使用体验
- **本地存储**：使用IndexedDB在浏览器中存储图片信息，无需服务器

## 安装

### 环境要求

- Node.js 16.0.0 或更高版本
- npm 7.0.0 或更高版本 / pnpm 8.0.0 或更高版本

### 安装步骤

1. 克隆项目到本地

```bash
git clone https://github.com/yourusername/king-images.git
cd king-images
```

2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

3. 启动开发服务器

```bash
# 使用 npm
npm run dev

# 或使用 pnpm
pnpm dev
```

4. 构建生产版本

```bash
# 使用 npm
npm run build

# 或使用 pnpm
pnpm build
```

### 使用指南

1. **图片上传**
   - 进入首页，点击"图片上传"标签
   - 将图片拖拽到上传区域，或点击"选择文件"按钮选择图片
   - 也可以直接复制图片并粘贴到页面中
   - 点击"上传全部"按钮开始上传
   - 上传完成后，图片将显示在"最近上传"区域

2. **图片库管理**
   - 点击"图片库"标签查看所有已上传的图片
   - 点击图片可复制对应格式的链接（Markdown或WebP）
   - 可以根据需要删除或管理图片

### 图片格式

| Type                         | Url                                |
| ---------------------------- | ---------------------------------- |
| 原图                         | baseURL/1.jpg                      |
| 原分辨率，质量压缩           | baseURL/1.jpg@1e_1c.jpg            |
| 规定宽，高度自适应，质量压缩 | baseURL/1.jpg@104w_1e_1c.jpg       |
| 规定高，宽度自适应，质量压缩 | baseURL/1.jpg@104h_1e_1c.jpg       |
| 规定高宽，质量压缩           | baseURL/1.jpg@104w_104h_1e_1c.jpg  |
| 原分辨率，webp格式(占用最小) | baseURL/1.jpg@104w_104h_1e_1c.webp |
| 规定高度，webp格式(占用最小) | baseURL/1.jpg@104w_104h_1e_1c.webp |

格式：(图像原链接)@(\d+[whsepqoc]\_?)\*(\.(|webp|gif|png|jpg|jpeg))?$

- w:[1, 9223372036854775807] (width，图像宽度)
- h:[1, 9223372036854775807] (height，图像高度)
- s:[1, 9223372036854775807] (作用未知)
- e:[0,2] (resize，0:保留比例取其小，1:保留比例取其大，2:不保留原比例，不与c混用)
- p:[1,1000] (默认100，放大倍数，不与c混用)
- q:[1,100] (quality，默认75，图像质量)
- o:[0,1] (作用未知)
- c:[0,1] (clip，0:默认，1:裁剪)
- webp,png,jpeg,gif(不加则保留原格式)
- 不区分大小写，相同的参数后面覆盖前面
- 计算后的实际w*h不能大于原w*h，否则wh参数失效

### 防盗链解决方案

#### 全站图片使用

在html的head标签中设置如下标志，那么全站资源引用都不会携带referrer

```html
<meta name="referrer" content="no-referrer" />
```

#### 新窗口打开

主要设置rel="noreferrer"，使用window.open打开的话是会默认携带referrer的，第一次还是会403

```html
<a rel="noreferrer" target="_blank"></a>
```

## 许可证

[MIT](LICENSE)

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 项目仓库：[https://github.com/Coder-King3/king-images](https://github.com/Coder-King3/king-images)
- 电子邮件：w2196592083@gmail.com

## 致谢

> 本项目得到以下项目的支持与帮助，在此表示衷心的感谢！

#### 图片上传功能

- **项目**: [bilibili-img-uploader](https://github.com/xlzy520/bilibili-img-uploader)
- **贡献**: 提供了基于 B站 API 的图片上传解决方案
- **作者**: [@xlzy520](https://github.com/xlzy520)

#### 二维码登录和用户信息获取

- **项目**: [bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect)
- **贡献**: 提供了完整的 B站 API 接口文档和实现方案，为二维码登录、用户信息获取等功能提供了技术支持
- **作者**: [@SocialSisterYi](https://github.com/SocialSisterYi)

---

[English Documentation](README.md)
