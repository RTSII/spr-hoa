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
  EyeOff
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
    show_unit: true
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

    const confirmMessage = action === 'delete'
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
    .filter(user => {
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
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
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
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <span className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">
              {filteredAndSortedUsers.length} users
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddUser(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </motion.button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-white/10 space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                placeholder="Search users by name, email, or unit..."
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
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
              className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
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
              className="flex items-center space-x-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            >
              <span className="text-blue-300 font-medium">
                {selectedUsers.length} selected
              </span>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBulkAction('directory_opt_in')}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500/20 text-green-400 rounded border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50"
                >
                  Add to Directory
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBulkAction('directory_opt_out')}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 hover:bg-yellow-500/30 transition-all disabled:opacity-50"
                >
                  Remove from Directory
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBulkAction('delete')}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-50"
                >
                  Delete
                </motion.button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded border border-gray-500/30 hover:bg-gray-500/30 transition-all"
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
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/60">
              <Users className="h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
              <p>No users match your current search and filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/20 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredAndSortedUsers.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredAndSortedUsers.map(u => u.user_id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        className="w-4 h-4 text-blue-400 bg-black/30 border-white/30 rounded focus:ring-blue-400"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Directory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
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
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.user_id])
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.user_id))
                            }
                          }}
                          className="w-4 h-4 text-blue-400 bg-black/30 border-white/30 rounded focus:ring-blue-400"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-white font-medium">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-white/60 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-mono">
                        {user.unit_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-white/80 text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.show_email ? (
                              <Eye className="h-3 w-3 text-green-400" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-white/80 text-sm">
                              <Phone className="h-3 w-3 mr-1" />
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.directory_opt_in
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.directory_opt_in ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Listed
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Private
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/70 text-sm">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingUser(user)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-all"
                          >
                            <Edit3 className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-all"
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
              className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90%] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
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
                        <label className="block text-white font-medium mb-2">First Name</label>
                        <input
                          value={editingUser.first_name}
                          onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                          className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Last Name</label>
                        <input
                          value={editingUser.last_name}
                          onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                          className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Unit Number</label>
                        <input
                          value={editingUser.unit_number}
                          onChange={(e) => setEditingUser({...editingUser, unit_number: e.target.value})}
                          className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Phone</label>
                        <input
                          value={editingUser.phone || ''}
                          onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                          className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Directory Settings</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingUser.directory_opt_in}
                            onChange={(e) => setEditingUser({...editingUser, directory_opt_in: e.target.checked})}
                            className="w-4 h-4 text-blue-400 bg-black/30 border-white/30 rounded focus:ring-blue-400"
                          />
                          <span className="text-white">Include in resident directory</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingUser.show_email}
                            onChange={(e) => setEditingUser({...editingUser, show_email: e.target.checked})}
                            className="w-4 h-4 text-blue-400 bg-black/30 border-white/30 rounded focus:ring-blue-400"
                          />
                          <span className="text-white">Show email in directory</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingUser.show_phone}
                            onChange={(e) => setEditingUser({...editingUser, show_phone: e.target.checked})}
                            className="w-4 h-4 text-blue-400 bg-black/30 border-white/30 rounded focus:ring-blue-400"
                          />
                          <span className="text-white">Show phone in directory</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={editingUser.show_unit}
                            onChange={(e) => setEditingUser({...editingUser, show_unit: e.target.checked})}
                            className="w-4 h-4 text-blue-400 bg-black/30 border-white/30 rounded focus:ring-blue-400"
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
                        className="flex-1 py-3 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-all disabled:opacity-50 font-medium"
                      >
                        Save Changes
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingUser(null)}
                        className="px-6 py-3 bg-gray-500/20 text-gray-400 rounded-lg border border-gray-500/30 hover:bg-gray-500/30 transition-all"
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
