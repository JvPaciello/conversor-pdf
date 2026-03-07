# Conversor PDF BR

[Converter PDF BR](https://www.converterpdfbr.com.br/) is a free and fast online tool to convert various file formats into PDF documents without requiring user registration or login. The conversions run smoothly and directly in your browser.

## Features

- **Word to PDF**: Convert `.doc` and `.docx` text files to PDF.
- **Excel to PDF**: Transform your `.xls`, `.xlsx`, and `.csv` spreadsheets into PDF files.
- **JPG to PDF**: Convert `.jpg`, `.jpeg`, and `.png` image files to single-page PDF documents.
- **Responsive Layout**: Designed to work on any device (Desktop, Tablet, Mobile) using [Tailwind CSS v4](https://tailwindcss.com/docs).
- **Client-side Processing**: PDF generation runs locally using libraries like `html2pdf.js` and `xlsx`, ensuring better privacy as files are not uploaded to a backend server.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (Pages Router)
- **Library**: React
- **Styling & Theming**: [Tailwind CSS v4](https://tailwindcss.com/) & `next-themes` (Dark Mode Support)
- **Icons**: [Lucide React](https://lucide.dev)
- **Testing**: [Jest](https://jestjs.io/) & React Testing Library
- **PDF Generation**: [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)
- **Excel Parsing**: [SheetJS (xlsx)](https://sheetjs.com/)
- **Word Parsing**: [Mammoth](https://github.com/mwilliamson/mammoth.js/)

## Getting Started

First, install the dependencies if you haven't already:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/pages/`: Contains the main application routes and API endpoints. 
  - `index.js`: The landing page with tool selection.
  - `conversores/`: The specific converter pages (Word, Excel, JPG).
- `src/components/`: Reusable React components (`Navbar`, `Footer`, `CookieBanner`).
- `src/styles/`: Contains global styles using Tailwind CSS imports.
- `public/`: Static assets.

## Deployment

The live application is currently deployed at: https://www.converterpdfbr.com.br/

It can easily be deployed on [Vercel](https://vercel.com/) or any platform that supports Next.js applications.
