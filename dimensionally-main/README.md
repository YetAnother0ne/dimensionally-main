# Dimensionally - 2D to 3D Conversion Platform

Transform 2D images into stunning 3D models or convert 3D models to 2D renders. Export in FBX, OBJ, GLTF, STL and more for games, animation, and 3D printing.

## Features

- **2D to 3D Conversion**: Convert 2D images to 3D models using automated methods
- **3D to 2D Rendering**: Render 3D models to 2D images
- **Multiple Export Formats**: Support for FBX, OBJ, GLTF, GLB, STL, USDZ, DAE
- **Automated conversion**: Uses a configurable conversion service for 3D generation

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Optional API token for external conversion services (if applicable)

### Installation

```sh
# Clone the repository
git clone <YOUR_REPO_URL>

# Navigate to project directory
cd dimensionally-main

# Install dependencies
npm install

# Create .env.local file with your API token
cp .env.example .env.local
# Edit .env.local and add your VITE_REPLICATE_API_TOKEN
```

### Running the Development Server

```sh
npm run dev
```

The application will be available at `http://localhost:5173`

## Configuration

### Setting up 2D to 3D Conversion (Optional)

This project supports hooking into an external conversion service for producing 3D models from 2D images. Steps will vary depending on the service you choose.

1. Configure credentials for your chosen service in `.env.local` (if required).
2. Start the dev server: `npm run dev`.
3. Use the Conversion section to upload images and trigger a conversion.
4. Download the resulting 3D model when the conversion completes.

### API Details

- **Service**: Hugging Face Inference API
- **Model**: TripoSR (3D generation from single images)
- **Cost**: FREE tier available (no credit card needed)
- **Rate Limits**: Free tier has rate limits but plenty for testing
- **Quality**: High-quality 3D generation from 2D images

## Build & Deployment

### Build for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Deploying to GitHub Pages

This repository includes a GitHub Actions workflow that builds the project and deploys the `dist` directory to GitHub Pages on every push to `main`.

- The workflow automatically computes the correct `VITE_BASE`:
  - If your repo is named `<owner>.github.io` (a user/org site), the site will be deployed at `/`.
  - Otherwise (project site), the site will be deployed at `/<repo>/` and Vite is built with that base.

To use it:
- Push your code to `main` (or merge a PR into `main`). The `pages` workflow will run and publish the site.
- Optionally configure a custom domain in the repository settings or add a `CNAME` file to the `dist/` output.

Manual deploy (alternative):
- If you prefer to deploy manually, we added a `deploy` script that uses the `gh-pages` package. Run:

```sh
npm ci
npm run deploy
```

This builds the site and publishes the `dist/` folder to the `gh-pages` branch for project pages.

### Run Tests

```sh
npm run test
npm run test:watch  # Watch mode
```

### Lint Code

```sh
npm lint
```

## Technologies

- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **3D Graphics**: Three.js with React Three Fiber
- **UI Components**: shadcn-ui with Radix UI
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **API**: Configurable conversion service (provider of your choice)
- **Testing**: Vitest + React Testing Library

## Project Structure

```
src/
├── components/        # React components
│   ├── ConversionSection.tsx  # Main conversion UI
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   └── ui/           # UI components from shadcn-ui
├── hooks/            # Custom React hooks
│   └── use-conversion.ts
├── lib/              # Utilities and services
│   ├── image-to-3d-service.ts  # 2D→3D conversion API
│   └── three-renderer.ts       # 3D→2D rendering
├── pages/            # Page components
└── test/             # Test files
```

## How It Works

### 2D to 3D Conversion

1. User uploads a 2D image (PNG, JPG, WebP)
2. Image is sent to a configured conversion service
3. The service generates a 3D model (GLB or other formats depending on configuration)
4. User can download the 3D model in their preferred format

### 3D to 2D Rendering

1. User uploads a 3D model (FBX, OBJ, GLTF, GLB)
2. Model is loaded using Three.js
3. Rendered to a 2D image (PNG, JPG, WebP)
4. User can download the rendered image

## Limitations & Future Work

- Format conversion from GLB to other 3D formats (FBX, OBJ) - currently returns GLB
- Photogrammetry method for 3D generation - coming soon
- Batch processing support - future enhancement

## Contributing

Feel free to fork, modify, and improve this project!

## License

This project is open source. Check the LICENSE file for details.

## Support

For issues or questions:
- Create an issue in the repository
- Check the documentation of your chosen conversion service for API help
