# Complete Guide to Image Enhancement: Pixel Increase and Noise Reduction

## Overview

Image enhancement for machine learning prediction involves two main objectives:
1. **Pixel Enhancement (Super-Resolution)**: Increasing image resolution and detail
2. **Noise Reduction (Denoising)**: Removing unwanted artifacts while preserving important features

This guide provides comprehensive formulas and techniques for both objectives.

## Part 1: Super-Resolution Techniques (Pixel Enhancement)

### 1.1 Traditional Interpolation Methods

#### Nearest-Neighbor Interpolation
```
I_new(x,y) = I_original(round(x/scale), round(y/scale))
```
- **Use Case**: Pixel art, simple upscaling
- **Pros**: Fast, preserves sharp edges
- **Cons**: Blocky artifacts

#### Bilinear Interpolation
```
I(x,y) = (1-α)(1-β)I(i,j) + α(1-β)I(i+1,j) + (1-α)βI(i,j+1) + αβI(i+1,j+1)
```
Where α = x - floor(x), β = y - floor(y)
- **Use Case**: General image resizing
- **Parameters**: Scale factor

#### Bicubic Interpolation
```
I(x,y) = Σ Σ I(i,j) × B_x(x-i) × B_y(y-j)
```
Where B is the bicubic basis function
- **Use Case**: High-quality image scaling
- **Parameters**: Interpolation kernel size

#### Lanczos Resampling
```
I(x) = Σ I(k) × L((x-k)/a)
L(x) = sinc(x) × sinc(x/a) for |x| < a, 0 otherwise
```
- **Parameters**: a = filter size (typically 3)
- **Use Case**: Professional image scaling

### 1.2 AI-Based Super-Resolution

#### SRCNN (Super-Resolution CNN)
```
Architecture: Y = F₃(F₂(F₁(X)))
F₁: Feature extraction (9×9 conv)
F₂: Non-linear mapping (1×1 conv)  
F₃: Reconstruction (5×5 conv)
Loss: MSE = (1/n) Σ ||Y - Y_target||²
```

#### SRGAN (Super-Resolution GAN)
```
Generator Loss: L_G = L_MSE + λ_VGG × L_VGG + λ_adv × L_adv
L_VGG = (1/W_i,j H_i,j) Σ ||φ_i,j(I_HR) - φ_i,j(G(I_LR))||²
Discriminator Loss: L_D = -log(D(I_HR)) - log(1 - D(G(I_LR)))
```

#### EDSR (Enhanced Deep Super-Resolution)
```
Residual Block: F(x) = Conv(ReLU(Conv(x))) + x
Skip Connection: Y = F_final(F_blocks(X)) + X_upsampled
```

## Part 2: Noise Reduction Techniques

### 2.1 Linear Filters

#### Gaussian Filter
```
G(x,y) = (1/(2πσ²)) × exp(-(x²+y²)/(2σ²))
I_filtered = I * G
```
- **Parameters**: σ (controls blur amount)
- **Use Case**: General smoothing, pre-processing

#### Wiener Filter
```
W(u,v) = H*(u,v) / (|H(u,v)|² + K)
F̂(u,v) = W(u,v) × G(u,v)
```
Where K = N(u,v)/S(u,v) (noise-to-signal ratio)
- **Use Case**: Deblurring when blur function is known

### 2.2 Non-Linear Filters

#### Median Filter
```
I_filtered(i,j) = median{I(i+k, j+l) | (k,l) ∈ W}
```
- **Parameters**: Window size W (typically 3×3, 5×5)
- **Use Case**: Salt & pepper noise removal

#### Bilateral Filter
```
BF[I]_p = (1/W_p) Σ G_σs(||p-q||) × G_σr(|I_p - I_q|) × I_q
W_p = Σ G_σs(||p-q||) × G_σr(|I_p - I_q|)
```
- **Parameters**: 
  - σ_s: spatial standard deviation
  - σ_r: range standard deviation
- **Optimal values**: σ_s ≈ 1.8, σ_r ≈ 2-3 × σ_noise

### 2.3 Advanced Denoising

#### Total Variation Denoising (ROF Model)
```
Minimize: E(u) = ∫|∇u|dx + (λ/2)∫|u-f|²dx
Euler-Lagrange: ∇·(∇u/|∇u|) + λ(f-u) = 0
Iterative form: u_t = ∇·(∇u/|∇u|) + λ(f-u)
```
- **Parameters**: λ (regularization, typically 0.1-0.3)
- **Use Case**: Edge-preserving denoising

#### Non-Local Means
```
u(p) = (1/C(p)) ∫ v(q) × exp(-||N(p)-N(q)||²/h²) dq
C(p) = ∫ exp(-||N(p)-N(q)||²/h²) dq
```
- **Parameters**: 
  - h: filtering parameter (∝ noise level)
  - patch size (typically 7×7)
- **Use Case**: Texture preservation

## Part 3: Image Sharpening Techniques

#### Unsharp Masking
```
I_sharp = I + α × (I - I_blur)
I_blur = I * G_σ  (Gaussian blur)
```
- **Parameters**: 
  - α: sharpening amount (0.5-2.0)
  - σ: blur amount (0.5-2.0)

#### Laplacian Sharpening
```
∇²I = ∂²I/∂x² + ∂²I/∂y²
I_sharp = I - c × ∇²I
```
Discrete Laplacian kernel:
```
[0  -1   0]
[-1  4  -1]
[0  -1   0]
```

## Part 4: Contrast Enhancement

#### Histogram Equalization
```
I_eq(i,j) = (L-1) × CDF(I(i,j))
CDF = Σ P(k) for k ≤ I(i,j)
```

#### CLAHE (Contrast Limited Adaptive HE)
```
For each tile: I_clahe = min(HE(I), clip_limit)
Interpolation between tiles for smooth result
```

#### Gamma Correction
```
I_corrected = I^(1/γ)
γ < 1: brighten image
γ > 1: darken image
```

## Part 5: Implementation Parameters

### Recommended Parameter Ranges

| Technique | Parameter | Typical Range | Optimal for ML |
|-----------|-----------|---------------|----------------|
| Gaussian Blur | σ | 0.5-3.0 | 1.0-1.5 |
| Bilateral Filter | σ_s | 1.0-3.0 | 1.8 |
| Bilateral Filter | σ_r | 2×σ_noise | 3×σ_noise |
| Total Variation | λ | 0.05-0.5 | 0.1-0.2 |
| Non-Local Means | h | 0.1×σ_noise | 0.4×σ_noise |
| Unsharp Mask | Amount | 0.5-2.0 | 1.0-1.5 |
| Gamma Correction | γ | 0.4-2.5 | 0.8-1.2 |

### Processing Pipeline for ML Enhancement

1. **Pre-processing**:
   ```
   Original → Noise Reduction → Contrast Enhancement
   ```

2. **Super-Resolution**:
   ```
   Low-Res → AI Upscaling → Post-processing
   ```

3. **Combined Approach**:
   ```
   Input → Denoising → Super-Resolution → Sharpening → Output
   ```

## Part 6: Quality Metrics

#### Peak Signal-to-Noise Ratio (PSNR)
```
PSNR = 20 × log₁₀(MAX_I / √MSE)
MSE = (1/mn) Σᵢ Σⱼ [I(i,j) - K(i,j)]²
```

#### Structural Similarity Index (SSIM)
```
SSIM(x,y) = [(2μ_x μ_y + c₁)(2σ_xy + c₂)] / [(μ_x² + μ_y² + c₁)(σ_x² + σ_y² + c₂)]
```

## Implementation Notes

- **For ML preprocessing**: Focus on noise reduction while preserving features
- **For super-resolution**: AI methods (SRGAN, EDSR) generally outperform traditional methods
- **Parameter tuning**: Use validation data to optimize parameters for your specific use case
- **Computational efficiency**: Traditional methods are faster; AI methods provide better quality

This comprehensive guide provides the mathematical foundation for implementing image enhancement algorithms tailored for machine learning applications.