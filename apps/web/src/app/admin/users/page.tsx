'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from '@event-organizer/ui/components/toast';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  type User,
} from '@event-organizer/services';

export default function UsersPage() {
  const { data, isLoading, error } = useUsers({ sort: 'created_at', dir: 'desc' });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Username: '',
    Password: '',
    UserType: 'PROJECT_USER' as 'SYSTEM_ADMIN' | 'PROJECT_USER',
    EventId: '',
  });

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingUser(null);
    setFormData({
      Name: '',
      Email: '',
      Username: '',
      Password: '',
      UserType: 'PROJECT_USER',
      EventId: '',
    });
  };

  const handleCreate = async () => {
    if (
      !formData.Name.trim() ||
      !formData.Email.trim() ||
      !formData.Username.trim() ||
      !formData.Password.trim()
    ) {
      toast.error('Name, Email, Username, and Password are required');
      return;
    }

    try {
      await createUser.mutateAsync({
        username: formData.Username,
        password: formData.Password,
        role: formData.UserType,
      });

      toast.success(`User "${formData.Username}" created successfully`);
      resetForm();
    } catch (err) {
      console.error('Create error:', err);
      toast.error('Failed to create user. Please try again.');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      Name: user.Name || '',
      Email: user.Email || '',
      Username: user.Username || '',
      Password: '', // Don't pre-fill password for security
      UserType: user.UserType || 'PROJECT_USER',
      EventId: user.ProjectID ? String(user.ProjectID) : '',
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    if (!formData.Username.trim()) {
      toast.error('Username is required');
      return;
    }

    try {
      await updateUser.mutateAsync({
        userId: editingUser.ID!,
        data: {
          username: formData.Username,
          password: formData.Password || undefined, // Only update if provided
          role: formData.UserType,
        },
      });

      toast.success(`User "${formData.Username}" updated successfully`);
      resetForm();
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update user. Please try again.');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser.mutateAsync(userId);
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  🎉 Event Organizer
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
              <p className="mt-2 text-gray-600">
                Create and view user profiles (staff/admins)
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create User
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Failed to load users. Check API configuration and auth token.
              <br />
              <small className="text-xs">Error: {error.message}</small>
            </div>
          )}

          {/* Form Modal */}
          {(showCreateForm || editingUser) && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingUser ? 'Edit User' : 'Create New User'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.Name}
                        onChange={(e) =>
                          setFormData({ ...formData, Name: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.Email}
                        onChange={(e) =>
                          setFormData({ ...formData, Email: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={formData.Username}
                        onChange={(e) =>
                          setFormData({ ...formData, Username: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="username"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password {editingUser ? '(leave empty to keep current)' : '*'}
                      </label>
                      <input
                        type="password"
                        value={formData.Password}
                        onChange={(e) =>
                          setFormData({ ...formData, Password: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={editingUser ? 'Leave empty to keep current password' : 'Password'}
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        User Type *
                      </label>
                      <select
                        value={formData.UserType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            UserType: e.target.value as 'SYSTEM_ADMIN' | 'PROJECT_USER',
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="PROJECT_USER">Project User</option>
                        <option value="SYSTEM_ADMIN">System Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Event ID (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.EventId}
                        onChange={(e) =>
                          setFormData({ ...formData, EventId: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={editingUser ? handleUpdate : handleCreate}
                        disabled={
                          editingUser ? updateUser.isPending : createUser.isPending
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {editingUser
                          ? updateUser.isPending
                            ? 'Updating...'
                            : 'Update User'
                          : createUser.isPending
                            ? 'Creating...'
                            : 'Create User'}
                      </button>
                      <button
                        onClick={resetForm}
                        disabled={createUser.isPending || updateUser.isPending}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500">Loading users...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.Data?.map((user) => (
                    <tr key={user.ID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{user.ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.Name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.Username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.Email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.UserType === 'SYSTEM_ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.UserType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.ProjectID ? String(user.ProjectID) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.CreatedAt
                          ? new Date(user.CreatedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(user)}
                          disabled={deleteUser.isPending}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.ID!)}
                          disabled={deleteUser.isPending}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleteUser.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!isLoading && (!data?.Data || data.Data.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No users found. Create your first user above.
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {data?.Pagination && (data.Pagination.TotalData ?? 0) > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {data.Data?.length ?? 0} of {data.Pagination.TotalData} users (Page{' '}
              {data.Pagination.Page} of {data.Pagination.TotalPage})
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
