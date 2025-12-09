# King Images

## Project Introduction

King Images is a powerful image upload and management tool that supports various image formats and provides convenient upload, management, and copying features. Whether you're a developer or content creator, this tool helps you efficiently process and organize image resources.

## Key Features

### Image Upload

- **Multiple Upload Methods**: Support for drag-and-drop, click-to-select, and paste uploads
- **Batch Processing**: Support for uploading multiple images simultaneously with real-time progress display
- **Format Support**: Compatible with common image formats including JPG, PNG, GIF, and WebP
- **Upload Progress**: Real-time display of upload speed, remaining time, and success/failure status

### Image Management

- **Smart Gallery**: Adaptive grid layout that optimizes display based on image proportions
- **Preview Function**: Support for enlarged image previews, providing a smooth browsing experience
- **Format Conversion**: One-click copying in original, WebP, Markdown, and custom formats

### Data Import and Export

- **Data Backup**: One-click export of all image data to JSON files
- **Quick Recovery**: Support for importing backup data with automatic handling of duplicate IDs

### User Experience

- **Login Methods**: Support for QR code scanning login and username/password login
- **Responsive Design**: Adapts to different device screens, providing a consistent user experience
- **Local Storage**: Uses IndexedDB to store image information in the browser, no server required

## Installation and Usage

### Requirements

- Node.js 16.0.0 or higher
- npm 7.0.0 or higher / pnpm 8.0.0 or higher

### Installation Steps

1. Clone the project locally

```bash
git clone https://github.com/yourusername/king-images.git
cd king-images
```

2. Install dependencies

```bash
# Using npm
npm install

# Or using pnpm
pnpm install
```

3. Start the development server

```bash
# Using npm
npm run dev

# Or using pnpm
pnpm dev
```

4. Build for production

```bash
# Using npm
npm run build

# Or using pnpm
pnpm build
```

### Usage Guide

1. **Image Upload**
   - Go to the homepage and click on the "Image Upload" tab
   - Drag images to the upload area or click the "Select Files" button
   - You can also directly copy images and paste them into the page
   - Click the "Upload All" button to start uploading
   - After uploading, images will appear in the "Recent Uploads" area

2. **Image Gallery Management**
   - Click the "Image Gallery" tab to view all uploaded images
   - Click on an image to copy the corresponding format link (Markdown or WebP)
   - You can delete or manage images as needed

### Image Formats

| Type                                         | Url                                |
| -------------------------------------------- | ---------------------------------- |
| Original image                               | baseURL/1.jpg                      |
| Original resolution, quality compression     | baseURL/1.jpg@1e_1c.jpg            |
| Specified width, adaptive height, compressed | baseURL/1.jpg@104w_1e_1c.jpg       |
| Specified height, adaptive width, compressed | baseURL/1.jpg@104h_1e_1c.jpg       |
| Specified dimensions, compressed             | baseURL/1.jpg@104w_104h_1e_1c.jpg  |
| Original resolution, webp format (smallest)  | baseURL/1.jpg@104w_104h_1e_1c.webp |
| Specified height, webp format (smallest)     | baseURL/1.jpg@104w_104h_1e_1c.webp |

Format: (original image URL)@(\d+[whsepqoc]\_?)\*(\.(|webp|gif|png|jpg|jpeg))?$

- w:[1, 9223372036854775807] (width, image width)
- h:[1, 9223372036854775807] (height, image height)
- s:[1, 9223372036854775807] (unknown function)
- e:[0,2] (resize, 0:maintain ratio take smaller, 1:maintain ratio take larger, 2:don't maintain original ratio, don't mix with c)
- p:[1,1000] (default 100, magnification, don't mix with c)
- q:[1,100] (quality, default 75, image quality)
- o:[0,1] (unknown function)
- c:[0,1] (clip, 0:default, 1:crop)
- webp,png,jpeg,gif (keeps original format if not specified)
- Case insensitive, same parameters later override earlier ones
- The actual w*h after calculation cannot be greater than the original w*h, otherwise the wh parameter is ineffective

### Hotlinking Prevention Solutions

#### Site-wide Image Usage

Add the following tag in the HTML head, so all resource references won't carry the referrer

```html
<meta name="referrer" content="no-referrer" />
```

#### Opening in New Window

Set rel="noreferrer". Note that using window.open will carry the referrer by default, and the first access might still return a 403 error

```html
<a rel="noreferrer" target="_blank"></a>
```

## Project Structure

```
king-images/
├── src/                    # Source code
│   ├── api/                # API interfaces
│   ├── components/         # Components
│   ├── db/                 # Database related
│   ├── hooks/              # Custom Hooks
│   ├── pages/              # Pages
│   │   ├── Login/          # Login page
│   │   ├── Upload/         # Upload page
│   │   └── Welcome.tsx     # Welcome page
│   ├── types/              # Type definitions
│   └── utils/              # Utility functions
├── public/                 # Static resources
└── ...                     # Other configuration files
```

## Tech Stack

- **Frontend Framework**: React
- **UI Components**: Shadcn UI
- **State Management**: React Hooks
- **Data Storage**: Dexie.js (IndexedDB)
- **Build Tool**: Vite
- **Styling Solution**: Tailwind CSS

## Contribution Guidelines

Issues and code contributions are welcome! Please follow these steps:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)

## Contact

If you have any questions or suggestions, please contact us:

- Project Repository: [https://github.com/Coder-King3/king-images](https://github.com/Coder-King3/king-images)
- Email: w2196592083@gmail.com

## Acknowledgements

> This project has received support and help from the following projects, for which we express our sincere gratitude!

#### Image Upload Functionality

- **Project**: [bilibili-img-uploader](https://github.com/xlzy520/bilibili-img-uploader)
- **Contribution**: Provided image upload solutions based on Bilibili API
- **Author**: [@xlzy520](https://github.com/xlzy520)

#### QR Code Login and User Information Retrieval

- **Project**: [bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect)
- **Contribution**: Provided complete Bilibili API documentation and implementation solutions for QR code login, user information retrieval, and other functions
- **Author**: [@SocialSisterYi](https://github.com/SocialSisterYi)

---

[中文文档](README.md)
