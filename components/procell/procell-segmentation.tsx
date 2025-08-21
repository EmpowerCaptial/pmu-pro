"use client"

import { useRef, useState } from "react"

/**
 * ProcellSegmentation
 * - Upload an image for analysis
 * - Pixel-level segmentation for:
 *   • Hyperpigmentation (Yellow)
 *   • Sunburn/Erythema (Orange)
 *   • Texture: scars/craters (Blue) via Laplacian
 * - Region stats (forehead/cheeks/nose/chin)
 * - Download annotated result
 *
 * No external libs. Runs entirely client-side.
 */

export default function ProcellSegmentation() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [imgName, setImgName] = useState("")
  const [opacity, setOpacity] = useState(0.45)

  const imgRef = useRef<HTMLImageElement>(null)
  const baseCanvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)

  const regions = [
    { key: "forehead", label: "Forehead", box: { x: 0.2, y: 0.05, w: 0.6, h: 0.22 } },
    { key: "leftCheek", label: "Left Cheek", box: { x: 0.08, y: 0.3, w: 0.32, h: 0.28 } },
    { key: "rightCheek", label: "Right Cheek", box: { x: 0.6, y: 0.3, w: 0.32, h: 0.28 } },
    { key: "nose", label: "Nose", box: { x: 0.43, y: 0.32, w: 0.14, h: 0.24 } },
    { key: "chin", label: "Chin", box: { x: 0.33, y: 0.62, w: 0.34, h: 0.22 } },
  ]

  const legend = [
    { label: "Hyperpigmentation", color: "rgba(255, 223, 0, OP)", swatch: "#FFDF00" }, // Yellow
    { label: "Sunburn/Erythema", color: "rgba(255, 140, 0, OP)", swatch: "#FF8C00" }, // Orange
    { label: "Texture / Scars", color: "rgba(30, 144, 255, OP)", swatch: "#1E90FF" }, // Blue
  ]

  // --- Utilities ---
  const toHSV = (r: number, g: number, b: number) => {
    const rn = r / 255,
      gn = g / 255,
      bn = b / 255
    const max = Math.max(rn, gn, bn),
      min = Math.min(rn, gn, bn)
    const d = max - min
    let h = 0
    if (d !== 0) {
      switch (max) {
        case rn:
          h = ((gn - bn) / d) % 6
          break
        case gn:
          h = (bn - rn) / d + 2
          break
        case bn:
          h = (rn - gn) / d + 4
          break
        default:
          break
      }
      h *= 60
      if (h < 0) h += 360
    }
    const s = max === 0 ? 0 : d / max
    const v = max
    return { h, s, v }
  }

  // 3x3 Laplacian kernel for texture (edges/roughness)
  const laplacianMagnitude = (imgData: Uint8ClampedArray, x: number, y: number, w: number, h: number) => {
    // convert neighborhood to grayscale & apply kernel
    const k = [0, 1, 0, 1, -4, 1, 0, 1, 0]
    let acc = 0
    let idx = 0
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const xx = Math.min(Math.max(x + i, 0), w - 1)
        const yy = Math.min(Math.max(y + j, 0), h - 1)
        const p = (yy * w + xx) * 4
        const r = imgData[p],
          g = imgData[p + 1],
          b = imgData[p + 2]
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        acc += gray * k[idx++]
      }
    }
    return Math.abs(acc)
  }

  const drawImageToCanvas = (img: HTMLImageElement) => {
    const base = baseCanvasRef.current
    const overlay = overlayCanvasRef.current
    if (!base || !overlay) return
    
    const maxW = 900 // keep big enough for clarity but friendly for laptops
    const scale = img.width > maxW ? maxW / img.width : 1
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)

    base.width = w
    base.height = h
    overlay.width = w
    overlay.height = h

    const ctx = base.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)

    // clear overlay
    const overlayCtx = overlay.getContext("2d")
    if (overlayCtx) overlayCtx.clearRect(0, 0, w, h)
  }

  const runSegmentation = async () => {
    setLoading(true)
    const base = baseCanvasRef.current
    const overlay = overlayCanvasRef.current
    if (!base || !overlay) {
      setLoading(false)
      return
    }
    const bctx = base.getContext("2d")
    const octx = overlay.getContext("2d")
    if (!bctx || !octx) {
      setLoading(false)
      return
    }
    const { width: w, height: h } = base

    const { data } = bctx.getImageData(0, 0, w, h)

    // Masks (Uint8 arrays): 0 or 1 for each pixel
    const maskPig = new Uint8Array(w * h)
    const maskSun = new Uint8Array(w * h)
    const maskTex = new Uint8Array(w * h)

    // Enhanced Heuristics with better accuracy:
    // Hyperpigmentation: darker (low V), decent saturation
    const PIG_V_MAX = 0.5 // lower brightness
    const PIG_S_MIN = 0.18 // some saturation

    // Improved Sunburn/Erythema detection with multiple criteria
    // More conservative thresholds to reduce false positives
    const SUN_R_MINUS_G = 25 // Increased threshold for red dominance
    const SUN_R_MINUS_B = 25 // Increased threshold for red dominance
    const SUN_MIN_R = 120 // Higher minimum red value
    const SUN_MAX_V = 0.85 // Maximum brightness for sunburn detection
    const SUN_MIN_S = 0.3 // Minimum saturation for sunburn

    // Texture/Scars: Laplacian magnitude threshold (edges/roughness)
    // scale-sensitive; auto-threshold with simple percentile estimate after a pass
    const lap = new Float32Array(w * h)
    // Compute quick laplacian map (skip 1px border)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x
        lap[idx] = laplacianMagnitude(data, x, y, w, h)
      }
    }
    // Estimate texture threshold as 90th percentile
    const lapSample = []
    for (let i = 0; i < lap.length; i += 30) lapSample.push(lap[i])
    lapSample.sort((a, b) => a - b)
    const texThreshold = lapSample[Math.floor(lapSample.length * 0.9)] || 28

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x
        const p = idx * 4
        const r = data[p],
          g = data[p + 1],
          b = data[p + 2],
          a = data[p + 3]
        if (a < 10) continue

        const { h: H, s: S, v: V } = toHSV(r, g, b)

        // Hyperpigmentation
        if (V <= PIG_V_MAX && S >= PIG_S_MIN) {
          maskPig[idx] = 1
        }

        // Enhanced Sunburn/Erythema detection with multiple criteria
        if (r - g >= SUN_R_MINUS_G && r - b >= SUN_R_MINUS_B && r >= SUN_MIN_R) {
          // Additional criteria to reduce false positives
          if (V <= SUN_MAX_V && S >= SUN_MIN_S) {
            // Check if this is likely natural skin tone variation vs actual sunburn
            // Natural skin tones typically have more balanced RGB ratios
            const skinToneRatio = Math.abs(r - g) / Math.max(r, g, b)
            if (skinToneRatio > 0.15) { // Only flag if significantly red-dominant
              maskSun[idx] = 1
            }
          }
        }

        // Texture (roughness/scars)
        if (lap[idx] >= texThreshold) {
          maskTex[idx] = 1
        }
      }
    }

    // Optional light smoothing of masks
    const smooth = (mask: Uint8Array) => {
      const out = new Uint8Array(mask.length)
      const rad = 1
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          let sum = 0
          for (let j = -rad; j <= rad; j++) {
            for (let i = -rad; i <= rad; i++) {
              sum += mask[(y + j) * w + (x + i)]
            }
          }
          out[y * w + x] = sum >= 5 ? 1 : 0 // majority filter
        }
      }
      return out
    }

    const pigS = smooth(maskPig)
    const sunS = smooth(maskSun)
    const texS = smooth(maskTex)

    // Draw overlays
    octx.clearRect(0, 0, w, h)
    const drawMask = (mask: Uint8Array, rgba: number[]) => {
      const img = octx.getImageData(0, 0, w, h)
      const d = img.data
      const [rr, gg, bb, aa] = rgba
      for (let i = 0; i < mask.length; i++) {
        if (mask[i]) {
          const p = i * 4
          // alpha blend over existing overlay pixels
          const srcA = aa
          const dstA = d[p + 3] / 255
          const outA = srcA + dstA * (1 - srcA)

          const blend = (srcC: number, dstC: number) => (srcC * srcA + dstC * dstA * (1 - srcA)) / (outA || 1)

          d[p] = blend(rr / 255, d[p] / 255) * 255
          d[p + 1] = blend(gg / 255, d[p + 1] / 255) * 255
          d[p + 2] = blend(bb / 255, d[p + 2] / 255) * 255
          d[p + 3] = outA * 255
        }
      }
      octx.putImageData(img, 0, 0)
    }

    const op = Math.max(0.05, Math.min(0.95, opacity))
    drawMask(pigS, [255, 223, 0, op]) // Yellow
    drawMask(sunS, [255, 140, 0, op]) // Orange
    drawMask(texS, [30, 144, 255, op]) // Blue

    // Region stats
    const regionStats: Record<string, any> = {}
    regions.forEach((rg) => {
      const rx = Math.round(rg.box.x * w)
      const ry = Math.round(rg.box.y * h)
      const rw = Math.round(rg.box.w * w)
      const rh = Math.round(rg.box.h * h)

      let tot = 0,
        pig = 0,
        sun = 0,
        tex = 0
      for (let yy = ry; yy < ry + rh; yy++) {
        for (let xx = rx; xx < rx + rw; xx++) {
          const idx = yy * w + xx
          tot++
          if (pigS[idx]) pig++
          if (sunS[idx]) sun++
          if (texS[idx]) tex++
        }
      }
      const pct = (n: number) => Math.round((n / Math.max(1, tot)) * 100)
      regionStats[rg.key] = {
        label: rg.label,
        areaPixels: tot,
        hyperpigmentationPct: pct(pig),
        sunburnPct: pct(sun),
        texturePct: pct(tex),
      }

      // region box outline on overlay for clarity
      octx.strokeStyle = "rgba(0,0,0,0.35)"
      octx.lineWidth = 2
      octx.strokeRect(rx, ry, rw, rh)
    })

    // Build readable summary + Procell-aligned suggestions
    const buildEnhancedSummary = (regionStats: Record<string, any>) => {
      const top = Object.values(regionStats).sort(
        (a: any, b: any) =>
          b.hyperpigmentationPct + b.sunburnPct + b.texturePct - (a.hyperpigmentationPct + a.sunburnPct + a.texturePct),
      )[0]

      // Calculate overall severity levels
      const avgHyper = Object.values(regionStats).reduce((sum: number, r: any) => sum + r.hyperpigmentationPct, 0) / regions.length
      const avgSun = Object.values(regionStats).reduce((sum: number, r: any) => sum + r.sunburnPct, 0) / regions.length
      const avgTexture = Object.values(regionStats).reduce((sum: number, r: any) => sum + r.texturePct, 0) / regions.length

      const getSeverity = (pct: number, type = "general") => {
        // Different thresholds for different skin conditions
        let thresholds = { low: 5, medium: 15, high: 30 }
        
        if (type === "sunburn") {
          // More conservative thresholds for sunburn to reduce false positives
          thresholds = { low: 8, medium: 20, high: 35 }
        } else if (type === "hyperpigmentation") {
          // Standard thresholds for hyperpigmentation
          thresholds = { low: 5, medium: 15, high: 30 }
        }
        
        if (pct < thresholds.low) return { level: "Minimal", color: "text-green-600", priority: "Low", confidence: "High" }
        if (pct < thresholds.medium) return { level: "Mild", color: "text-yellow-600", priority: "Medium", confidence: "Medium" }
        if (pct < thresholds.high) return { level: "Moderate", color: "text-orange-600", priority: "High", confidence: "Medium" }
        return { level: "Significant", color: "text-red-600", priority: "Critical", confidence: "High" }
      }

      const hyperSeverity = getSeverity(avgHyper, "hyperpigmentation")
      const sunSeverity = getSeverity(avgSun, "sunburn")
      const textureSeverity = getSeverity(avgTexture, "texture")

      return {
        primaryArea: top.label,
        severityLevels: {
          hyperpigmentation: { ...hyperSeverity, percentage: Math.round(avgHyper) },
          sunburn: { ...sunSeverity, percentage: Math.round(avgSun) },
          texture: { ...textureSeverity, percentage: Math.round(avgTexture) },
        },
        recommendations: {
          immediate: [] as string[],
          shortTerm: [] as string[],
          longTerm: [] as string[],
        },
      }
    }

    const enhancedSummary = buildEnhancedSummary(regionStats)

    // Build treatment recommendations based on severity
    if (enhancedSummary.severityLevels.sunburn.percentage > 10) {
      enhancedSummary.recommendations.immediate.push("⚠️ STOP: Defer all procedures until erythema resolves (7-14 days)")
      enhancedSummary.recommendations.immediate.push("Apply cooling, anti-inflammatory treatments")
    }

    if (enhancedSummary.severityLevels.hyperpigmentation.percentage > 15) {
      enhancedSummary.recommendations.shortTerm.push("Start strict SPF 30+ protocol 2 weeks before treatment")
      enhancedSummary.recommendations.longTerm.push("Plan 4-6 ProCell sessions, 4 weeks apart")
    }

    if (enhancedSummary.severityLevels.texture.percentage > 20) {
      enhancedSummary.recommendations.longTerm.push("Consider ProCell microchanneling for texture improvement")
      enhancedSummary.recommendations.shortTerm.push("Assess scar type: atrophic vs hypertrophic")
    }

    setSummary(enhancedSummary)
    setReport(regionStats)
    setLoading(false)
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgName(file.name)
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      drawImageToCanvas(img)
      runSegmentation()
    }
    img.src = url
  }

  const downloadAnnotated = () => {
    if (!baseCanvasRef.current || !overlayCanvasRef.current) return
    const w = baseCanvasRef.current.width
    const h = baseCanvasRef.current.height

    // composite base + overlay to a temporary canvas
    const tmp = document.createElement("canvas")
    tmp.width = w
    tmp.height = h
    const tctx = tmp.getContext("2d")
    if (!tctx) return
    tctx.drawImage(baseCanvasRef.current, 0, 0)
    tctx.drawImage(overlayCanvasRef.current, 0, 0)

    const link = document.createElement("a")
    link.download = (imgName?.replace(/\.[^.]+$/, "") || "procell-scan") + "_annotated.png"
    link.href = tmp.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 border rounded-2xl shadow-md bg-white/90 backdrop-blur-sm border-lavender/30">
      <h2 className="text-xl font-semibold text-lavender mb-3">🌸 ProCell Skin Therapies — True Segmentation Scan</h2>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: canvases */}
        <div className="w-full md:w-2/3">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={onFile}
                className="block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-lavender file:text-white hover:file:bg-lavender-600"
              />
              <p className="text-xs text-gray-600">
                Upload a well-lit, makeup-free photo (front-facing) for accurate analysis
              </p>
            </div>
          </div>

          <div className="relative w-full">
            <canvas ref={baseCanvasRef} className="w-full rounded-xl shadow-sm" />
            <canvas
              ref={overlayCanvasRef}
              className="w-full rounded-xl shadow-sm absolute inset-0 pointer-events-none"
              style={{ opacity: 1 }}
            />

            {/* Existing overlay elements */}
            <div className="absolute top-2 left-2 flex gap-2 bg-white/80 p-2 rounded-lg">
              {legend.map((l) => (
                <div key={l.label} className="flex items-center gap-1 text-xs text-gray-700">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: l.swatch }} />
                  {l.label}
                </div>
              ))}
            </div>
            <div className="absolute top-2 right-2 bg-white/80 p-2 rounded-lg text-xs">
              Overlay Opacity
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(Number.parseFloat(e.target.value))}
                onMouseUp={runSegmentation}
                onTouchEnd={runSegmentation}
                className="w-24 ml-2 align-middle"
              />
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={runSegmentation}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-lavender text-white hover:bg-lavender-600 disabled:opacity-50"
            >
              {loading ? "Analyzing…" : "Re-run Analysis"}
            </button>
            <button onClick={downloadAnnotated} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200">
              Download Annotated PNG
            </button>
          </div>
        </div>

        {/* Right: report */}
        <div className="w-full md:w-1/3">
          <div className="p-3 bg-gray-50 rounded-xl h-full">
            {summary ? (
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-lg border-l-4 border-lavender">
                  <h3 className="font-semibold text-lavender mb-2">📊 Quick Assessment</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Primary concern area:</strong> {summary.primaryArea}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Hyperpigmentation:</span>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${summary.severityLevels.hyperpigmentation.color}`}>
                          {summary.severityLevels.hyperpigmentation.level} (
                          {summary.severityLevels.hyperpigmentation.percentage}%)
                        </span>
                        <div className="text-xs text-gray-500">
                          Confidence: {summary.severityLevels.hyperpigmentation.confidence}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sunburn/Erythema:</span>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${summary.severityLevels.sunburn.color}`}>
                          {summary.severityLevels.sunburn.level} ({summary.severityLevels.sunburn.percentage}%)
                        </span>
                        <div className="text-xs text-gray-500">
                          Confidence: {summary.severityLevels.sunburn.confidence}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Texture/Scars:</span>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${summary.severityLevels.texture.color}`}>
                          {summary.severityLevels.texture.level} ({summary.severityLevels.texture.percentage}%)
                        </span>
                        <div className="text-xs text-gray-500">
                          Confidence: {summary.severityLevels.texture.confidence}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Plan for New Artists */}
                {summary && (
                <div className="bg-white p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">🎯 Action Plan</h4>

                  {summary.recommendations.immediate.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-red-600 mb-1">Immediate Actions:</h5>
                      <ul className="text-xs space-y-1">
                        {summary.recommendations.immediate.map((rec: string, i: number) => (
                          <li key={i} className="text-gray-700">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.recommendations.shortTerm.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-orange-600 mb-1">Next 2-4 Weeks:</h5>
                      <ul className="text-xs space-y-1">
                        {summary.recommendations.shortTerm.map((rec: string, i: number) => (
                          <li key={i} className="text-gray-700">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.recommendations.longTerm.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-blue-600 mb-1">Treatment Plan:</h5>
                      <ul className="text-xs space-y-1">
                        {summary.recommendations.longTerm.map((rec: string, i: number) => (
                          <li key={i} className="text-gray-700">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                )}

                {/* Beginner Tips */}
                <div className="bg-lavender/10 p-3 rounded-lg">
                  <h4 className="font-semibold text-lavender mb-2">💡 New Artist Tips</h4>
                  <ul className="text-xs space-y-1 text-gray-700">
                    <li>• Always photograph in natural light for accurate assessment</li>
                    <li>• Document before/after with same lighting conditions</li>
                    <li>• When in doubt, refer to experienced practitioner</li>
                    <li>• Never proceed with active inflammation or irritation</li>
                    <li>• Sunburn detection has been improved to reduce false positives</li>
                    <li>• Confidence scores indicate analysis reliability</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="font-medium mb-2 text-gray-600">Upload Photo</h3>
                <p className="text-sm text-gray-500">Upload a well-lit, makeup-free photo for accurate analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
