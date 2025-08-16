import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  Edit3,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Home,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Download,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react'
import { adminService } from '@/lib/adminService'

interface User {
  id: string
  user_id: string
  unit_number: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  directory_opt_in: boolean
  show_email: boolean
  show_phone: boolean
  show_unit: boolean
  created_at: string
  updated_at: string
  user?: {
    email: string
    created_at: string
  }
}

interface UserManagementSystemProps {
  onClose: () => void
}

const UserManagementSystem: React.FC<UserManagementSystemProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'directory_opt_in' | 'recent'>('all')
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'unit' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // New user form state
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    unit_number: '',
    phone: '',
    directory_opt_in: true,
    show_email: true,
    show_phone: false,
    show_unit: true,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllUsers()
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setLoading(true)
      await adminService.updateUserStatus(userId, updates)
      await loadUsers()
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      // Note: This would need to be implemented in adminService
      console.log('Delete user:', userId)
      await loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: 'directory_opt_in' | 'directory_opt_out' | 'delete') => {
    if (selectedUsers.length === 0) return

    const confirmMessage =
      action === 'delete'
        ? `Are you sure you want to delete ${selectedUsers.length} users? This cannot be undone.`
        : `Apply ${action.replace('_', ' ')} to ${selectedUsers.length} selected users?`

    if (!confirm(confirmMessage)) return

    try {
      setLoading(true)
      for (const userId of selectedUsers) {
        if (action === 'directory_opt_in') {
          await adminService.updateUserStatus(userId, { directory_opt_in: true })
        } else if (action === 'directory_opt_out') {
          await adminService.updateUserStatus(userId, { directory_opt_in: false })
        } else if (action === 'delete') {
          console.log('Delete user:', userId)
        }
      }
      setSelectedUsers([])
      await loadUsers()
    } catch (error) {
      console.error('Error performing bulk action:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedUsers = users
    .filter((user) => {
      const matchesSearch =
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.unit_number.toLowerCase().includes(searchTerm.toLowerCase())

      switch (filter) {
        case 'directory_opt_in':
          return matchesSearch && user.directory_opt_in
        case 'recent':
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return matchesSearch && new Date(user.created_at) > weekAgo
        case 'active':
          return matchesSearch && user.directory_opt_in
        default:
          return matchesSearch
      }
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`,
          )
          break
        case 'unit':
          comparison = a.unit_number.localeCompare(b.unit_number)
          break
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">
              {filteredAndSortedUsers.length} users
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddUser(true)}
              className="flex items-center space-x-2 rounded-lg border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-blue-400 transition-all hover:bg-blue-500/30"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </motion.button>
            <button onClick={onClose} className="text-white/70 transition-colors hover:text-white">
              ✕
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 border-b border-white/10 p-6">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-white/50" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/30 py-3 pl-10 pr-4 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                placeholder="Search users by name, email, or unit..."
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-lg border border-white/20 bg-black/30 px-4 py-3 text-white focus:border-blue-400 focus:outline-none"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="directory_opt_in">Directory Members</option>
              <option value="recent">Recent (7 days)</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-')
                setSortBy(sort as any)
                setSortOrder(order as any)
              }}
              className="rounded-lg border border-white/20 bg-black/30 px-4 py-3 text-white focus:border-blue-400 focus:outline-none"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="unit-asc">Unit (Low-High)</option>
              <option value="unit-desc">Unit (High-Low)</option>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4"
            >
              <span className="font-medium text-blue-300">{selectedUsers.length} selected</span>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBulkAction('directory_opt_in')}
                  disabled={loading}
                  className="rounded border border-green-500/30 bg-green-500/20 px-4 py-2 text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-50"
                >
                  Add to Directory
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBulkAction('directory_opt_out')}
                  disabled={loading}
                  className="rounded border border-yellow-500/30 bg-yellow-500/20 px-4 py-2 text-yellow-400 transition-all hover:bg-yellow-500/30 disabled:opacity-50"
                >
                  Remove from Directory
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBulkAction('delete')}
                  disabled={loading}
                  className="rounded border border-red-500/30 bg-red-500/20 px-4 py-2 text-red-400 transition-all hover:bg-red-500/30 disabled:opacity-50"
                >
                  Delete
                </motion.button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="rounded border border-gray-500/30 bg-gray-500/20 px-4 py-2 text-gray-400 transition-all hover:bg-gray-500/30"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-400"></div>
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-white/60">
              <Users className="mb-4 h-16 w-16 opacity-50" />
              <h3 className="mb-2 text-xl font-semibold">No Users Found</h3>
              <p>No users match your current search and filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-black/20">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredAndSortedUsers.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredAndSortedUsers.map((u) => u.user_id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        className="h-4 w-4 rounded border-white/30 bg-black/30 text-blue-400 focus:ring-blue-400"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/80">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/80">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/80">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/80">
                      Directory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/80">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/80">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAndSortedUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="transition-colors hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.user_id])
                            } else {
                              setSelectedUsers(selectedUsers.filter((id) => id !== user.user_id))
                            }
                          }}
                          className="h-4 w-4 rounded border-white/30 bg-black/30 text-blue-400 focus:ring-blue-400"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 font-semibold text-white">
                            {user.first_name.charAt(0)}
                            {user.last_name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-white">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-white/60">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-white">{user.unit_number}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-white/80">
                            <Mail className="mr-1 h-3 w-3" />
                            {user.show_email ? (
                              <Eye className="h-3 w-3 text-green-400" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-white/80">
                              <Phone className="mr-1 h-3 w-3" />
                              {user.show_phone ? (
                                <Eye className="h-3 w-3 text-green-400" />
                              ) : (
                                <EyeOff className="h-3 w-3 text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.directory_opt_in
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {user.directory_opt_in ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Listed
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Private
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/70">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingUser(user)}
                            className="rounded p-2 text-blue-400 transition-all hover:bg-blue-500/20"
                          >
                            <Edit3 className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="rounded p-2 text-red-400 transition-all hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        <AnimatePresence>
          {editingUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="max-h-[90%] w-full max-w-2xl overflow-y-auto rounded-xl bg-slate-800"
              >
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Edit User</h3>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="text-white/70 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block font-medium text-white">First Name</label>
                        <input
                          value={editingUser.first_name}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, first_name: e.target.value })
                          }
                          className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-medium text-white">Last Name</label>
                        <input
                          value={editingUser.last_name}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, last_name: e.target.value })
                          }
                          className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block font-medium text-white">Email</label>
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block font-medium text-white">Unit Number</label>
                        <input
                          value={editingUser.unit_number}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, unit_number: e.target.value })
                          }
                          className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-medium text-white">Phone</label>
                        <input
                          value={editingUser.phone || ''}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, phone: e.target.value })
                          }
                          className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-white">Directory Settings</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingUser.directory_opt_in}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, directory_opt_in: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-white/30 bg-black/30 text-blue-400 focus:ring-blue-400"
                          />
                          <span className="text-white">Include in resident directory</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingUser.show_email}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, show_email: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-white/30 bg-black/30 text-blue-400 focus:ring-blue-400"
                          />
                          <span className="text-white">Show email in directory</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingUser.show_phone}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, show_phone: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-white/30 bg-black/30 text-blue-400 focus:ring-blue-400"
                          />
                          <span className="text-white">Show phone in directory</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingUser.show_unit}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, show_unit: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-white/30 bg-black/30 text-blue-400 focus:ring-blue-400"
                          />
                          <span className="text-white">Show unit number in directory</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateUser(editingUser.user_id, editingUser)}
                        disabled={loading}
                        className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/20 py-3 font-medium text-blue-400 transition-all hover:bg-blue-500/30 disabled:opacity-50"
                      >
                        Save Changes
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingUser(null)}
                        className="rounded-lg border border-gray-500/30 bg-gray-500/20 px-6 py-3 text-gray-400 transition-all hover:bg-gray-500/30"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default UserManagementSystem
