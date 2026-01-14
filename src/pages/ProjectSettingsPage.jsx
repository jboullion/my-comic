import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiLayout, FiType, FiMessageCircle, FiZap, FiImage, FiHardDrive, FiCpu, FiBold } from 'react-icons/fi'
import EditorLayout from '../layouts/EditorLayout'
import useProjectStore from '../stores/useProjectStore'
import { DEFAULT_PROJECT_SETTINGS } from '../lib/db'
import PageSettingsTab from '../components/settings/PageSettingsTab'
import TextSettingsTab from '../components/settings/TextSettingsTab'
import SpeechBubbleSettingsTab from '../components/settings/SpeechBubbleSettingsTab'
import TextEffectSettingsTab from '../components/settings/TextEffectSettingsTab'
import ImageSettingsTab from '../components/settings/ImageSettingsTab'
import StorageSettingsTab from '../components/settings/StorageSettingsTab'
import AISettingsTab from '../components/settings/AISettingsTab'
import FontsSettingsTab from '../components/settings/FontsSettingsTab'

const TABS = [
  { id: 'page', label: 'Page', icon: FiLayout },
  { id: 'fonts', label: 'Fonts', icon: FiBold },
  { id: 'image', label: 'Images', icon: FiImage },
  { id: 'text', label: 'Text', icon: FiType },
  { id: 'speechBubble', label: 'Speech Bubbles', icon: FiMessageCircle },
  { id: 'textEffect', label: 'Text Effects', icon: FiZap },
  { id: 'ai', label: 'AI', icon: FiCpu },
  { id: 'storage', label: 'Storage', icon: FiHardDrive }
]

/**
 * ProjectSettingsPage Component
 * Full-page settings for project defaults with tabbed navigation
 */
export default function ProjectSettingsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    currentProject,
    currentProjectLoading,
    loadProject,
    saveProjectSettings,
    updateCurrentProject,
  } = useProjectStore()

  // Tab state - check URL param first, then localStorage
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && TABS.some(t => t.id === tabParam)) {
      return tabParam
    }
    return localStorage.getItem('projectSettingsTab') || 'page'
  })

  // Local settings state for editing
  const [localSettings, setLocalSettings] = useState(null)

  // Local customStoryPrompt state (separate from settings)
  const [localCustomStoryPrompt, setLocalCustomStoryPrompt] = useState(null)

  // Local storyAiModel state (separate from settings)
  const [localStoryAiModel, setLocalStoryAiModel] = useState(null)

  // Local font settings state
  const [localFontScript, setLocalFontScript] = useState('latin')
  const [localCustomFonts, setLocalCustomFonts] = useState([])

  // Save state for feedback
  const [saveState, setSaveState] = useState('idle') // 'idle' | 'saving' | 'saved'

  // Load project if not already loaded
  useEffect(() => {
    if (!currentProject && projectId) {
      loadProject(projectId)
    }
  }, [currentProject, projectId, loadProject])

  // Initialize local settings from project
  useEffect(() => {
    if (currentProject?.settings) {
      // Merge with defaults to ensure all nested properties exist
      setLocalSettings({
        width: currentProject.settings.width || DEFAULT_PROJECT_SETTINGS.width,
        height: currentProject.settings.height || DEFAULT_PROJECT_SETTINGS.height,
        backgroundColor: currentProject.settings.backgroundColor || DEFAULT_PROJECT_SETTINGS.backgroundColor,
        image: { ...DEFAULT_PROJECT_SETTINGS.image, ...currentProject.settings.image },
        text: { ...DEFAULT_PROJECT_SETTINGS.text, ...currentProject.settings.text },
        speechBubble: { ...DEFAULT_PROJECT_SETTINGS.speechBubble, ...currentProject.settings.speechBubble },
        textEffect: { ...DEFAULT_PROJECT_SETTINGS.textEffect, ...currentProject.settings.textEffect }
      })
    }
  }, [currentProject?.settings])

  // Initialize customStoryPrompt from project
  useEffect(() => {
    if (currentProject) {
      setLocalCustomStoryPrompt(currentProject.customStoryPrompt || null)
    }
  }, [currentProject?.customStoryPrompt])

  // Initialize storyAiModel from project
  useEffect(() => {
    if (currentProject) {
      setLocalStoryAiModel(currentProject.storyAiModel || null)
    }
  }, [currentProject?.storyAiModel])

  // Initialize font settings from project
  useEffect(() => {
    if (currentProject?.settings) {
      setLocalFontScript(currentProject.settings.fontScript || 'latin')
      setLocalCustomFonts(currentProject.settings.customFonts || [])
    }
  }, [currentProject?.settings])

  // Save tab preference
  useEffect(() => {
    localStorage.setItem('projectSettingsTab', activeTab)
  }, [activeTab])

  const handleBack = () => {
    navigate(`/app/project/${projectId}`)
  }

  const handleSave = async () => {
    if (localSettings && saveState === 'idle') {
      setSaveState('saving')
      // Save settings including font settings
      await saveProjectSettings({
        ...localSettings,
        fontScript: localFontScript,
        customFonts: localCustomFonts
      })
      // Save customStoryPrompt and storyAiModel separately (they're on the project, not settings)
      await updateCurrentProject({
        customStoryPrompt: localCustomStoryPrompt,
        storyAiModel: localStoryAiModel
      })
      setSaveState('saved')
      // Reset to idle after showing "Saved!" for 1.5 seconds
      setTimeout(() => setSaveState('idle'), 1500)
    }
  }


  const updateLocalSettings = (updates) => {
    setLocalSettings(prev => ({ ...prev, ...updates }))
  }

  const updateNestedSettings = (section, updates) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }))
  }

  if (currentProjectLoading || !localSettings) {
    return (
      <EditorLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      </EditorLayout>
    )
  }

  return (
    <EditorLayout>
      <div className="flex flex-col h-screen bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Back to Editor"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">Project Settings</h1>
              <p className="text-sm text-slate-400">{currentProject?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveState !== 'idle'}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors min-w-20 ${
                saveState === 'saved'
                  ? 'bg-green-600 text-white'
                  : saveState === 'saving'
                  ? 'bg-slate-700 text-slate-400 cursor-wait'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {saveState === 'saved' ? 'Saved!' : saveState === 'saving' ? 'Saving...' : 'Save'}
            </button>
            
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-white border-indigo-500'
                    : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {activeTab === 'page' && (
              <PageSettingsTab
                settings={localSettings}
                onUpdate={updateLocalSettings}
              />
            )}
            {activeTab === 'fonts' && (
              <FontsSettingsTab
                fontScript={localFontScript}
                customFonts={localCustomFonts}
                onUpdateScript={setLocalFontScript}
                onUpdateCustomFonts={setLocalCustomFonts}
              />
            )}
            {activeTab === 'image' && (
              <ImageSettingsTab
                settings={localSettings.image}
                onUpdate={(updates) => updateNestedSettings('image', updates)}
              />
            )}
            {activeTab === 'text' && (
              <TextSettingsTab
                settings={localSettings.text}
                onUpdate={(updates) => updateNestedSettings('text', updates)}
              />
            )}
            {activeTab === 'speechBubble' && (
              <SpeechBubbleSettingsTab
                settings={localSettings.speechBubble}
                onUpdate={(updates) => updateNestedSettings('speechBubble', updates)}
              />
            )}
            {activeTab === 'textEffect' && (
              <TextEffectSettingsTab
                settings={localSettings.textEffect}
                onUpdate={(updates) => updateNestedSettings('textEffect', updates)}
              />
            )}
            {activeTab === 'ai' && (
              <AISettingsTab
                customStoryPrompt={localCustomStoryPrompt}
                onUpdate={setLocalCustomStoryPrompt}
                storyAiModel={localStoryAiModel}
                onUpdateModel={setLocalStoryAiModel}
              />
            )}
            {activeTab === 'storage' && (
              <StorageSettingsTab projectId={Number(projectId)} />
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50">
          <p className="text-xs text-slate-500 text-center">
            <strong>Save</strong> updates defaults for new elements.
          </p>
        </div>
      </div>
    </EditorLayout>
  )
}
