# Contributing to TabTherapist 🤝

Thank you for your interest in contributing to TabTherapist!.

## How to Contribute

### Bug Reports

Found a bug? Please open an issue with:
- A clear title and description
- Steps to reproduce
- Expected vs. actual behavior
- Your Chrome version and OS

### Feature Requests

Have an idea? We'd love to hear it! Open an issue describing:
- What feature you'd like
- Why it would be useful
- Any technical considerations

### Pull Requests

1. **Fork** the repository
2. **Create a branch** for your feature: `git checkout -b feature/your-feature`
3. **Make changes** following the code style below
4. **Test thoroughly** in Chrome (use `chrome://extensions/` developer mode)
5. **Commit clearly**: `git commit -m "feat: add awesome feature"`
6. **Push** and open a pull request with a clear description

## Code Style

- **Vanilla JavaScript** – No frameworks; keep dependencies minimal
- **Variables**: `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants
- **Comments**: Minimal; code should be self-documenting
- **Spacing**: 2-space indentation
- **No console.log**: Remove debug logs before committing

## Testing Checklist

Before submitting a PR:
- ✅ Test in Chrome Extensions (load unpacked)
- ✅ Check the popup renders without errors
- ✅ Verify all action buttons work (close, merge, archive)
- ✅ Test scorecard generation and download
- ✅ Check social sharing buttons open correct URLs
- ✅ Inspect DevTools for console errors

## Architecture Notes

- **background/service-worker.js**: Tab monitoring and action execution
- **popup/popup.js**: UI logic and communication with service worker
- **utils/analyzer.js**: Tab hoarding score calculation (no external APIs)
- **scorecard/scorecard.js**: Canvas-based PNG generation

Keep these concerns separate. New features should extend existing modules, not create new dependencies.

## Questions?

Feel free to open an issue for discussions, or check out the [README](README.md) for project overview.

Happy coding! 🚀
