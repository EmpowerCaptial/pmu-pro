"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSaveToClient } from "@/hooks/use-save-to-client"
import { pigmentLibrary } from "@/lib/pigment-data"
import { SaveToClientPrompt, ToolResult } from "@/components/client/save-to-client-prompt"
// PMU GUIDE – Brow Pigment Color Correction (PerfectCorp-style)
// Drop-in React component for v0.dev. Tailwind + Framer Motion.
// Upgrades in this version:
// 1) PerfectCorp-inspired UI (glassmorphism, gradients, animated cards)
// 2) True AI Vision hook: calls /api/pigment-analyze to replace heuristics when enabled
// 3) Multi-brand tech sheets: link out per recommendation
// 4) Inventory tie-in: shows in-stock badges & quick-order links
// 5) Real-time before/after: tint only the selected region via canvas blending

// --- CONFIG ---
const USE_AI_DEFAULT = true // flip to true to default to API analysis
const DEFAULT_TARGET_HEX = "#7a5533" // rich neutral brown

// Known brand tech sheet links (edit to your preferred sources)
const TECH_SHEETS: Record<string, string> = {
  Permablend: "https://perma-blend.com/pages/resources",
  "Li Pigments": "https://lipigments.com/pages/technical",
  "Tina Davies": "https://tinadavies.com/pages/resources",
  "Brow Daddy": "https://perma-blend.com/pages/brow-daddy",
}

// Inventory endpoint (optional): GET /api/inventory?skus=comma,separated → { sku: { stock: number, url: string } }
// If you don't have one yet, cards will still render without stock labels.

// --- Utility: clamp, blend, rgb↔hsv/hex ---
const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n))

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  const v = max
  return { h, s, v }
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = v - c
  let r1 = 0,
    g1 = 0,
    b1 = 0
  if (0 <= h && h < 60) {
    r1 = c
    g1 = x
    b1 = 0
  } else if (60 <= h && h < 120) {
    r1 = x
    g1 = c
    b1 = 0
  } else if (120 <= h && h < 180) {
    r1 = 0
    g1 = c
    b1 = x
  } else if (180 <= h && h < 240) {
    r1 = 0
    g1 = x
    b1 = c
  } else if (240 <= h && h < 300) {
    r1 = x
    g1 = 0
    b1 = c
  } else {
    r1 = c
    g1 = 0
    b1 = x
  }
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) }
}

function blendRgb(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number): { r: number; g: number; b: number } {
  return {
    r: Math.round(a.r * (1 - t) + b.r * t),
    g: Math.round(a.g * (1 - t) + b.g * t),
    b: Math.round(a.b * (1 - t) + b.b * t),
  }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  const h = (n: number): string => n.toString(16).padStart(2, "0")
  return `#${h(r)}${h(g)}${h(b)}`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace("#", "")
  return {
    r: Number.parseInt(m.slice(0, 2), 16),
    g: Number.parseInt(m.slice(2, 4), 16),
    b: Number.parseInt(m.slice(4, 6), 16),
  }
}

// --- Heuristic classification (fallback when AI off/unavailable) ---
function classifyCast(rgb: { r: number; g: number; b: number }): { key: string; label: string } {
  const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b)
  if (v < 0.35 && s < 0.25) return { key: "blue_gray", label: "Cool Gray/Blue (Ashy)" }
  if (h >= 200 && h <= 260 && s >= 0.15) return { key: "blue_gray", label: "Blue/Steel" }
  if ((h >= 340 || h <= 20) && s >= 0.28) return { key: "red_pink", label: "Red/Pink" }
  if (h > 20 && h <= 45 && s >= 0.25) return { key: "over_warm", label: "Over-Warm/Orange" }
  if (h >= 280 && h <= 330 && s >= 0.2) return { key: "purple", label: "Purple/Magenta" }
  if (h >= 70 && h <= 140 && s >= 0.18) return { key: "green", label: "Green/Olive" }
  return { key: "neutral", label: "Neutral/Soft" }
}

const DEFAULT_CORRECTOR_MAP: Record<string, any> = {
  blue_gray: {
    label: "Neutralize cool gray/blue with WARM ORANGE/PEACH base",
    hue: 25,
    sat: 0.75,
    val: 0.75,
    brands: {
      Permablend: ["Warm Modifier (Orange)", "Pumpkin"],
      "Li Pigments": ["Orange Crush", "Warm Modifier"],
      "Tina Davies": ["Sunset (Warm)"],
      "Brow Daddy": ["Warm/Gold Modifier"],
    },
  },
  red_pink: {
    label: "Neutralize red/pink with OLIVE/GREEN base",
    hue: 110,
    sat: 0.55,
    val: 0.65,
    brands: {
      Permablend: ["Olive Corrector"],
      "Li Pigments": ["Olive/Green Corrector"],
      "Tina Davies": ["Olive Balancer"],
      "Brow Daddy": ["Olive/Neutralizer"],
    },
  },
  purple: {
    label: "Neutralize purple with YELLOW base",
    hue: 55,
    sat: 0.75,
    val: 0.85,
    brands: {
      Permablend: ["Yellow Corrector"],
      "Li Pigments": ["Yellow/Gold Modifier"],
      "Tina Davies": ["Gold/Yellow"],
      "Brow Daddy": ["Gold Modifier"],
    },
  },
  green: {
    label: "Neutralize green/olive with RED/ORANGE base",
    hue: 15,
    sat: 0.7,
    val: 0.7,
    brands: {
      Permablend: ["Orange/Coral"],
      "Li Pigments": ["Coral/Red-Orange"],
      "Tina Davies": ["Auburn/Coral"],
      "Brow Daddy": ["Warm Coral"],
    },
  },
  over_warm: {
    label: "Over-warm/orange → add COOL/OLIVE to pull neutral",
    hue: 115,
    sat: 0.45,
    val: 0.55,
    brands: {
      Permablend: ["Olive/Green (sparingly)"],
      "Li Pigments": ["Olive/Green"],
      "Tina Davies": ["Olive Modifier"],
      "Brow Daddy": ["Olive/Neutralizer"],
    },
  },
  neutral: {
    label: "Already neutral – correct only if target demands shift",
    hue: 30,
    sat: 0.4,
    val: 0.55,
    brands: {
      Permablend: ["Subtle modifier if needed"],
      "Li Pigments": ["Adjuster per target"],
      "Tina Davies": ["Adjuster per target"],
      "Brow Daddy": ["Adjuster per target"],
    },
  },
}
const DEFAULT_BRAND_ORDER = ["Permablend", "Li Pigments", "Tina Davies", "Brow Daddy"]

function Badge({ children, tone = "pink" }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    pink: "bg-pink-100 text-pink-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-800",
    gray: "bg-gray-100 text-gray-700",
  }
  return <span className={`px-2 py-1 rounded-full text-xs ${tones[tone] || tones.gray}`}>{children}</span>
}

function Swatch({ title, color, round = true }: { title: string; color: string; round?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${round ? "rounded-full" : "rounded-xl"} w-12 h-12 shadow border`}
        style={{ background: color }}
      />
      <div className="text-xs text-gray-700">
        <div className="font-medium">{title}</div>
        <div className="font-mono">{color}</div>
      </div>
    </div>
  )
}

function BrandCard({ brand, items = [], inventory = {}, onQuickOrder }: { brand: string; items?: string[]; inventory?: Record<string, any>; onQuickOrder?: (sku: string) => void }) {
  const sheet = TECH_SHEETS[brand]
  
  // Get the first pigment color for this brand to use as the brand indicator
  const getBrandColor = () => {
    const brandPigment = pigmentLibrary.find(p => p.brand === brand)
    if (brandPigment?.digitalSwatch) {
      return brandPigment.digitalSwatch
    }
    // Fallback to gradient if no pigment found
    return "bg-gradient-to-br from-pink-400 to-rose-600"
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border shadow-xl p-4 bg-white/70 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full shadow border"
            style={{ 
              background: getBrandColor().startsWith('/') 
                ? `url(${getBrandColor()}) center/cover` 
                : getBrandColor() 
            }}
          />
          <div className="text-sm font-semibold">{brand}</div>
        </div>
        {sheet && (
          <a href={sheet} target="_blank" className="text-xs text-pink-600 hover:underline" rel="noreferrer">
            Tech Sheet ↗
          </a>
        )}
      </div>
      <ul className="space-y-2">
        {items.map((name, i) => {
          const sku = `${brand}:${name}`
          const stock = inventory[sku]?.stock
          const buyUrl = inventory[sku]?.url
          const tone = stock == null ? "gray" : stock > 10 ? "green" : stock > 0 ? "amber" : "red"
          const label =
            stock == null ? "Check stock" : stock > 10 ? "In Stock" : stock > 0 ? `Low (${stock})` : "Out of Stock"
          
          // Get the actual pigment color
          const getPigmentColor = () => {
            const pigment = pigmentLibrary.find(p => p.brand === brand && p.pigmentName === name)
            if (pigment?.digitalSwatch) {
              return pigment.digitalSwatch
            }
            return null
          }
          
          const pigmentColor = getPigmentColor()
          
          return (
            <li key={i} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                {pigmentColor && (
                  <div 
                    className="w-4 h-4 rounded-full shadow border"
                    style={{ 
                      background: pigmentColor.startsWith('/') 
                        ? `url(${pigmentColor}) center/cover` 
                        : pigmentColor 
                    }}
                  />
                )}
                <span>{name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={tone}>{label}</Badge>
                {buyUrl ? (
                  <a
                    href={buyUrl}
                    target="_blank"
                    className="px-2 py-1 rounded-lg text-xs border hover:bg-gray-50"
                    rel="noreferrer"
                  >
                    Order
                  </a>
                ) : (
                  <button
                    className="px-2 py-1 rounded-lg text-xs border hover:bg-gray-50"
                    onClick={() => onQuickOrder?.(sku)}
                  >
                    Quick Order
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </motion.div>
  )
}

function PMUColorCorrectionTool() {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [imgUrl, setImgUrl] = useState("")
  const [avgColor, setAvgColor] = useState<{ r: number; g: number; b: number } | null>(null)
  const [sel, setSel] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [drag, setDrag] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null)
  const [useAI, setUseAI] = useState(USE_AI_DEFAULT)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const [correctorMap, setCorrectorMap] = useState(DEFAULT_CORRECTOR_MAP)
  const [brandOrder, setBrandOrder] = useState(DEFAULT_BRAND_ORDER)
  const [inventory, setInventory] = useState({})
  const [targetHex, setTargetHex] = useState(DEFAULT_TARGET_HEX)
  const [overlayOpacity, setOverlayOpacity] = useState(0.55)
  const [imageZoom, setImageZoom] = useState(1.2)
  const [isMobile, setIsMobile] = useState(false)

  // Save to client file functionality
  const {
    showSavePrompt,
    currentToolResult,
    promptToSave,
    hideSavePrompt,
    handleSave,
    handleSkip,
    isSaving,
    saveError
  } = useSaveToClient()

  const baseRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load image
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setImgUrl(url)
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = url
  }

  // Draw base & reset
  useEffect(() => {
    if (!img || !baseRef.current || !overlayRef.current || !previewRef.current) return
    const base = baseRef.current
    const overlay = overlayRef.current
    const preview = previewRef.current
    
    const baseCtx = base.getContext("2d")
    const overlayCtx = overlay.getContext("2d")
    const previewCtx = preview.getContext("2d")
    
    if (!baseCtx || !overlayCtx || !previewCtx) return
    
    // Allow closer zooming for better precision
    const maxW = isMobile ? 600 : 1400 // Increased max width for better zoom
    const sc = img.width > maxW ? maxW / img.width : 1.2 // Default 1.2x zoom for better detail
    base.width = Math.round(img.width * sc)
    base.height = Math.round(img.height * sc)
    baseCtx.drawImage(img, 0, 0, base.width, base.height)
    
    overlay.width = base.width
    overlay.height = base.height
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height)
    
    preview.width = base.width
    preview.height = base.height
    previewCtx.drawImage(img, 0, 0, preview.width, preview.height)
    setSel(null)
    setAvgColor(null)
    setAiError("")
  }, [img, isMobile])

  // Update image zoom
  const updateImageZoom = () => {
    if (!img || !baseRef.current || !overlayRef.current || !previewRef.current) return
    const base = baseRef.current
    const overlay = overlayRef.current
    const preview = previewRef.current
    
    const baseCtx = base.getContext("2d")
    const overlayCtx = overlay.getContext("2d")
    const previewCtx = preview.getContext("2d")
    
    if (!baseCtx || !overlayCtx || !previewCtx) return
    
    const maxW = isMobile ? 600 : 1400
    const sc = img.width > maxW ? maxW / img.width : imageZoom
    base.width = Math.round(img.width * sc)
    base.height = Math.round(img.height * sc)
    baseCtx.drawImage(img, 0, 0, base.width, base.height)
    
    overlay.width = base.width
    overlay.height = base.height
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height)
    
    preview.width = base.width
    preview.height = base.height
    previewCtx.drawImage(img, 0, 0, preview.width, preview.height)
  }

  // Unified pointer events for both mouse and touch with proper scaling
  const getPointerPosition = (e: MouseEvent | TouchEvent) => {
    if (!overlayRef.current) return { x: 0, y: 0 }
    const rect = overlayRef.current.getBoundingClientRect()
    const canvas = overlayRef.current
    let clientX, clientY
    
    if ('touches' in e && e.touches && e.touches[0]) {
      // Touch event
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    } else {
      return { x: 0, y: 0 }
    }
    
    // Calculate the scale factor between display size and actual canvas size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Convert display coordinates to canvas coordinates
    const canvasX = (clientX - rect.left) * scaleX
    const canvasY = (clientY - rect.top) * scaleY
    
    return {
      x: canvasX,
      y: canvasY
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!overlayRef.current) return
    e.preventDefault()
    const pos = getPointerPosition(e.nativeEvent)
    setDrag({ startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y })
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!overlayRef.current || !drag) return
    e.preventDefault()
    const pos = getPointerPosition(e.nativeEvent)
    const newDrag = { ...drag, endX: pos.x, endY: pos.y }
    setDrag(newDrag)
    setSel({ 
      x: Math.min(drag.startX, pos.x), 
      y: Math.min(drag.startY, pos.y), 
      w: Math.abs(pos.x - drag.startX), 
      h: Math.abs(pos.y - drag.startY) 
    })
  }

  const onPointerUp = async (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag) return
    e.preventDefault()
    setDrag(null)
    if (sel) {
      computeAverageColor()
      if (useAI) await analyzeViaApi()
      else updatePreviewTint(null)
    }
  }

  // Average color in selection
  const computeAverageColor = () => {
    if (!sel || !baseRef.current) return
    const ctx = baseRef.current.getContext("2d")
    if (!ctx) return
    const sx = Math.max(0, Math.floor(sel.x)),
      sy = Math.max(0, Math.floor(sel.y)),
      sw = Math.max(1, Math.floor(sel.w)),
      sh = Math.max(1, Math.floor(sel.h))
    const d = ctx.getImageData(sx, sy, sw, sh).data
    let r = 0,
      g = 0,
      b = 0,
      n = 0
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 20) continue
      r += d[i]
      g += d[i + 1]
      b += d[i + 2]
      n++
    }
    if (n === 0) return
    setAvgColor({ r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) })
  }

  // Draw selection overlay & handle preview tint in real-time
  useEffect(() => {
    if (!overlayRef.current) return
    const ctx = overlayRef.current.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height)
    if (sel) {
      ctx.save()
      // Enhanced selection border for better mobile visibility
      ctx.strokeStyle = "rgba(255,255,255,0.95)"
      ctx.lineWidth = 3
      ctx.shadowColor = "rgba(0,0,0,0.6)"
      ctx.shadowBlur = 8
      ctx.strokeRect(sel.x, sel.y, sel.w, sel.h)
      
      // Add corner indicators for better mobile UX
      const cornerSize = 8
      ctx.fillStyle = "rgba(255,255,255,0.9)"
      // Top-left corner
      ctx.fillRect(sel.x - 2, sel.y - 2, cornerSize, cornerSize)
      // Top-right corner
      ctx.fillRect(sel.x + sel.w - cornerSize + 2, sel.y - 2, cornerSize, cornerSize)
      // Bottom-left corner
      ctx.fillRect(sel.x - 2, sel.y + sel.h - cornerSize + 2, cornerSize, cornerSize)
      // Bottom-right corner
      ctx.fillRect(sel.x + sel.w - cornerSize + 2, sel.y + sel.h - cornerSize + 2, cornerSize, cornerSize)
      
      // Semi-transparent fill
      ctx.fillStyle = `rgba(255,255,255,${overlayOpacity * 0.2})`
      ctx.fillRect(sel.x, sel.y, sel.w, sel.h)
      ctx.restore()
    }
  }, [sel, overlayOpacity])

  // Heuristic cast/corrector (used as fallback or to render swatches while AI loads)
  const castHeuristic = useMemo(() => (avgColor ? classifyCast(avgColor) : null), [avgColor])
  const correctorHeuristic = useMemo(
    () => (castHeuristic ? correctorMap[castHeuristic.key] : null),
    [castHeuristic, correctorMap],
  )

  // AI state
  const [aiResult, setAiResult] = useState<any>(null) // { detectedCast:{key,label}, corrector:{hex, label}, brands:[{brand,name,sku,url}], currentHex }

  // Call AI endpoint
  async function analyzeViaApi() {
    if (!sel || !baseRef.current) return

    // Function to prompt for saving results
    const promptToSaveResults = () => {
      const toolResult: ToolResult = {
        type: 'color-correction',
        data: {
          originalColor: avgColor ? `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})` : null,
          correctedColor: correctorHeuristic?.hex || targetHex,
          recommendations: correctorHeuristic?.brands || {},
          analysisType: 'color-correction',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        toolName: 'Color Correction Analysis'
      }
      promptToSave(toolResult)
    }
    setAiLoading(true)
    setAiError("")
    try {
      const base = baseRef.current
      const imgUrl = base.toDataURL("image/jpeg", 0.9)
      const body = { imageDataUrl: imgUrl, selection: sel, targetHex }
      const res = await fetch("/api/pigment-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      // expected shape (example): { detectedCast:{key,label}, corrector:{hex,label}, brands:[{brand,name,sku,url}], currentHex }
      setAiResult(data)
      updatePreviewTint(data.corrector?.hex || null)
      // kick inventory fetch
      const skus = (data.brands || []).map((b: any) => b.sku).filter(Boolean)
      if (skus.length) {
        const inv = await fetch(`/api/inventory?skus=${encodeURIComponent(skus.join(","))}`)
        if (inv.ok) {
          const j = await inv.json()
          setInventory(j || {})
        }
      }
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI error")
      setAiResult(null)
      updatePreviewTint(null)
    } finally {
      setAiLoading(false)
    }
  }

  // --- Before/After Simulator: tint only selection ---
  function updatePreviewTint(forceHex: string | null) {
    if (!previewRef.current || !baseRef.current) return
    const p = previewRef.current.getContext("2d")
    if (!p) return
    const b = baseRef.current
    p.clearRect(0, 0, p.canvas.width, p.canvas.height)
    p.drawImage(b, 0, 0)
    if (!sel) return
    const hex =
      forceHex ||
      (correctorHeuristic
        ? rgbToHex(hsvToRgb(correctorHeuristic.hue, correctorHeuristic.sat, correctorHeuristic.val))
        : null)
    if (!hex) return
    const { r, g, b: bb } = hexToRgb(hex)
    p.save()
    p.beginPath()
    p.rect(sel.x, sel.y, sel.w, sel.h)
    p.clip()
    p.globalAlpha = 0.35 // strength of correction overlay
    p.globalCompositeOperation = "multiply"
    p.fillStyle = `rgb(${r},${g},${bb})`
    p.fillRect(sel.x, sel.y, sel.w, sel.h)
    p.restore()
  }

  // current/corrector/target swatches
  const currentHex = useMemo(
    () => (avgColor ? rgbToHex(avgColor) : aiResult?.currentHex || "#cccccc"),
    [avgColor, aiResult],
  )
  const correctorHex = useMemo(
    () =>
      aiResult?.corrector?.hex ||
      (correctorHeuristic
        ? rgbToHex(hsvToRgb(correctorHeuristic.hue, correctorHeuristic.sat, correctorHeuristic.val))
        : "#cccccc"),
    [aiResult, correctorHeuristic],
  )
  const targetRgb = useMemo(() => hexToRgb(targetHex), [targetHex])
  const neutralizedHex = useMemo(() => {
    if (!avgColor || !correctorHex) return "#cccccc"
    return rgbToHex(blendRgb(avgColor, hexToRgb(correctorHex), 0.45))
  }, [avgColor, correctorHex])
  const towardTargetHex = useMemo(() => {
    if (!avgColor || !correctorHex) return targetHex
    return rgbToHex(blendRgb(blendRgb(avgColor, hexToRgb(correctorHex), 0.45), targetRgb, 0.35))
  }, [avgColor, correctorHex, targetRgb, targetHex])

  // --- UI ---
  return (
    <div className={`w-full max-w-7xl mx-auto ${isMobile ? 'p-2' : 'p-4'} select-none`}>
      {/* Top Bar */}
      <div className={`mb-4 rounded-3xl bg-gradient-to-r from-rose-100 via-pink-50 to-amber-50 border shadow-xl ${isMobile ? 'p-3' : 'p-4'} ${isMobile ? 'flex-col gap-3' : 'flex items-center justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow" />
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>PMU GUIDE — Color Correction</h1>
            <p className="text-xs text-gray-600">
              AI pigment neutralizer with brand modifiers, stock, and live preview.
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
          <input type="file" accept="image/*" onChange={onFile} id="imgUpload" className="hidden" />
          <label
            htmlFor="imgUpload"
            className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-pink-500 to-rose-600 shadow hover:opacity-95 cursor-pointer"
          >
            Upload Photo
          </label>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">AI</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-5`}>
        {/* LEFT: Image + Overlay + Before/After Preview */}
        <div className="rounded-3xl border bg-white/70 backdrop-blur-md shadow-xl p-3">
          {!img && (
            <div className="aspect-video w-full rounded-2xl bg-white/60 border border-dashed flex flex-col items-center justify-center text-gray-400 gap-2">
              <div>Upload a photo to begin</div>
              {isMobile && (
                <div className="text-xs text-center px-4">
                  👆 After uploading, touch and drag over the brows to analyze color
                </div>
              )}
            </div>
          )}
          <div className="relative" style={{ touchAction: 'none' }}>
            <canvas ref={baseRef} className="w-full rounded-2xl" />
            <canvas
              ref={overlayRef}
              className="w-full rounded-2xl absolute inset-0 cursor-crosshair"
              style={{ touchAction: 'none' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
            {/* Mobile touch indicator */}
            {isMobile && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg pointer-events-none">
                👆 Touch & drag to select area
              </div>
            )}
            {/* Selection size indicator */}
            {sel && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg pointer-events-none">
                {Math.round(sel.w)} × {Math.round(sel.h)} px
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-1">Before/After (AI-tinted selection)</div>
            <canvas ref={previewRef} className="w-full rounded-2xl border" />
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600">Overlay strength</label>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={overlayOpacity}
                  onChange={(e) => {
                    setOverlayOpacity(Number.parseFloat(e.target.value))
                    updatePreviewTint(null)
                  }}
                  className="w-48"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-600">Image zoom</label>
                <input
                  type="range"
                  min={0.8}
                  max={2.5}
                  step={0.1}
                  value={imageZoom}
                  onChange={(e) => {
                    setImageZoom(Number.parseFloat(e.target.value))
                    updateImageZoom()
                  }}
                  className="w-48"
                />
                <span className="text-xs text-gray-500">{Math.round(imageZoom * 100)}%</span>
              </div>
              {aiLoading && <Badge>Analyzing…</Badge>}
              {aiError && <Badge tone="red">{aiError}</Badge>}
            </div>
          </div>
        </div>

        {/* RIGHT: Analysis & Recommendations */}
        <div className="space-y-4">
          <motion.div layout className="rounded-3xl border bg-white/80 backdrop-blur-md shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Detected Shade & Cast</div>
              {avgColor && <Badge>{aiResult?.detectedCast?.label || castHeuristic?.label || "—"}</Badge>}
            </div>
            {!avgColor ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {isMobile 
                    ? 'Touch and drag over the brows to analyze color.' 
                    : 'Draw a rectangle over the brows to analyze color.'}
                </p>
                <p className="text-xs text-gray-500">
                  {isMobile 
                    ? 'Use your finger or stylus to select the area' 
                    : 'Click and drag to select the area'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Swatch title="Current" color={currentHex} />
                <Swatch title="Corrector" color={correctorHex} />
                <Swatch title="Neutralized" color={neutralizedHex} />
                <div>
                  <div className="text-xs text-gray-600 mb-1">Target Shade</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={targetHex}
                      onChange={(e) => {
                        setTargetHex(e.target.value)
                        updatePreviewTint(null)
                      }}
                      className="w-12 h-12 rounded-xl border"
                    />
                    <input
                      type="text"
                      value={targetHex}
                      onChange={(e) => {
                        setTargetHex(e.target.value)
                        updatePreviewTint(null)
                      }}
                      className="px-2 py-1 rounded-xl border text-sm font-mono w-28"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div layout className="rounded-3xl border bg-white/80 backdrop-blur-md shadow-xl p-4">
            <div className="font-semibold mb-1">Correction Strategy</div>
            <p className="text-sm text-gray-700">
              {aiResult?.corrector?.label || correctorHeuristic?.label || "Select a brow area to see strategy."}
            </p>
          </motion.div>

          {/* Brand Cards */}
          <AnimatePresence>
            {(aiResult?.brands?.length || correctorHeuristic) && (
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'sm:grid-cols-2'} gap-3`}>
                {(aiResult?.brands?.length
                  ? aiResult.brands.reduce((acc: any, b: any) => {
                      if (!acc[b.brand]) acc[b.brand] = [];
                      acc[b.brand].push(b);
                      return acc;
                    }, {})
                  : Object.fromEntries(
                      brandOrder.map((b) => [
                        b,
                        (correctorHeuristic?.brands?.[b] || []).map((name: any) => ({
                          brand: b,
                          name,
                          sku: `${b}:${name}`,
                        })),
                      ]),
                    )) &&
                  Object.entries(
                    aiResult?.brands?.length
                      ? aiResult.brands.reduce((acc: any, b: any) => {
                          if (!acc[b.brand]) acc[b.brand] = [];
                          acc[b.brand].push(b);
                          return acc;
                        }, {})
                      : Object.fromEntries(
                          brandOrder.map((b) => [
                            b,
                            (correctorHeuristic?.brands?.[b] || []).map((name: any) => ({
                              brand: b,
                              name,
                              sku: `${b}:${name}`,
                            })),
                          ]),
                        ),
                  ).map(([brand, list]) => (
                    <BrandCard
                      key={brand}
                      brand={brand}
                      items={(list as any[]).map((x: any) => x.name)}
                      inventory={inventory}
                      onQuickOrder={(sku) => console.log("Order", sku)}
                    />
                  ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="text-[11px] text-gray-500 mt-4">
        Esthetic guidance only. Always patch-test and follow brand technical sheets. Lighting and camera quality affect
        results.
      </div>

      {/* Save to Client File Prompt */}
      {showSavePrompt && currentToolResult && (
        <SaveToClientPrompt
          toolResult={currentToolResult}
          onSave={handleSave}
          onSkip={handleSkip}
          isOpen={showSavePrompt}
          onOpenChange={hideSavePrompt}
        />
      )}
    </div>
  )
}

export { PMUColorCorrectionTool }
export default PMUColorCorrectionTool
