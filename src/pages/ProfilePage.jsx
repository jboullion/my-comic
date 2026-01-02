import { useAuth } from '../contexts/AuthContext'
import AppLayout from '../layouts/AppLayout'

export default function ProfilePage() {
  const { user } = useAuth()

  const userInfo = {
    name: user?.user_metadata?.full_name || 'User',
    email: user?.email,
    avatar: user?.user_metadata?.avatar_url,
    provider: user?.app_metadata?.provider || 'unknown',
    createdAt: user?.created_at,
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Profile</h1>

        {/* Profile Card */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={userInfo.avatar || `https://ui-avatars.com/api/?name=${userInfo.email}&background=6366f1&color=fff&size=80`}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-slate-700"
            />
            <div>
              <h2 className="text-xl font-semibold">{userInfo.name}</h2>
              <p className="text-slate-400">{userInfo.email}</p>
              <p className="text-sm text-slate-500 mt-1 capitalize">
                Signed in with {userInfo.provider}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-slate-400">Member since</dt>
                <dd className="text-white">
                  {userInfo.createdAt 
                    ? new Date(userInfo.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Unknown'
                  }
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Account type</dt>
                <dd className="text-white">Free</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          <SettingsSection
            title="Preferences"
            description="Customize your experience"
            comingSoon
          />
          <SettingsSection
            title="Storage"
            description="Manage your project storage and backups"
            comingSoon
          />
          <SettingsSection
            title="Connected Accounts"
            description="Manage linked social accounts"
            comingSoon
          />
        </div>

        {/* Danger Zone */}
        <div className="mt-8 p-4 bg-red-900/20 rounded-lg border border-red-900/50">
          <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-400 mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button 
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-600/50"
            disabled
          >
            Delete Account (Coming Soon)
          </button>
        </div>
      </div>
    </AppLayout>
  )
}

function SettingsSection({ title, description, comingSoon = false }) {
  return (
    <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 flex items-center justify-between">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {comingSoon ? (
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Coming Soon</span>
      ) : (
        <button className="text-sm text-indigo-400 hover:text-indigo-300">
          Manage
        </button>
      )}
    </div>
  )
}
