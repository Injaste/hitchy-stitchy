import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Clock, CalendarHeart, ListTodo, User, Users, Calendar,
  StickyNote, Flag, Plus, Edit2, Trash2, X, Bell, ShieldCheck, MailCheck,
  UserPlus, LayoutDashboard, Settings, Search, ChevronDown, LogOut
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  day1Timeline, day2Timeline, checklists,
  type TimelineEvent, type ChecklistItem, TEAM_ROLES, type TeamMember, type RSVP, mockRSVPs
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";

const groupEventsByTime = (events: TimelineEvent[]) => {
  const grouped: { time: string; events: TimelineEvent[] }[] = [];
  const sorted = [...events].sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
    const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
    return timeA - timeB;
  });
  sorted.forEach(event => {
    const lastGroup = grouped[grouped.length - 1];
    if (lastGroup && lastGroup.time === event.time) {
      lastGroup.events.push(event);
    } else {
      grouped.push({ time: event.time, events: [event] });
    }
  });
  return grouped;
};

const PriorityBadge = ({ priority }: { priority: ChecklistItem['priority'] }) => {
  const colors = {
    High: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-orange-50 text-orange-700 border-orange-200',
    Low: 'bg-sage-50 text-sage-700 border-sage-200'
  };
  return (
    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", colors[priority])}>
      <Flag className="w-3 h-3" />
      {priority}
    </span>
  );
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("day1");
  const [activeCategory, setActiveCategory] = useState("timeline");
  const [teamRoles, setTeamRoles] = useState<TeamMember[]>(TEAM_ROLES);
  const [currentRole, setCurrentRole] = useState(TEAM_ROLES[0].role);

  const [day1Events, setDay1Events] = useState<TimelineEvent[]>(day1Timeline);
  const [day2Events, setDay2Events] = useState<TimelineEvent[]>(day2Timeline);
  const [tasks, setTasks] = useState<ChecklistItem[]>(checklists);
  const [rsvps, setRsvps] = useState<RSVP[]>(mockRSVPs);

  const [activeCueEvent, setActiveCueEvent] = useState<TimelineEvent | null>(null);
  const [isActiveCueModalOpen, setIsActiveCueModalOpen] = useState(false);
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set());

  const bridesmaids = teamRoles.filter(r => r.isBridesmaid);
  const initialArrivals = bridesmaids.reduce((acc, b) => ({ ...acc, [b.role]: false }), {} as Record<string, boolean>);
  const [arrivals, setArrivals] = useState<Record<string, boolean>>(initialArrivals);
  const [logs, setLogs] = useState<{ id: number, time: string, role: string, msg: string }[]>([]);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [eventModalDay, setEventModalDay] = useState<"day1" | "day2">("day1");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ChecklistItem | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<TeamMember | null>(null);
  const [isNewRole, setIsNewRole] = useState(false);

  const [isConfirmStartModalOpen, setIsConfirmStartModalOpen] = useState(false);
  const [eventToStart, setEventToStart] = useState<{ event: TimelineEvent, day: "day1" | "day2" } | null>(null);

  const [isConfirmDeleteTaskModalOpen, setIsConfirmDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [isConfirmDeleteEventModalOpen, setIsConfirmDeleteEventModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string, day: "day1" | "day2" } | null>(null);

  const [isConfirmDeleteRoleModalOpen, setIsConfirmDeleteRoleModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<TeamMember | null>(null);

  const [isConfirmUpdateActiveEventModalOpen, setIsConfirmUpdateActiveEventModalOpen] = useState(false);
  const [pendingEventUpdate, setPendingEventUpdate] = useState<TimelineEvent | null>(null);

  const [userSearch, setUserSearch] = useState("");

  const currentUser = teamRoles.find(r => r.role === currentRole);
  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    const timer = setTimeout(() => {
      toast("9:30 AM: Reminder - Bunga Rampai distribution should begin now.", {
        icon: "🌸",
        duration: 10000,
      });
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    const date = now.getDate();
    if (month === 6) {
      if (date === 4) setActiveTab("day1");
      else if (date === 5) setActiveTab("day2");
    }
  }, []);

  const getAssigneeDisplay = (roleName: string) => {
    if (roleName === "All") return "All";
    const role = teamRoles.find(r => r.role === roleName);
    if (role) return `${role.shortRole} - ${role.names.join(' & ')}`;
    return roleName;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const checkEvents = (events: TimelineEvent[]) => {
        events.forEach(event => {
          if (event.time === timeString && !notifiedEvents.has(event.id)) {
            if (isAdmin) toast.info(`Scheduled Event Now: ${event.title}`, { icon: "⏰", duration: 10000 });
            setNotifiedEvents(prev => new Set(prev).add(event.id));
          }
        });
      };
      checkEvents(day1Events);
      checkEvents(day2Events);
    }, 10000);
    return () => clearInterval(interval);
  }, [day1Events, day2Events, isAdmin, notifiedEvents]);

  const shouldNotifyTask = (taskAssignees: string[]) => {
    if (isAdmin) return true;
    if (taskAssignees.includes("All")) return true;
    if (taskAssignees.includes(currentRole)) return true;
    if (currentUser && taskAssignees.includes(currentUser.names[0])) return true;
    return false;
  };

  const addLog = (msg: string) => {
    setLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), role: currentRole, msg }, ...prev]);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isCompleted = !t.completed;
        addLog(isCompleted ? `Completed task: ${t.task}` : `Unchecked task: ${t.task}`);
        if (shouldNotifyTask(t.assignees)) {
          if (isCompleted) toast.success(`Task completed: ${t.task}`);
          else toast(`Task unchecked: ${t.task}`, { icon: "⏳" });
        }
        return { ...t, completed: isCompleted };
      }
      return t;
    }));
  };

  const handleDeleteEvent = (event: TimelineEvent, day: "day1" | "day2") => {
    if (event.startedAt) { toast.error(`Cannot delete ${event.title}. It is currently active.`); return; }
    setEventToDelete({ id: event.id, day });
    setIsConfirmDeleteEventModalOpen(true);
  };

  const confirmDeleteEvent = () => {
    if (!eventToDelete) return;
    const { id, day } = eventToDelete;
    if (day === "day1") {
      const evt = day1Events.find(e => e.id === id);
      if (evt) { addLog(`Deleted event: ${evt.title}`); toast(`Deleted event: ${evt.title}`, { icon: "🗑️" }); }
      setDay1Events(day1Events.filter(e => e.id !== id));
    } else {
      const evt = day2Events.find(e => e.id === id);
      if (evt) { addLog(`Deleted event: ${evt.title}`); toast(`Deleted event: ${evt.title}`, { icon: "🗑️" }); }
      setDay2Events(day2Events.filter(e => e.id !== id));
    }
    setIsConfirmDeleteEventModalOpen(false);
    setEventToDelete(null);
  };

  const handleDeleteTask = (task: ChecklistItem) => {
    if (task.completed) { toast.error(`Cannot delete ${task.task}. It is already completed.`); return; }
    setTaskToDelete(task.id);
    setIsConfirmDeleteTaskModalOpen(true);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    const task = tasks.find(t => t.id === taskToDelete);
    if (task) {
      addLog(`Deleted task: ${task.task}`);
      if (shouldNotifyTask(task.assignees)) toast(`Deleted task: ${task.task}`, { icon: "🗑️" });
    }
    setTasks(tasks.filter(t => t.id !== taskToDelete));
    setIsConfirmDeleteTaskModalOpen(false);
    setTaskToDelete(null);
  };

  const handleDeleteRole = (role: TeamMember) => {
    const isAssignedToEvent = day1Events.some(e => e.assignees.includes(role.role)) || day2Events.some(e => e.assignees.includes(role.role));
    const isAssignedToTask = tasks.some(t => t.assignees.includes(role.role));
    if (isAssignedToEvent || isAssignedToTask) {
      toast.error(`Cannot delete ${role.role}. It is assigned to events or tasks.`);
      return;
    }
    setRoleToDelete(role);
    setIsConfirmDeleteRoleModalOpen(true);
  };

  const confirmDeleteRole = () => {
    if (!roleToDelete) return;
    setTeamRoles(teamRoles.filter(r => r.role !== roleToDelete.role));
    addLog(`Deleted role: ${roleToDelete.role}`);
    toast.success(`Deleted role: ${roleToDelete.role}`);
    setIsConfirmDeleteRoleModalOpen(false);
    setRoleToDelete(null);
    setIsRoleModalOpen(false);
  };

  const openEventModal = (day: "day1" | "day2", event?: TimelineEvent) => {
    setEventModalDay(day);
    setEditingEvent(event || null);
    setIsEventModalOpen(true);
  };

  const openTaskModal = (task?: ChecklistItem) => {
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  };

  const openAddRoleModal = () => { setEditingRole(null); setIsNewRole(true); setIsRoleModalOpen(true); };
  const openEditRoleModal = (member: TeamMember) => { setEditingRole(member); setIsNewRole(false); setIsRoleModalOpen(true); };

  const startEvent = (event: TimelineEvent, day: "day1" | "day2") => {
    setEventToStart({ event, day });
    setIsConfirmStartModalOpen(true);
  };

  const confirmStartEvent = () => {
    if (!eventToStart) return;
    const { event, day } = eventToStart;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedEvent = { ...event, startedAt: timeNow };
    const clearStartedAt = (evs: TimelineEvent[]) => evs.map(ev => ({ ...ev, startedAt: undefined }));
    const clearedDay1 = clearStartedAt(day1Events);
    const clearedDay2 = clearStartedAt(day2Events);
    if (day === "day1") {
      setDay1Events(clearedDay1.map(ev => ev.id === event.id ? updatedEvent : ev));
      setDay2Events(clearedDay2);
    } else {
      setDay1Events(clearedDay1);
      setDay2Events(clearedDay2.map(ev => ev.id === event.id ? updatedEvent : ev));
    }
    setActiveCueEvent(updatedEvent);
    addLog(`Started event: ${event.title}`);
    toast.success(`Event Started: ${event.title}`);
    setIsConfirmStartModalOpen(false);
    setEventToStart(null);
  };

  const saveRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const namesString = formData.get("names") as string;
    const names = namesString.split(',').map(n => n.trim()).filter(n => n);
    const shortRole = formData.get("shortRole") as string;
    const description = formData.get("description") as string;
    if (isNewRole) {
      const roleTitle = formData.get("role") as string;
      const isAdminRole = formData.get("isAdmin") === "on";
      const newRole: TeamMember = { role: roleTitle, shortRole, names, description, isAdmin: isAdminRole };
      setTeamRoles([...teamRoles, newRole]);
      addLog(`Added new role: ${roleTitle}`);
    } else if (editingRole) {
      const updatedRole: TeamMember = { ...editingRole, shortRole, names, description };
      setTeamRoles(teamRoles.map(r => r.role === editingRole.role ? updatedRole : r));
      addLog(`Updated role: ${editingRole.role}`);
    }
    setIsRoleModalOpen(false);
  };

  const saveEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignees = formData.getAll("assignees") as string[];
    if (assignees.length === 0) assignees.push(currentRole);
    const newEvent: TimelineEvent = {
      id: editingEvent?.id || `evt-${Date.now()}`,
      time: formData.get("time") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      assignees,
      isMainEvent: formData.get("isMainEvent") === "on",
      notes: formData.get("notes") as string,
      startedAt: editingEvent?.startedAt,
    };
    if (editingEvent?.startedAt) { setPendingEventUpdate(newEvent); setIsConfirmUpdateActiveEventModalOpen(true); return; }
    commitEventUpdate(newEvent);
  };

  const commitEventUpdate = (newEvent: TimelineEvent) => {
    if (eventModalDay === "day1") {
      if (editingEvent) {
        setDay1Events(day1Events.map(ev => ev.id === newEvent.id ? newEvent : ev));
        toast.success(`Updated event: ${newEvent.title}`);
      } else {
        setDay1Events([...day1Events, newEvent]);
        toast.success(`Added event: ${newEvent.title}`);
      }
    } else {
      if (editingEvent) {
        setDay2Events(day2Events.map(ev => ev.id === newEvent.id ? newEvent : ev));
        toast.success(`Updated event: ${newEvent.title}`);
      } else {
        setDay2Events([...day2Events, newEvent]);
        toast.success(`Added event: ${newEvent.title}`);
      }
    }
    addLog(`Saved event: ${newEvent.title}`);
    if (activeCueEvent?.id === newEvent.id) setActiveCueEvent(newEvent);
    setIsEventModalOpen(false);
    setIsConfirmUpdateActiveEventModalOpen(false);
    setPendingEventUpdate(null);
  };

  const saveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignees = formData.getAll("assignees") as string[];
    if (assignees.length === 0) assignees.push(currentRole);
    const newTask: ChecklistItem = {
      id: editingTask?.id || `tsk-${Date.now()}`,
      task: formData.get("task") as string,
      assignees,
      completed: editingTask?.completed || false,
      priority: formData.get("priority") as ChecklistItem['priority'],
      day: formData.get("day") as ChecklistItem['day'],
      dueDate: formData.get("dueDate") as string,
      notes: formData.get("notes") as string,
    };
    if (editingTask) {
      setTasks(tasks.map(t => t.id === newTask.id ? newTask : t));
      addLog(`Updated task: ${newTask.task}`);
      if (shouldNotifyTask(newTask.assignees)) toast.success(`Task updated: ${newTask.task}`);
    } else {
      setTasks([...tasks, newTask]);
      addLog(`Added task: ${newTask.task}`);
      if (shouldNotifyTask(newTask.assignees)) toast.success(`Task created: ${newTask.task}`);
    }
    setIsTaskModalOpen(false);
  };

  const renderRSVPSection = () => {
    const stats = {
      total: rsvps.reduce((acc, r) => acc + (r.status === 'Confirmed' ? r.guests + 1 : 0), 0),
      confirmed: rsvps.filter(r => r.status === 'Confirmed').length,
      pending: rsvps.filter(r => r.status === 'Pending').length,
      declined: rsvps.filter(r => r.status === 'Declined').length,
    };
    return (
      <div className="space-y-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gold-50 border-gold-200"><CardContent className="p-4 text-center"><p className="text-xs text-gold-600 uppercase font-bold">Total Guests</p><p className="text-2xl font-serif font-bold text-gold-700">{stats.total}</p></CardContent></Card>
          <Card className="bg-sage-50 border-sage-200"><CardContent className="p-4 text-center"><p className="text-xs text-sage-600 uppercase font-bold">Confirmed</p><p className="text-2xl font-serif font-bold text-sage-700">{stats.confirmed}</p></CardContent></Card>
          <Card className="bg-blue-50 border-blue-200"><CardContent className="p-4 text-center"><p className="text-xs text-blue-600 uppercase font-bold">Pending</p><p className="text-2xl font-serif font-bold text-blue-700">{stats.pending}</p></CardContent></Card>
          <Card className="bg-red-50 border-red-200"><CardContent className="p-4 text-center"><p className="text-xs text-red-600 uppercase font-bold">Declined</p><p className="text-2xl font-serif font-bold text-red-700">{stats.declined}</p></CardContent></Card>
        </div>
        <Card className="border-sage-200 overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">RSVP Submissions</CardTitle>
            <MailCheck className="h-5 w-5 text-gold-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-sage-50 text-sage-700 uppercase text-[10px] font-bold sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 bg-sage-50">Name</th>
                    <th className="px-4 py-3 bg-sage-50">Guests</th>
                    <th className="px-4 py-3 bg-sage-50">Status</th>
                    <th className="px-4 py-3 bg-sage-50">Dietary</th>
                    <th className="px-4 py-3 bg-sage-50">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-sage-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-sage-900">{rsvp.name}<p className="text-[10px] text-sage-500 font-normal">{rsvp.email}</p></td>
                      <td className="px-4 py-3 text-sage-600">{rsvp.guests + 1}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border",
                          rsvp.status === 'Confirmed' ? "bg-green-50 text-green-700 border-green-200" :
                          rsvp.status === 'Declined' ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-blue-50 text-blue-700 border-blue-200")}>{rsvp.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sage-500 italic max-w-[150px] truncate">{rsvp.dietaryRequirements || "–"}</td>
                      <td className="px-4 py-3">
                        <select value={rsvp.status} onChange={(e) => { const s = e.target.value as RSVP['status']; setRsvps(rsvps.map(r => r.id === rsvp.id ? { ...r, status: s } : r)); toast(`Updated ${rsvp.name}'s status to ${s}`); }}
                          className="bg-white border border-sage-200 rounded px-2 py-1 text-[10px] font-bold text-sage-700 focus:outline-none focus:ring-1 focus:ring-gold-500">
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUserManagementSection = () => {
    const filteredMembers = teamRoles.filter(member =>
      member.names.some(name => name.toLowerCase().includes(userSearch.toLowerCase())) ||
      member.role.toLowerCase().includes(userSearch.toLowerCase())
    );
    return (
      <div className="space-y-6 pb-24">
        <Card className="border-sage-200">
          <CardHeader className="pb-3 space-y-4">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Team Access Control</CardTitle>
              <ShieldCheck className="h-5 w-5 text-gold-500" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" />
              <input type="text" placeholder="Search by name or role..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-sage-50 border border-sage-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto divide-y divide-sage-100">
              {filteredMembers.length > 0 ? filteredMembers.map((member) => (
                <div key={member.role} className="p-4 flex items-center justify-between hover:bg-sage-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-bold">{member.shortRole}</div>
                    <div><p className="font-bold text-sage-900">{member.names.join(' & ')}</p><p className="text-xs text-sage-500">{member.role}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox id={`admin-${member.role}`} checked={member.isAdmin} onCheckedChange={(checked) => { setTeamRoles(teamRoles.map(r => r.role === member.role ? { ...r, isAdmin: !!checked } : r)); toast(`${member.role} admin status updated`); }} />
                      <label htmlFor={`admin-${member.role}`} className="text-xs font-medium text-sage-600">Admin</label>
                    </div>
                    <button onClick={() => openEditRoleModal(member)} className="p-2 text-sage-400 hover:text-gold-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-sage-500 italic text-sm">No team members found matching "{userSearch}"</div>
              )}
            </div>
          </CardContent>
        </Card>
        <button onClick={openAddRoleModal} className="w-full py-4 border-2 border-dashed border-sage-200 rounded-xl text-sage-500 hover:border-gold-300 hover:text-gold-600 hover:bg-gold-50/30 transition-all flex items-center justify-center gap-2 font-medium">
          <UserPlus className="h-5 w-5" />Add New Team Member / Role
        </button>
      </div>
    );
  };

  const renderTimeline = (events: TimelineEvent[], day: "day1" | "day2") => {
    const grouped = groupEventsByTime(events);
    return (
      <div className="relative border-l-2 border-gold-200 ml-3 md:ml-6 space-y-6 md:space-y-8 pb-24">
        {grouped.map((group, i) => {
          const isMainGroup = group.events.some(e => e.isMainEvent);
          return (
            <motion.div key={group.time} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative">
              <div className={cn("absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 bg-white", isMainGroup ? "border-gold-500 bg-gold-100" : "border-sage-400")} />
              <div className="flex items-center gap-2 text-gold-600 font-semibold mb-3 pl-5 md:pl-8">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" /><span className="text-sm md:text-base">{group.time}</span>
              </div>
              <div className="pl-5 md:pl-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {group.events.map(event => (
                  <Card key={event.id} onClick={() => openEventModal(day, event)} className={cn("transition-all duration-300 hover:shadow-md relative group cursor-pointer overflow-hidden",
                    event.startedAt ? "border-gold-500 ring-2 ring-gold-200 bg-gold-50/30" : event.isMainEvent ? "border-gold-300 shadow-sm" : "border-sage-100")}>
                    {event.startedAt && <div className="absolute top-0 left-0 w-full h-1 bg-gold-500 animate-pulse" />}
                    <div className="absolute top-3 right-3 opacity-100 flex gap-2 items-center">
                      {event.startedAt && (
                        <div className="flex items-center gap-1 bg-gold-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          <div className="w-1 h-1 bg-white rounded-full" />LIVE
                        </div>
                      )}
                      {!event.startedAt && (currentRole === "Coordinator" || currentRole === "Floor manager") && (
                        <button onClick={(e) => { e.stopPropagation(); startEvent(event, day); }} className="px-2 py-1 bg-gold-500 text-white text-[10px] font-bold uppercase rounded shadow-sm hover:bg-gold-600 opacity-0 group-hover:opacity-100 transition-opacity">Start</button>
                      )}
                    </div>
                    <CardHeader className="pb-3 pt-4 px-4 md:px-6">
                      <div className="flex flex-col gap-2 pr-24">
                        <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Users className="h-3 w-3 text-sage-400" />
                            {event.assignees.map(role => (
                              <span key={role} className="text-[10px] md:text-xs font-medium text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-100">{getAssigneeDisplay(role)}</span>
                            ))}
                          </div>
                          {event.startedAt && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gold-700 bg-gold-100 px-2.5 py-1 rounded-full w-fit border border-gold-200">
                              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-pulse" />Started at {event.startedAt}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 md:px-6 pb-4">
                      <CardDescription className="text-sm text-gray-600">{event.description}</CardDescription>
                      {event.notes && (
                        <div className="mt-3 text-xs bg-gold-50 p-2.5 rounded-md text-gold-800 border border-gold-100 flex gap-2 items-start">
                          <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gold-500" /><span className="leading-relaxed">{event.notes}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderChecklistSection = (title: string, dayTasks: ChecklistItem[]) => {
    const cu = teamRoles.find(r => r.role === currentRole);
    const ia = cu?.isAdmin;
    const visibleTasks = dayTasks.filter(task => {
      if (ia) return true;
      return task.assignees.includes(currentRole) || (cu?.names.some(n => task.assignees.includes(n))) || task.assignees.includes("All");
    });
    if (visibleTasks.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-base md:text-lg font-serif font-semibold text-gold-700 mb-3 md:mb-4">{title}</h3>
        <Card className="border-sage-200">
          <CardContent className="p-0">
            <div className="divide-y divide-sage-100">
              {visibleTasks.map((task) => (
                <div key={task.id} onClick={() => openTaskModal(task)} className={cn("flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4 p-3 md:p-4 transition-colors hover:bg-sage-50/50 relative group cursor-pointer", task.completed ? "opacity-60" : "")}>
                  <div className="flex items-start gap-3 md:gap-4 flex-1 w-full">
                    <div onClick={(e) => e.stopPropagation()}><Checkbox id={task.id} checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-1" /></div>
                    <div className="flex-1 space-y-1.5 md:space-y-2 pr-12 sm:pr-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 md:gap-2">
                        <label htmlFor={task.id} onClick={(e) => e.preventDefault()} className={cn("text-sm md:text-base font-medium leading-tight cursor-pointer", task.completed ? "line-through text-gray-500" : "text-gray-900")}>{task.task}</label>
                        <div className="flex items-center gap-2"><PriorityBadge priority={task.priority} /></div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        {task.assignees.map(role => (
                          <div key={role} className="flex items-center gap-1 bg-sage-50 text-sage-700 px-2 py-0.5 md:py-1 rounded-md border border-sage-100 text-[10px] md:text-xs font-medium">
                            <User className="h-3 w-3 text-sage-400" />{getAssigneeDisplay(role)}
                          </div>
                        ))}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 bg-gold-50 text-gold-700 px-2 py-0.5 md:py-1 rounded-md border border-gold-100 text-[10px] md:text-xs font-medium">
                            <Calendar className="h-3 w-3 text-gold-400" />{task.dueDate}
                          </div>
                        )}
                      </div>
                      {task.notes && (
                        <div className="mt-2 text-xs bg-gray-50 p-2.5 rounded-md text-gray-600 border border-gray-100 flex gap-2 items-start">
                          <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" /><span className="leading-relaxed">{task.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fbf9f1] text-gray-900 font-sans selection:bg-gold-200 relative pb-20 flex flex-col">
      <Toaster position="top-center" />
      <header className="bg-white border-b border-gold-200 sticky top-0 z-10 shadow-sm">
        {activeCueEvent && (
          <div onClick={() => setIsActiveCueModalOpen(true)} className="cursor-pointer bg-gold-600 text-white px-4 py-2.5 flex items-center justify-center gap-2 text-xs md:text-sm font-medium border-b-[3px] border-red-400 shadow-[0_4px_12px_rgba(234,179,8,0.3)] relative hover:bg-gold-700 transition-colors">
            <span className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
            <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
            <span className="uppercase tracking-wider opacity-90 font-bold">Active Cue:</span>
            <span className="font-extrabold text-white drop-shadow-md">{activeCueEvent.title}</span>
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 py-2 md:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarHeart className="h-5 w-5 md:h-6 md:w-6 text-gold-500" />
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-serif font-bold text-gold-600 tracking-tight leading-none">Dan & Nad</h1>
              <p className="text-sage-600 font-medium tracking-wide uppercase text-[8px] md:text-[10px] mt-0.5">Wedding Planning</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className="text-xs border border-sage-200 rounded-md bg-white text-sage-700 py-1 px-2 focus:ring-2 focus:ring-gold-500 outline-none shadow-sm">
              {teamRoles.map(r => <option key={r.role} value={r.role}>{getAssigneeDisplay(r.role)}</option>)}
            </select>
            <button onClick={handleLogout} title="Logout" className="p-1.5 text-sage-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8 w-full">
        <div className="flex flex-wrap justify-center mb-6 gap-2 px-2">
          <button onClick={() => { setActiveCategory('timeline'); setActiveTab('day1'); }} className={cn("px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2", activeCategory === 'timeline' ? "bg-gold-500 text-white shadow-md" : "bg-sage-100 text-sage-600 hover:bg-sage-200")}>
            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />Timeline
          </button>
          <button onClick={() => { setActiveCategory('ops'); setActiveTab('checklists'); }} className={cn("px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2", activeCategory === 'ops' ? "bg-gold-500 text-white shadow-md" : "bg-sage-100 text-sage-600 hover:bg-sage-200")}>
            <LayoutDashboard className="h-3.5 w-3.5 md:h-4 md:w-4" />Operations
          </button>
          {isAdmin && (
            <button onClick={() => { setActiveCategory('admin'); setActiveTab('rsvps'); }} className={cn("px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-sm font-bold transition-all flex items-center gap-1.5 md:gap-2", activeCategory === 'admin' ? "bg-gold-500 text-white shadow-md" : "bg-sage-100 text-sage-600 hover:bg-sage-200")}>
              <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4" />Admin
            </button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6 md:mb-8">
            <TabsList className="flex w-full max-w-md overflow-x-auto no-scrollbar bg-sage-100/50 p-1 rounded-lg">
              {activeCategory === 'timeline' && (<><TabsTrigger value="day1" className="flex-1 whitespace-nowrap text-xs md:text-sm">Day 1 (4th July)</TabsTrigger><TabsTrigger value="day2" className="flex-1 whitespace-nowrap text-xs md:text-sm">Day 2 (5th July)</TabsTrigger></>)}
              {activeCategory === 'ops' && (<><TabsTrigger value="checklists" className="flex-1 whitespace-nowrap text-xs md:text-sm">Tasks</TabsTrigger><TabsTrigger value="team" className="flex-1 whitespace-nowrap text-xs md:text-sm">Team</TabsTrigger><TabsTrigger value="live" className="flex-1 whitespace-nowrap text-xs md:text-sm relative">Live{activeCueEvent && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}</TabsTrigger></>)}
              {activeCategory === 'admin' && (<><TabsTrigger value="rsvps" className="flex-1 whitespace-nowrap text-xs md:text-sm">RSVPs</TabsTrigger><TabsTrigger value="users" className="flex-1 whitespace-nowrap text-xs md:text-sm">Users</TabsTrigger></>)}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <TabsContent value="day1" className="mt-0 outline-none">
                <div className="mb-6"><h2 className="text-xl md:text-2xl font-serif font-semibold text-gold-700 mb-1 md:mb-2">Day 1: The Ceremony</h2><p className="text-sm md:text-base text-sage-600">Plan: 7:00 AM - 7:00 PM | Main Event: 10:00 AM - 4:00 PM</p></div>
                {renderTimeline(day1Events, "day1")}
              </TabsContent>
              <TabsContent value="day2" className="mt-0 outline-none">
                <div className="mb-6"><h2 className="text-xl md:text-2xl font-serif font-semibold text-gold-700 mb-1 md:mb-2">Day 2: The Reception</h2><p className="text-sm md:text-base text-sage-600">Plan: 10:00 AM - 10:00 PM | Main Event: 2:00 PM - 7:00 PM</p></div>
                {renderTimeline(day2Events, "day2")}
              </TabsContent>
              <TabsContent value="checklists" className="mt-0 outline-none pb-24">
                <div className="mb-6 flex items-center gap-3"><ListTodo className="h-5 w-5 md:h-6 md:w-6 text-gold-500" /><h2 className="text-xl md:text-2xl font-serif font-semibold text-gold-700">To-Do List</h2></div>
                {renderChecklistSection("Pre-Wedding", tasks.filter(t => t.day === "Pre-wedding"))}
                {renderChecklistSection("Day 1", tasks.filter(t => t.day === "Day 1"))}
                {renderChecklistSection("Day 2", tasks.filter(t => t.day === "Day 2"))}
              </TabsContent>
              <TabsContent value="team" className="mt-0 outline-none pb-24 space-y-6">
                <Card className="border-sage-200 shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg text-sage-800">Team Overview</CardTitle>
                    {isAdmin && (<button onClick={openAddRoleModal} className="flex items-center gap-1 text-sm bg-gold-50 text-gold-600 px-3 py-1.5 rounded-md hover:bg-gold-100 transition-colors border border-gold-200"><Plus className="w-4 h-4" /> Add Role</button>)}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {teamRoles.map(member => (
                        <div key={member.role} onClick={() => { if (isAdmin) openEditRoleModal(member); }} className={cn("flex flex-col p-3 bg-white border border-sage-100 rounded-lg shadow-sm transition-colors", isAdmin ? "cursor-pointer hover:bg-sage-50/80" : "")}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col"><span className="font-bold text-gold-700">{member.role} ({member.shortRole})</span><span className="text-sm text-sage-600">{member.names.join(' & ')}</span></div>
                            {member.isAdmin && <span className="text-[10px] uppercase font-bold bg-gold-100 text-gold-700 px-2 py-1 rounded-full border border-gold-200">Admin</span>}
                          </div>
                          {member.description && <p className="text-xs text-gray-600 leading-relaxed border-t border-sage-50 pt-2">{member.description}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="live" className="mt-0 outline-none pb-24 space-y-6">
                <Card className="border-sage-200 shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-lg text-sage-800">Event Logs</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => { addLog("Need Help!"); toast.error(`${currentRole} needs help!`); }} className="py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium text-sm active:scale-95 transition-all shadow-sm">Help Needed</button>
                      <button onClick={() => { addLog("Task Done"); toast.success(`${currentRole} completed a task.`); }} className="py-2.5 bg-sage-50 text-sage-600 border border-sage-200 rounded-lg font-medium text-sm active:scale-95 transition-all shadow-sm">Task Done</button>
                      <button onClick={() => { addLog("Running Late!"); toast("Running late!", { icon: "⚠️" }); }} className="py-2.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg font-medium text-sm active:scale-95 transition-all shadow-sm">Running Late</button>
                      <button onClick={() => { addLog("Ready for Next Cue"); toast.success(`${currentRole} is ready!`); }} className="py-2.5 bg-gold-50 text-gold-700 border border-gold-200 rounded-lg font-medium text-sm active:scale-95 transition-all shadow-sm">Ready!</button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 h-64 overflow-y-auto border border-gray-200 space-y-2 shadow-inner">
                      {logs.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No recent activity</p> : logs.map(log => (
                        <div key={log.id} className="text-sm p-2.5 bg-white rounded-md border border-gray-100 shadow-sm">
                          <div className="flex justify-between text-xs text-gray-500 mb-1"><span className="font-medium text-gold-700">{log.role}</span><span>{log.time}</span></div>
                          <p className="text-gray-800">{log.msg}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-sage-200 shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-lg text-sage-800">Bridesmaid Check-in</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {bridesmaids.map((b) => {
                      const hasArrived = arrivals[b.role];
                      return (
                        <div key={b.role} className="flex items-center justify-between p-3 bg-white border border-sage-100 rounded-lg shadow-sm">
                          <span className={cn("font-medium", hasArrived ? "text-sage-400 line-through" : "text-sage-700")}>{b.role} - {b.names.join(' & ')}</span>
                          {hasArrived ? (
                            <div className="flex items-center gap-1.5 text-sage-600 bg-sage-50 px-3 py-1.5 rounded-full text-sm font-medium border border-sage-200"><CheckCircle2 className="w-4 h-4" /> Arrived</div>
                          ) : (
                            <button onClick={() => { setArrivals(prev => ({ ...prev, [b.role]: true })); addLog(`${b.role} has arrived.`); }} disabled={currentRole !== b.role && !isAdmin} className="px-4 py-1.5 bg-sage-100 hover:bg-sage-200 text-sage-700 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Mark Arrived</button>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rsvps" className="mt-0 outline-none">{renderRSVPSection()}</TabsContent>
              <TabsContent value="users" className="mt-0 outline-none">{renderUserManagementSection()}</TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>

      <footer className="text-center py-8 text-xs text-sage-500 opacity-80 mt-auto">Created with ❤️ by Dan & Nad</footer>

      <button onClick={() => activeTab === 'checklists' ? openTaskModal() : openEventModal(activeTab as "day1" | "day2")} className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-white shadow-lg hover:bg-gold-600 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-gold-200">
        <Plus className="h-6 w-6" />
      </button>

      {/* Active Cue Modal */}
      <Dialog open={isActiveCueModalOpen} onOpenChange={setIsActiveCueModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg p-4 md:p-6">
          <DialogHeader><DialogTitle>Active Event Details</DialogTitle></DialogHeader>
          {activeCueEvent && (
            <div className="space-y-4 mt-4">
              <h3 className="text-xl font-bold text-gold-700">{activeCueEvent.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-sage-700">Time:</span><p className="text-gray-700">{activeCueEvent.time}</p></div>
                <div><span className="font-semibold text-sage-700">Assignees:</span><div className="flex flex-wrap gap-1.5 mt-1">{activeCueEvent.assignees.map(role => <span key={role} className="text-[10px] font-medium text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md border border-sage-100">{getAssigneeDisplay(role)}</span>)}</div></div>
              </div>
              <div><span className="font-semibold text-sage-700 text-sm">Description:</span><p className="text-gray-700 text-sm mt-1">{activeCueEvent.description}</p></div>
              {activeCueEvent.notes && <div><span className="font-semibold text-sage-700 text-sm">Notes:</span><div className="mt-1 text-sm bg-gold-50 p-3 rounded-md text-gold-800 border border-gold-100 flex gap-2 items-start"><StickyNote className="w-4 h-4 mt-0.5 shrink-0 text-gold-500" /><span className="leading-relaxed">{activeCueEvent.notes}</span></div></div>}
            </div>
          )}
          <DialogFooter className="pt-4"><button onClick={() => setIsActiveCueModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-gold-500 rounded-md hover:bg-gold-600 w-full sm:w-auto">Close</button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg p-4 md:p-6">
          <DialogHeader><DialogTitle>{editingEvent ? "Edit Event" : "Add Event"}</DialogTitle></DialogHeader>
          <form onSubmit={saveEvent} className="space-y-4 mt-4">
            <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Time</label><input required name="time" defaultValue={editingEvent?.time} placeholder="e.g. 07:00 AM" className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-sage-700">Assignees</label>
              <div className="bg-white border border-sage-200 rounded-md p-3 max-h-40 overflow-y-auto"><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2"><Checkbox id="event-assignee-All" name="assignees" value="All" defaultChecked={editingEvent?.assignees?.includes("All")} /><label htmlFor="event-assignee-All" className="text-sm cursor-pointer">All</label></div>
                {teamRoles.map(r => <div key={r.role} className="flex items-center gap-2"><Checkbox id={`event-assignee-${r.role}`} name="assignees" value={r.role} defaultChecked={editingEvent?.assignees?.includes(r.role)} /><label htmlFor={`event-assignee-${r.role}`} className="text-sm cursor-pointer">{getAssigneeDisplay(r.role)}</label></div>)}
              </div></div>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Title</label><input required name="title" defaultValue={editingEvent?.title} placeholder="e.g. Wake up & Breakfast" className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Description</label><textarea required name="description" defaultValue={editingEvent?.description} rows={2} className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Notes (Optional)</label><textarea name="notes" defaultValue={editingEvent?.notes} rows={2} className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
            <div className="flex items-center gap-2 pt-2"><Checkbox id="isMainEvent" name="isMainEvent" defaultChecked={editingEvent?.isMainEvent} /><label htmlFor="isMainEvent" className="text-sm font-medium text-sage-700 cursor-pointer">Highlight as Main Event</label></div>
            <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-between w-full">
              {editingEvent && <button type="button" onClick={() => { setIsEventModalOpen(false); handleDeleteEvent(editingEvent, eventModalDay); }} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 w-full sm:w-auto mb-2 sm:mb-0">Delete Event</button>}
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 text-sm font-medium text-sage-600 bg-sage-50 rounded-md hover:bg-sage-100 w-full sm:w-auto mb-2 sm:mb-0">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gold-500 rounded-md hover:bg-gold-600 w-full sm:w-auto">Save Event</button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg p-4 md:p-6">
          <DialogHeader><DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle></DialogHeader>
          <form onSubmit={saveTask} className="space-y-4 mt-4">
            <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Task</label><input required name="task" defaultValue={editingTask?.task} placeholder="e.g. Confirm final headcount" className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-sage-700">Assignees</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-sage-200 p-3 rounded-md max-h-40 overflow-y-auto bg-white">
                <div className="flex items-center gap-2"><Checkbox id="assignee-All" name="assignees" value="All" defaultChecked={editingTask?.assignees?.includes("All")} /><label htmlFor="assignee-All" className="text-sm cursor-pointer">All</label></div>
                {teamRoles.map(r => <div key={r.role} className="flex items-center gap-2"><Checkbox id={`assignee-${r.role}`} name="assignees" value={r.role} defaultChecked={editingTask?.assignees?.includes(r.role)} /><label htmlFor={`assignee-${r.role}`} className="text-sm cursor-pointer">{getAssigneeDisplay(r.role)}</label></div>)}
              </div>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Due Date (Optional)</label><input name="dueDate" defaultValue={editingTask?.dueDate} placeholder="e.g. Oct 10" className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Priority</label><select name="priority" defaultValue={editingTask?.priority || "Medium"} className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
              <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Day</label><select name="day" defaultValue={editingTask?.day || "Pre-wedding"} className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"><option value="Pre-wedding">Pre-wedding</option><option value="Day 1">Day 1</option><option value="Day 2">Day 2</option></select></div>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Notes (Optional)</label><textarea name="notes" defaultValue={editingTask?.notes} rows={2} className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
            <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-between w-full">
              {editingTask && <button type="button" onClick={() => { setIsTaskModalOpen(false); handleDeleteTask(editingTask); }} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 w-full sm:w-auto mb-2 sm:mb-0">Delete Task</button>}
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-sm font-medium text-sage-600 bg-sage-50 rounded-md hover:bg-sage-100 w-full sm:w-auto mb-2 sm:mb-0">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gold-500 rounded-md hover:bg-gold-600 w-full sm:w-auto">Save Task</button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-lg p-4 md:p-6">
          <DialogHeader><DialogTitle>{isNewRole ? "Add New Role" : `Edit Role: ${editingRole?.role}`}</DialogTitle></DialogHeader>
          <form onSubmit={saveRole} className="space-y-4 mt-4">
            {isNewRole && <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Role Title</label><input required name="role" placeholder="e.g. Photographer" className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Short Form</label><input required name="shortRole" defaultValue={editingRole?.shortRole} placeholder="e.g. BM" className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
              <div className="flex items-center gap-3 pt-6"><Checkbox id="isBridesmaid" name="isBridesmaid" defaultChecked={editingRole?.isBridesmaid} /><label htmlFor="isBridesmaid" className="text-sm font-medium text-sage-700 cursor-pointer">Is Bridesmaid?</label></div>
            </div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Names (comma separated)</label><input required name="names" defaultValue={editingRole?.names?.join(', ')} placeholder="e.g. Anna, John" className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-sage-700">Description</label><textarea name="description" defaultValue={editingRole?.description} rows={3} className="w-full rounded-md border border-sage-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500" /></div>
            {isNewRole && <div className="flex items-center gap-2 pt-2"><Checkbox id="isAdminRole" name="isAdmin" /><label htmlFor="isAdminRole" className="text-sm font-medium text-sage-700 cursor-pointer">Grant Admin Permissions</label></div>}
            <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-between w-full">
              {!isNewRole && <button type="button" onClick={() => handleDeleteRole(editingRole!)} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 w-full sm:w-auto mb-2 sm:mb-0">Delete Role</button>}
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-sage-600 bg-sage-50 rounded-md hover:bg-sage-100 w-full sm:w-auto mb-2 sm:mb-0">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gold-500 rounded-md hover:bg-gold-600 w-full sm:w-auto">{isNewRole ? "Add Role" : "Save Changes"}</button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Modals */}
      <Dialog open={isConfirmStartModalOpen} onOpenChange={setIsConfirmStartModalOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 md:p-6"><DialogHeader><DialogTitle>Confirm Action</DialogTitle></DialogHeader>
          <div className="py-4"><p className="text-sage-700">Start <strong>{eventToStart?.event.title}</strong>?</p></div>
          <DialogFooter><button type="button" onClick={() => setIsConfirmStartModalOpen(false)} className="px-4 py-2 text-sm font-medium text-sage-600 bg-sage-50 rounded-md hover:bg-sage-100 w-full sm:w-auto mb-2 sm:mb-0">Cancel</button><button type="button" onClick={confirmStartEvent} className="px-4 py-2 text-sm font-medium text-white bg-gold-500 rounded-md hover:bg-gold-600 w-full sm:w-auto">Confirm</button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isConfirmDeleteTaskModalOpen} onOpenChange={setIsConfirmDeleteTaskModalOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 md:p-6"><DialogHeader><DialogTitle>Confirm Deletion</DialogTitle></DialogHeader>
          <div className="py-4"><p className="text-sage-700">Delete this task?</p></div>
          <DialogFooter><button type="button" onClick={() => setIsConfirmDeleteTaskModalOpen(false)} className="px-4 py-2 text-sm font-medium text-sage-600 bg-sage-50 rounded-md hover:bg-sage-100 w-full sm:w-auto mb-2 sm:mb-0">Cancel</button><button type="button" onClick={confirmDeleteTask} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 w-full sm:w-auto">Delete</button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isConfirmDeleteEventModalOpen} onOpenChange={setIsConfirmDeleteEventModalOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 md:p-6"><DialogHeader><DialogTitle>Confirm Deletion</DialogTitle></DialogHeader>
          <div className="py-4"><p className="text-sage-700">Delete this event?</p></div>
          <DialogFooter><button type="button" onClick={() => setIsConfirmDeleteEventModalOpen(false)} className="px-4 py-2 text-sm font-medium text-sage-600 bg-sage-50 rounded-md hover:bg-sage-100 w-full sm:w-auto mb-2 sm:mb-0">Cancel</button><button type="button" onClick={confirmDeleteEvent} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 w-full sm:w-auto">Delete</button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isConfirmDeleteRoleModalOpen} onOpenChange={setIsConfirmDeleteRoleModalOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 md:p-6"><DialogHeader><DialogTitle>Confirm Deletion</DialogTitle></DialogHeader>
          <div className="py-4"><p className="text-sage-700">Delete role <strong>{roleToDelete?.role}</strong>?</p></div>
          <DialogFooter><button type="button" onClick={() => setIsConfirmDeleteRoleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-sage-600 bg-sage-50 rounded-md hover:bg-sage-100 w-full sm:w-auto mb-2 sm:mb-0">Cancel</button><button type="button" onClick={confirmDeleteRole} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 w-full sm:w-auto">Delete</button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isConfirmUpdateActiveEventModalOpen} onOpenChange={setIsConfirmUpdateActiveEventModalOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 md:p-6"><DialogHeader><DialogTitle>Update Active Event</DialogTitle></DialogHeader>
          <div className="py-4"><p className="text-sage-700"><strong>{pendingEventUpdate?.title}</strong> is currently active. Update it anyway?</p></div>
          <DialogFooter><button type="button" onClick={() => { setIsConfirmUpdateActiveEventModalOpen(false); setPendingEventUpdate(null); }} className="px-4 py-2 text-sm font-medium text-sage-600 bg-sage-50 rounded-md hover:bg-sage-100 w-full sm:w-auto mb-2 sm:mb-0">Cancel</button><button type="button" onClick={() => pendingEventUpdate && commitEventUpdate(pendingEventUpdate)} className="px-4 py-2 text-sm font-medium text-white bg-gold-500 rounded-md hover:bg-gold-600 w-full sm:w-auto">Update</button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
