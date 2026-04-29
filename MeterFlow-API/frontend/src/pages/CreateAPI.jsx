import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Loader2, Key, Zap } from 'lucide-react'

const CreateAPI = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:5000/api/apis', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      navigate('/dashboard')
    } catch (error) {
      console.error('Create API error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Create New API
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md">
            Set up and configure your API endpoint with pricing details.
          </p>
        </div>
      </header>

      <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 border border-white/20 rounded-3xl shadow-xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                API Name
              </label>
              <input
                {...register('name', { required: 'API name is required' })}
                type="text"
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="e.g., User Management API"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="baseUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Base URL
              </label>
              <input
                {...register('baseUrl', { required: 'Base URL is required', pattern: { value: /^https?:\/\/.+/, message: 'Must be valid URL' } })}
                type="text"
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="https://api.example.com"
              />
              {errors.baseUrl && <p className="mt-1 text-sm text-red-600">{errors.baseUrl.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Describe what your API does..."
              rows="4"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
            <div>
              <label htmlFor="endpoint" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Endpoint
              </label>
              <input
                {...register('endpoint', { required: 'Endpoint is required' })}
                type="text"
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="e.g., /api/users"
              />
              {errors.endpoint && <p className="mt-1 text-sm text-red-600">{errors.endpoint.message}</p>}
            </div>

            {/* <div>
              <label htmlFor="pricingModel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pricing Model
              </label>
              <select
                {...register('pricingModel', { required: 'Pricing model is required' })}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              >
                <option value="">Select Pricing Model</option>
                <option value="pay_per_request">Pay Per Request</option>
                <option value="subscription">Subscription</option>
                <option value="freemium">Freemium</option>
                <option value="flat_rate">Flat Rate</option>
              </select>
              {errors.pricingModel && <p className="mt-1 text-sm text-red-600">{errors.pricingModel.message}</p>}
            </div>*/}
          {/* </div>  */}

          {/* <div>
            <label htmlFor="pricePerRequest" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Price Per Request ($)
            </label>
            <input
              {...register('pricePerRequest', { required: 'Price per request is required', pattern: { value: /^\d+(\.\d{1,4})?$/, message: 'Must be a valid number' } })}
              type="number"
              step="0.0001"
              min="0"
              className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="0.001"
            />
            {errors.pricePerRequest && <p className="mt-1 text-sm text-red-600">{errors.pricePerRequest.message}</p>}
          </div> */}

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating API...</span>
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  <span>Create API</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="group relative flex justify-center py-3 px-6 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAPI