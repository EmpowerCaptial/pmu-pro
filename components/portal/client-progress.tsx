"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Star, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Award,
  Target,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react'

interface ProgressMilestone {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  date?: string
  points: number
}

interface ClientProgressProps {
  clientName: string
  totalPoints: number
  level: number
  nextLevelPoints: number
  completedServices: string[]
  upcomingAppointments: any[]
  milestones: ProgressMilestone[]
}

export function ClientProgress({ 
  clientName, 
  totalPoints, 
  level, 
  nextLevelPoints, 
  completedServices,
  upcomingAppointments,
  milestones 
}: ClientProgressProps) {
  const progressToNextLevel = ((totalPoints % 100) / 100) * 100

  const getLevelTitle = (level: number) => {
    const titles = {
      1: 'Newcomer',
      2: 'Explorer',
      3: 'Enthusiast',
      4: 'Connoisseur',
      5: 'Expert',
      6: 'Master',
      7: 'Legend'
    }
    return titles[level as keyof typeof titles] || 'Legend'
  }

  const getLevelColor = (level: number) => {
    const colors = {
      1: 'bg-gray-500',
      2: 'bg-green-500',
      3: 'bg-blue-500',
      4: 'bg-purple-500',
      5: 'bg-pink-500',
      6: 'bg-orange-500',
      7: 'bg-red-500'
    }
    return colors[level as keyof typeof colors] || 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Level & Points Card */}
      <Card className="bg-gradient-to-r from-lavender/10 to-purple-500/10 border-lavender/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-lavender" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Level {level} - {getLevelTitle(level)}
              </h3>
              <p className="text-sm text-gray-600">
                {totalPoints} total points earned
              </p>
            </div>
            <div className={`p-3 rounded-full ${getLevelColor(level)} text-white`}>
              <Star className="h-6 w-6" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {level + 1}</span>
              <span>{Math.round(progressToNextLevel)}%</span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
            <p className="text-xs text-gray-500">
              {nextLevelPoints - (totalPoints % 100)} more points to reach Level {level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{completedServices.length}</h3>
            <p className="text-sm text-gray-600">Services Completed</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-8 w-8 text-lavender" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</h3>
            <p className="text-sm text-gray-600">Upcoming Sessions</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{milestones.filter(m => m.completed).length}</h3>
            <p className="text-sm text-gray-600">Milestones Achieved</p>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-lavender" />
            Your Journey Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div 
                key={milestone.id}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border transition-all duration-300
                  ${milestone.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                <div className={`
                  p-3 rounded-full
                  ${milestone.completed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                  }
                `}>
                  {milestone.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                    {milestone.completed && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{milestone.description}</p>
                  {milestone.date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Completed on {milestone.date}
                    </p>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-lavender">
                    +{milestone.points}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-lavender/5 to-purple-500/5 border-lavender/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-lavender" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-lavender/20">
              <div className="p-2 bg-lavender/20 rounded-full">
                <Heart className="h-4 w-4 text-lavender" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Book Your Next Service</h4>
                <p className="text-sm text-gray-600">Explore our services and schedule your next appointment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-lavender/20">
              <div className="p-2 bg-lavender/20 rounded-full">
                <TrendingUp className="h-4 w-4 text-lavender" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Earn More Points</h4>
                <p className="text-sm text-gray-600">Complete services and referrals to level up faster</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-lavender/20">
              <div className="p-2 bg-lavender/20 rounded-full">
                <Star className="h-4 w-4 text-lavender" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Unlock Rewards</h4>
                <p className="text-sm text-gray-600">Redeem your points for exclusive benefits and discounts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

