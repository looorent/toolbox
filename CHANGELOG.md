# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.10] - 2026-04-04

* [Feature] UUID Generator — UUIDv7 support (generate time-ordered UUIDs, version selector, inline timestamp display)
* [Feature] UUID Analyzer — paste any UUID to detect its version and extract the embedded timestamp from v7 UUIDs

## [1.0.9] - 2026-03-24

* [Technical] Upgrade TypeScript 5.9 → 6.0, Vite 7 → 8, jsdom 28 → 29
* [Technical] Remove deprecated `baseUrl` from tsconfig files (TS 6 migration)
* [Technical] Fix `codemirror` package version (was mis-tagged CM5 release)

## [1.0.8] - 2026-03-24

* [Feature] JWT Forger

## [1.0.7] - 2026-03-09

* [Technical] Replace the use of Parquet files with smaller JSON files. Otherwise, a resource limitation error occurs on Cloudflare Workers (free tier) when decoding Parquet files (even with read stream)

## [1.0.6] - 2026-03-07

* [Feature] Script to generate Parquet files containing mappings between Wiegand26 and text licence plates
* [Feature] Endpoint to find matching plates for Wiegand26

## [1.0.5] - 2026-03-06

* [Feature] Convert an image into base64
* [Bug] The hamburger menu does not open on click
* [Feature] Update theme and design system to follow `Frosted Sage` visuals

## [1.0.4] - 2026-03-05

* [Technical] Removed TailwindCSS dependencies and utility classes across all components.
* [Technical] Implemented a custom CSS architecture for layouts and UI elements.
* [Technical] Integrated a Storybook design system for isolated component development and documentation.
* [Feature] Deploy Storybook documentation under https://design.looorent.com
 
## [1.0.3] - 2026-03-03

* [Feature] Image to SVG — convert raster images to SVG vector graphics using VTracer WASM, with preset configurations (Default, Smallest file, High fidelity, Pixel art, Posterized) and collapsible advanced parameter panel
  
## [1.0.2] - 2026-02-24

* [Feature] SCIM 2.0 Server — create isolated SCIM endpoints with full User and Group CRUD, sample data pre-population, and built-in API documentation
* [Bug] The QR Code Generator's correction level toggle does not work

## [1.0.1] - 2026-02-23

* [Feature] Webhook catcher

## [1.0.0] - 2026-02-18

* Original commit: Portage from `StencilJS` to `Vue`