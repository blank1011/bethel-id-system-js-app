# Bethel ID Automation Tool

Desktop app for generating Bethel International School student ID cards from Excel data.

This project uses React + Vite for the UI and Electron for desktop file export access.

## What This App Does

- Loads student records from Excel
- Renders front and back ID card previews
- Supports front and back template image upload
- Lets you adjust text positions and font sizes with a live layout editor
- Exports:
	- Current student (front and back PNG)
	- All students in batch
- Saves files automatically to your Pictures directory (no browser download prompts)

## Output Folder Structure

The app saves files here:

Windows Pictures/Bethel ID Students/StudentName/

Each student folder contains:

- StudentName_FRONT.png
- StudentName_BACK.png

## Required Excel Columns

Use an Excel file with these fields (case-insensitive matching is supported):

- Fname
- Lname
- Mname
- Student Number
- LRN
- Birthday
- Father
- Mother
- Address
- Contact Father
- Contact Mother
- Photo (insert the image inside the cell)

For photos, add a `Photo` column and insert one image into each student's Photo
cell. The app matches the embedded image to the student by its Excel row, then
automatically crops it into the photo frame on the ID front. Use the Position
Editor to adjust other ID fields. The photo frame stays fixed, while the Photo
Crop controls let you zoom and reposition the image inside the frame.

## Quick Start (Portable Use, No Install)

1. Build the desktop app:

	 npm run electron-build

2. Launch the app by double-clicking one of these:

	 - Open Bethel ID.cmd
	 - Bethel ID Portable.lnk
	 - dist/win-unpacked/Bethel ID.exe

## Development Mode

Run the app with hot reload:

npm run dev

This starts:

- Vite dev server
- Electron desktop window

## Available Scripts

- npm run dev
	- Run Vite + Electron for development
- npm run build
	- Build web assets to dist
- npm run electron-build
	- Build production assets and package Electron app
- npm run lint
	- Run ESLint

## Typical Workflow

1. Open app
2. Load Excel file
3. Load front and back templates
4. Set validity and optional signature
5. (Optional) adjust layout positions
6. Export current or export all
7. Click Clear Loaded Batch to reset for the next set

## Troubleshooting

### Electron API not available

Cause: App opened in browser mode instead of Electron.

Fix:

- Use Open Bethel ID.cmd or dist/win-unpacked/Bethel ID.exe
- Do not use only localhost in a regular browser for desktop export

### White screen in packaged app

Cause: Old packaged binary.

Fix:

1. Close all running app windows
2. Rebuild:

	 npm run electron-build

3. Reopen dist/win-unpacked/Bethel ID.exe

### Batch export produces black images

Fix already applied in current codebase:

- Off-screen batch render area stays paintable
- PNG capture uses safe options for background and cache busting

If this returns, rebuild and relaunch packaged app.

### Build fails with EPERM on dist/win-unpacked

Cause: Windows file lock while the app is open.

Fix:

- Close Bethel ID app before running electron-build

## Tech Stack

- React 19
- Vite 8
- Electron
- ExcelJS
- html-to-image

## Notes

- This repository currently uses default app icon/signing settings.
- If needed, add custom icon and metadata in package.json build config for distribution polish.
