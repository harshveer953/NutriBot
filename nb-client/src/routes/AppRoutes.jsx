import React, { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import DashboardLayout from '../layouts/DashboardLayout'

import LoginPage    from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

const DashboardPage         = lazy(() => import('../pages/dashboard/DashboardPage'))
const MealsPage             = lazy(() => import('../pages/meals/MealsPage'))
const AddMealPage           = lazy(() => import('../pages/meals/AddMealPage'))
const MyMealPlanPage        = lazy(() => import('../pages/meals/MyMealPlanPage'))
const WorkoutPage           = lazy(() => import('../pages/workouts/WorkoutPage'))
const AddWorkoutPage        = lazy(() => import('../pages/workouts/AddWorkoutPage'))
const AIHealthCoachPage     = lazy(() => import('../pages/ai/AIHealthCoachPage'))
const MealRecognitionPage   = lazy(() => import('../pages/ai/MealRecognitionPage'))
const MealTextAnalyzerPage  = lazy(() => import('../pages/ai/MealTextAnalyzerPage'))
const MealPlannerPage       = lazy(() => import('../pages/ai/MealPlannerPage'))
const GroceryListPage       = lazy(() => import('../pages/ai/GroceryListPage'))
const AnalyticsDashboard    = lazy(() => import('../pages/analytics/AnalyticsDashboard'))
const ProfilePage           = lazy(() => import('../pages/profile/ProfilePage'))
const DailyLogPage          = lazy(() => import('../pages/daily/DailyLogPage'))
const StreaksPage            = lazy(() => import('../pages/gamification/Streaks'))
const BadgesPage             = lazy(() => import('../pages/gamification/Badges'))

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { token, _hydrated } = useAuthStore()
  if (!_hydrated) return <Spinner />
  if (!token)     return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { token, _hydrated } = useAuthStore()
  if (!_hydrated) return <Spinner />
  if (token)      return <Navigate to="/dashboard" replace />
  return children
}

// Catches 401 event fired by axios interceptor — navigates cleanly (no reload)
function UnauthorizedHandler() {
  const navigate = useNavigate()
  const logout   = useAuthStore((s) => s.logout)
  useEffect(() => {
    const handler = () => { logout(); navigate('/login', { replace: true }) }
    window.addEventListener('nf:unauthorized', handler)
    return () => window.removeEventListener('nf:unauthorized', handler)
  }, [navigate, logout])
  return null
}

const S = (Page) => <Suspense fallback={<Spinner />}><Page /></Suspense>

export default function AppRoutes() {
  return (
    <>
      <UnauthorizedHandler />
      <Routes>
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index                     element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"          element={S(DashboardPage)} />
          <Route path="meals"              element={S(MealsPage)} />
          <Route path="meals/add"          element={S(AddMealPage)} />
          <Route path="meals/my-plan"      element={S(MyMealPlanPage)} />
          <Route path="workouts"           element={S(WorkoutPage)} />
          <Route path="workouts/add"       element={S(AddWorkoutPage)} />
          <Route path="ai/coach"           element={S(AIHealthCoachPage)} />
          <Route path="ai/snap"            element={S(MealRecognitionPage)} />
          <Route path="ai/text-analyzer"   element={S(MealTextAnalyzerPage)} />
          <Route path="ai/planner"         element={S(MealPlannerPage)} />
          <Route path="ai/grocery"         element={S(GroceryListPage)} />
          <Route path="analytics"          element={S(AnalyticsDashboard)} />
          <Route path="profile"            element={S(ProfilePage)} />
          <Route path="daily-log"          element={S(DailyLogPage)} />
          <Route path="streaks"            element={S(StreaksPage)} />
          <Route path="badges"             element={S(BadgesPage)} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
