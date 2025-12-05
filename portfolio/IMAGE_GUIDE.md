# Image Organization Guide

This guide explains how to manually organize and manage images for your portfolio website.

## 📁 Folder Structure

```
assets/images/portfolio/
├── editorial/
│   ├── thumbnails/    (400x400px recommended)
│   └── full/          (1200-2000px width recommended)
├── fashion/
│   ├── thumbnails/
│   └── full/
├── landscape/
│   ├── thumbnails/
│   └── full/
├── portrait/
│   ├── thumbnails/
│   └── full/
├── commercial/
│   ├── thumbnails/
│   └── full/
├── documentary/
│   ├── thumbnails/
│   └── full/
├── hero/              (Hero section images)
├── about/             (About page images)
└── gallery/           (General gallery images)
```

## 🖼️ Image Specifications

### Thumbnails
- **Size:** 400x400px (square) or 400x600px (portrait)
- **Format:** JPG (quality 85%) or WebP (better compression)
- **File naming:** `project-name-thumb.jpg`
- **Purpose:** Used in portfolio grid and previews

### Full Images
- **Size:** 1200-2000px width (maintain aspect ratio)
- **Format:** JPG (quality 90%) or WebP
- **File naming:** `project-name-full.jpg`
- **Purpose:** Used in lightbox, detail pages, and full views

### Hero Images
- **Size:** 1920-2560px width
- **Format:** JPG (quality 90%)
- **File naming:** `featured-hero.jpg` or descriptive name

### About Images
- **Size:** 800-1200px width
- **Format:** JPG (quality 90%)
- **File naming:** `artur-portrait.jpg` or descriptive name

## ➕ Adding New Images

### Step 1: Prepare Your Images

1. **Resize/Create Thumbnail Version**
   - Use Photoshop, GIMP, or online tools like [Squoosh](https://squoosh.app/)
   - Resize to 400x400px (or 400x600px for portraits)
   - Save as JPG with 85% quality

2. **Optimize Full-Size Version**
   - Resize to 1200-2000px width (maintain aspect ratio)
   - Save as JPG with 90% quality
   - Or use WebP format for better compression

3. **Name Files Consistently**
   - Use lowercase with hyphens: `project-name-thumb.jpg`
   - Be descriptive but concise
   - Avoid spaces and special characters

### Step 2: Add Files to Folders

1. Place thumbnail in: `assets/images/portfolio/[category]/thumbnails/`
2. Place full image in: `assets/images/portfolio/[category]/full/`

**Example:**
- Thumbnail: `assets/images/portfolio/editorial/thumbnails/echoes-sound-thumb.jpg`
- Full: `assets/images/portfolio/editorial/full/echoes-sound-full.jpg`

### Step 3: Update JSON File

Open `portfolio/data/images.json` and add a new entry to the appropriate category:

```json
{
  "id": "editorial-002",
  "title": "Your Project Title",
  "description": "A brief description of the project",
   "thumbnail": "assets/images/portfolio/editorial/thumbnails/your-image-thumb.jpg",
   "full": "assets/images/portfolio/editorial/full/your-image-full.jpg",
  "category": "Editorial",
  "year": "2024",
  "client": "Client Name (or 'Independent')"
}
```

**Important Notes:**
- `id` must be unique: use format `category-number` (e.g., `editorial-002`, `fashion-003`)
- `thumbnail` and `full` paths are relative to the HTML file location
- Use `../` to go up one directory level from `portfolio/` to root
- `category` should match the folder name (Editorial, Fashion, Landscape, etc.)

### Step 4: Test

1. Save the JSON file
2. Refresh your website
3. Check that images load correctly
4. Verify thumbnails appear in the portfolio grid
5. Test full-size images in lightbox/detail view

## 🔄 Updating Existing Images

1. Replace the image files in the folders (keep same filename)
2. Or update the paths in `images.json` if you renamed files
3. No need to change JSON if only replacing files with same names

## 🗑️ Removing Images

1. Delete the image files from folders
2. Remove the entry from `images.json`
3. Save and refresh

## 📋 Image Entry Template

Copy this template when adding new images:

```json
{
  "id": "category-XXX",
  "title": "Project Title",
  "description": "Project description",
   "thumbnail": "assets/images/portfolio/category/thumbnails/filename-thumb.jpg",
   "full": "assets/images/portfolio/category/full/filename-full.jpg",
  "category": "Category Name",
  "year": "2024",
  "client": "Client Name"
}
```

## 🎨 Best Practices

1. **Consistent Naming:** Use the same naming convention for all images
2. **Optimize File Sizes:** Compress images to reduce load times
3. **Maintain Aspect Ratios:** Don't distort images when resizing
4. **Use WebP When Possible:** Better compression than JPG
5. **Keep Backups:** Always keep original high-resolution files
6. **Organize by Project:** Group related images together
7. **Update JSON Regularly:** Keep the JSON file in sync with your files

## 🛠️ Tools for Image Processing

- **Online:** [Squoosh](https://squoosh.app/), [TinyPNG](https://tinypng.com/)
- **Desktop:** Photoshop, GIMP, ImageOptim (Mac)
- **Batch Processing:** ImageMagick, XnConvert

## ❓ Troubleshooting

**Images not showing?**
- Check file paths in JSON match actual file locations
- Verify file names match exactly (case-sensitive)
- Check browser console for 404 errors
- Ensure paths use `../` correctly for relative paths

**Images loading slowly?**
- Optimize file sizes (compress images)
- Use WebP format
- Consider using a CDN or image optimization service

**JSON errors?**
- Validate JSON syntax at [jsonlint.com](https://jsonlint.com/)
- Check for missing commas or brackets
- Ensure all strings are in quotes

## 📝 Quick Reference

- **JSON File:** `portfolio/data/images.json`
- **Admin Page:** `portfolio/img-mgr-ref-2024.html` (reference guide - renamed for security)
- **Image Loader:** `portfolio/js/imageLoader.js` (automatically loads images)
- **Main HTML:** `portfolio/photography-index.html` (displays images)

---

**Need help?** Check the admin page at `portfolio/img-mgr-ref-2024.html` for a visual guide!

