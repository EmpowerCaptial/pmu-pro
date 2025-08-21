# Save to Client File Integration Guide

This guide explains how to integrate the "Save to Client File" functionality into your existing PMU tools.

## 🎯 **Overview**

After each tool completes its analysis, artists are prompted to save the results to a client file. This creates a comprehensive client record that includes:
- Intake forms
- Consent forms  
- Skin analysis results
- Color correction analysis
- ProCell analysis
- All other tool results

## 🚀 **Quick Integration**

### 1. Import the Hook and Components

```tsx
import { useSaveToClient } from "@/hooks/use-save-to-client"
import { SaveToClientPrompt, ToolResult } from "@/components/client/save-to-client-prompt"
```

### 2. Add the Hook to Your Component

```tsx
function YourTool() {
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

  // ... rest of your component
}
```

### 3. Prompt to Save When Tool Completes

```tsx
const handleToolCompletion = () => {
  // Your tool's completion logic here
  
  // Create the tool result object
  const toolResult: ToolResult = {
    type: 'your-tool-type', // 'intake', 'consent', 'skin-analysis', 'color-correction', 'procell-analysis'
    data: {
      // Your tool's data here
      result: 'analysis result',
      confidence: 0.95,
      recommendations: ['recommendation 1', 'recommendation 2']
    },
    timestamp: new Date().toISOString(),
    toolName: 'Your Tool Name'
  }
  
  // Prompt the user to save
  promptToSave(toolResult)
}
```

### 4. Add the Save Prompt Component

```tsx
return (
  <div>
    {/* Your existing tool UI */}
    
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
```

## 📋 **Supported Tool Types**

| Tool Type | Data Structure | Database Table |
|-----------|----------------|----------------|
| `intake` | Medical history, conditions, medications | `intakes` |
| `consent` | Form files, signatures, waivers | `documents` |
| `skin-analysis` | Fitzpatrick type, undertone, recommendations | `analyses` |
| `color-correction` | Color analysis, correction strategies | `analyses` |
| `procell-analysis` | Treatment recommendations, healing predictions | `analyses` |

## 🔧 **Data Structure Examples**

### Intake Form
```tsx
const toolResult: ToolResult = {
  type: 'intake',
  data: {
    conditions: ['Hypertension', 'Diabetes'],
    medications: ['Metformin', 'Lisinopril'],
    notes: 'Client has well-controlled conditions',
    result: 'safe',
    rationale: 'Conditions are well-managed with medication',
    flaggedItems: 'Monitor blood pressure during procedure'
  },
  timestamp: new Date().toISOString(),
  toolName: 'Intake Form'
}
```

### Skin Analysis
```tsx
const toolResult: ToolResult = {
  type: 'skin-analysis',
  data: {
    fitzpatrick: 3,
    undertone: 'warm',
    confidence: 0.89,
    photoId: 'photo_123',
    recommendation: {
      pigmentRecommendations: ['Permablend Warm Brown'],
      healingPrediction: 'Excellent healing potential'
    },
    notes: 'Ideal skin type for PMU procedures'
  },
  timestamp: new Date().toISOString(),
  toolName: 'Skin Analysis'
}
```

### Color Correction
```tsx
const toolResult: ToolResult = {
  type: 'color-correction',
  data: {
    originalColor: 'rgb(120, 80, 60)',
    correctedColor: '#8B4513',
    recommendations: {
      'Permablend': ['Warm Brown Corrector'],
      'Li Pigments': ['Golden Brown Neutralizer']
    },
    analysisType: 'color-correction'
  },
  timestamp: new Date().toISOString(),
  toolName: 'Color Correction Analysis'
}
```

## 🎨 **User Experience Flow**

1. **Artist completes tool analysis**
2. **"Save to Client File?" prompt appears**
3. **Artist chooses:**
   - **Save to existing client** - Select from client list
   - **Create new client** - Fill out client information form
   - **Skip** - Use tool only, don't save
4. **Results automatically saved to client file**
5. **Client file updated with timestamp**

## 🔌 **API Endpoint**

The save functionality uses the `/api/client-tools/save-result` endpoint:

```tsx
POST /api/client-tools/save-result
{
  "clientId": "client_123",
  "toolResult": {
    "type": "skin-analysis",
    "data": { ... },
    "timestamp": "2024-01-15T10:30:00Z",
    "toolName": "Skin Analysis"
  }
}
```

## 🧪 **Testing**

Use the demo component to test the functionality:

```tsx
import { SaveToClientDemo } from "@/components/demo/save-to-client-demo"

// In your page
<SaveToClientDemo />
```

## 🚨 **Error Handling**

The hook provides error handling:

```tsx
const { saveError, isSaving } = useSaveToClient()

// Show loading state
{isSaving && <div>Saving to client file...</div>}

// Show errors
{saveError && <div className="text-red-600">Error: {saveError}</div>}
```

## 🔄 **State Management**

The hook manages all the state automatically:
- `showSavePrompt` - Controls when the prompt is visible
- `currentToolResult` - The tool result to be saved
- `isSaving` - Loading state during save operation
- `saveError` - Any error messages from the save operation

## 📱 **Mobile Responsiveness**

The save prompt is fully responsive and works on all devices:
- Mobile-optimized client selection
- Touch-friendly interface
- Responsive form layouts
- Accessible design patterns

## 🎯 **Best Practices**

1. **Prompt immediately** after tool completion
2. **Include comprehensive data** in the tool result
3. **Handle errors gracefully** with user feedback
4. **Provide clear skip option** for artists who don't want to save
5. **Use descriptive tool names** for better organization
6. **Include timestamps** for tracking when analysis was performed

## 🔗 **Related Components**

- `SaveToClientPrompt` - Main prompt component
- `useSaveToClient` - Hook for managing save functionality
- `/api/client-tools/save-result` - API endpoint for saving
- Client file management system
- Database schema for storing tool results
