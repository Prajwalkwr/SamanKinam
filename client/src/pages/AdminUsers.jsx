import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'

const AdminUsers = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getAllUsers
      })
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setSubmitting(true)
      const response = await Axios({
        ...SummaryApi.createAdminUser,
        data: formData
      })

      if (response.data.success) {
        toast.success(response.data.message)
        setFormData({ name: '', email: '', password: '' })
        fetchUsers()
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteUser,
        data: { _id: userId }
      })

      if (response.data.success) {
        toast.success(response.data.message)
        fetchUsers()
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <section>
      <div className='p-2 bg-white shadow-md flex items-center justify-between'>
        <h2 className='font-semibold'>Admin Users</h2>
      </div>

      <div className='grid gap-6 md:grid-cols-[1fr,320px] mt-4'>
        <div className='bg-white p-4 rounded shadow-sm'>
          <h3 className='font-semibold mb-4'>Existing Users</h3>
          {loading ? (
            <div className='text-sm text-neutral-500'>Loading users...</div>
          ) : (
            <div className='space-y-3'>
              {users.length === 0 ? (
                <div className='text-sm text-neutral-500'>No users found.</div>
              ) : (
                users.map(user => (
                  <div key={user._id} className='border rounded p-3 bg-slate-50'>
                    <div className='flex justify-between gap-4'>
                      <div>
                        <p className='font-semibold'>{user.name || 'No name'}</p>
                        <p className='text-sm text-neutral-500'>{user.email}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700'>
                          {user.role}
                        </div>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className='text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200'
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className='text-xs text-neutral-500 mt-2'>Status: {user.status || 'Unknown'}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className='bg-white p-4 rounded shadow-sm'>
          <h3 className='font-semibold mb-4'>Create Admin User</h3>
          <form className='grid gap-4' onSubmit={handleSubmit}>
            <div className='grid gap-1'>
              <label htmlFor='name' className='font-medium'>Name</label>
              <input
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                className='bg-blue-50 p-2 border rounded outline-none focus:border-primary-200'
                placeholder='Admin name'
                required
              />
            </div>
            <div className='grid gap-1'>
              <label htmlFor='email' className='font-medium'>Email</label>
              <input
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                type='email'
                className='bg-blue-50 p-2 border rounded outline-none focus:border-primary-200'
                placeholder='admin@example.com'
                required
              />
            </div>
            <div className='grid gap-1'>
              <label htmlFor='password' className='font-medium'>Password</label>
              <input
                id='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                type='password'
                className='bg-blue-50 p-2 border rounded outline-none focus:border-primary-200'
                placeholder='Admin password'
                required
              />
            </div>
            <button
              type='submit'
              disabled={submitting}
              className={`text-white py-2 rounded font-semibold ${submitting ? 'bg-gray-500' : 'bg-green-700 hover:bg-green-600'}`}
            >
              {submitting ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default AdminUsers
