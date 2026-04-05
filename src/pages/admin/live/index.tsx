import { CueTracker } from './components/CueTracker'
import { QuickActions } from './components/QuickActions'
import { AttendancePanel } from './components/AttendancePanel'
import { LiveFeed } from './components/LiveFeed'

export function LiveTab() {
  return (
    <div className="space-y-6">
      {/* Zone 1: Cue Tracker */}
      <CueTracker />

      {/* Zone 2: Quick Actions */}
      <QuickActions />

      {/* Zone 3: Attendance + Live Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AttendancePanel />
        <LiveFeed />
      </div>
    </div>
  )
}
