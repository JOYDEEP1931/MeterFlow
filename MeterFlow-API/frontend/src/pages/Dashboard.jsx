"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, Zap, Key, CreditCard, Users, Clock } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const DashboardStats = () => {
  const user = useAuthStore((state) => state.user)
  
  const { data: stats } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => axios.get('/api/analytics/summary').then(res => res.data),
  })

  const statCards = [
    {
      title: 'Total Requests',
      value: stats?.totalRequests?.toLocaleString() || '0',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Revenue',
      value: `$${stats?.totalCost?.toFixed(2) || '0'}`,
      change: '+23.1%',
      icon: CreditCard,
      color: 'green'
    },
    {
      title: 'Avg Latency',
      value: stats?.avgLatency ? `${stats.avgLatency.toFixed(0)}ms` : '0ms',
      change: '-2.3%',
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Error Rate',
      value: `${((stats?.errorCount / stats?.totalRequests) * 100 || 0).toFixed(1)}%`,
      change: '-1.2%',
      icon: Zap,
      color: 'red'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group">
          <div className="flex items-center justify-between">
            <div className={`p-4 rounded-2xl bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
              <stat.icon className="w-8 h-8 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-200">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                {stat.title}
              </p>
              <span className={`text-xs font-semibold mt-1 inline-flex items-center px-2 py-1 rounded-full ${
                stat.change.startsWith('+') 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md">
            Overview of your API usage, revenue, and performance metrics.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary px-8 h-12">
            Create API
          </button>
          <button className="btn-secondary px-8 h-12">
            New Key
          </button>
        </div>
      </header>

      <DashboardStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 border border-white/20 rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Usage Overview
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip />
                <Bar dataKey="requests" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 border border-white/20 rounded-3xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              API Status
            </h3>
            <div className="space-y-4">
              {apis.map((api, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${api.status === 'active' ? 'green' : 'orange'}-400`} />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{api.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{api.endpoint}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    api.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
                  }`}>
                    {api.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Upgrade to Pro</h3>
            <p className="opacity-90 mb-6">Unlimited APIs, advanced analytics, priority support</p>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
              Upgrade Now - $29/mo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const usageData = [
  { date: 'Jan', requests: 400 },
  { date: 'Feb', requests: 300 },
  { date: 'Mar', requests: 600 },
  { date: 'Apr', requests: 500 },
  { date: 'May', requests: 700 },
]

const apis = [
  { name: 'User API', endpoint: '/api/users', status: 'active' },
  { name: 'Payment API', endpoint: '/api/payments', status: 'active' },
  { name: 'Analytics API', endpoint: '/api/analytics', status: 'paused' },
]
