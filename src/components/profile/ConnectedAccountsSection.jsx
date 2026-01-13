import { useState, useEffect } from 'react'
import { FiLink, FiCheck, FiX, FiExternalLink, FiLoader } from 'react-icons/fi'
import {
  getCivitaiApiKey,
  setCivitaiApiKey,
  removeCivitaiApiKey,
  validateApiKey,
  isCivitaiConfigured,
} from '../../lib/civitai'

/**
 * Connected Accounts Section for Profile page
 * Currently supports CivitAI API key configuration
 */
export default function ConnectedAccountsSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [civitaiConnected, setCivitaiConnected] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')
  const [showKey, setShowKey] = useState(false)

  // Check initial connection status
  useEffect(() => {
    setCivitaiConnected(isCivitaiConfigured())
  }, [])

  const handleConnect = async () => {
    if (!apiKeyInput.trim()) {
      setError('Please enter an API key')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      const isValid = await validateApiKey(apiKeyInput.trim())

      if (isValid) {
        setCivitaiApiKey(apiKeyInput.trim())
        setCivitaiConnected(true)
        setApiKeyInput('')
        setShowKey(false)
      } else {
        setError('Invalid API key. Please check and try again.')
      }
    } catch (err) {
      setError('Failed to validate API key. Please try again.')
      console.error('CivitAI validation error:', err)
    } finally {
      setIsValidating(false)
    }
  }

  const handleDisconnect = () => {
    removeCivitaiApiKey()
    setCivitaiConnected(false)
    setApiKeyInput('')
    setError('')
  }

  const maskedKey = () => {
    const key = getCivitaiApiKey()
    if (!key) return ''
    return key.substring(0, 8) + '...' + key.substring(key.length - 4)
  }

  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-medium">Connected Accounts</h3>
          <p className="text-sm text-slate-500">Connect external services to enhance your workflow</p>
        </div>
        <span className="text-sm text-indigo-400">
          {isExpanded ? 'Hide' : 'Manage'}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-700/50 p-4 space-y-4">
          {/* CivitAI Connection */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiLink className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">CivitAI</h4>
                  <p className="text-xs text-slate-500">Browse models and LoRAs directly in the app</p>
                </div>
              </div>

              {civitaiConnected ? (
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                  <FiCheck className="w-3 h-3" />
                  Connected
                </span>
              ) : (
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                  Not connected
                </span>
              )}
            </div>

            {civitaiConnected ? (
              /* Connected state */
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>API Key:</span>
                  <code className="bg-slate-800 px-2 py-0.5 rounded text-xs">
                    {maskedKey()}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              /* Not connected state */
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Connect your CivitAI account to browse checkpoints and LoRAs directly from the app.
                </p>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => {
                        setApiKeyInput(e.target.value)
                        setError('')
                      }}
                      placeholder="Enter your CivitAI API key"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 pr-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConnect()
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                      title={showKey ? 'Hide key' : 'Show key'}
                    >
                      {showKey ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={isValidating || !apiKeyInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <a
                  href="https://civitai.com/user/account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Get your API key from CivitAI
                  <FiExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Placeholder for future connections */}
          <div className="text-xs text-slate-500 text-center py-2">
            More integrations coming soon
          </div>
        </div>
      )}
    </div>
  )
}
