# Third-party notices

## Rune

Parts of the black hole's live shader are ported from Rune
(https://github.com/anomalyco/rune), translated from WGSL to GLSL. No Rune
code is shipped as a dependency; only the shader logic named below was
re-implemented.

| Ported logic | Rune source file | Used in |
|---|---|---|
| `gauss`, `bloom` (two-lobe falloff) and the soft-knee idea, for the soft ring glow | `crates/rune-fx/src/shaders/common.wgsl`, `crates/rune-fx/src/shaders/glow.wgsl` (variant 0) | `src/components/scene/BlackHole.tsx` |

Rune's license (MIT), reproduced as required:

```
MIT License

Copyright (c) 2026 Anomaly

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

GitHub's license badge for the repository shows no license; the `LICENSE`
file in the repository is the MIT text above (checked 2026-11-09).
