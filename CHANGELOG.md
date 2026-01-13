# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- AI Image Generation with Fal.ai (FLUX 2 Pro, FLUX 2 Dev, Nano Banana models)
- Style presets for AI generation (Comic Book, Manga, Realistic, Retro)
- Advanced generation mode with structured prompts (scene, character, lighting, composition)
- AI-powered prompt enhancement using Gemini
- Character references and LoRA integration for consistent character appearance
- Custom CivitAI model support per series
- Generation history (last 20 prompts per project)
- Story AI chat assistant with vision capabilities
- Multiple LLM providers (Gemini, Claude, GPT, Llama, ByteDance Seed)
- Page capture and image upload for Story AI visual context
- Custom story prompts per series for consistent AI guidance
- Credit system for AI features via Supabase Edge Functions
- Image element defaults in project settings (opacity, border, corners)
- Unified features agent for Claude Code (`/features`) and GitHub Copilot
- Shared instruction files in `.github/instructions/`

### Changed
- Documentation moved from USER_MANUAL.md to in-app docs pages (`src/docs/`)

### Removed
- USER_MANUAL.md (replaced by docs pages)
