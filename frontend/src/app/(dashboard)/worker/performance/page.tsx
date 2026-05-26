"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Target, MessageSquare, Clock } from "lucide-react";
import { useWorkerStats, useRatingTrend } from "@/lib/api-client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function WorkerPerformancePage() {
  const { data: stats, isLoading: isStatsLoading } = useWorkerStats();
  const { data: trendData, isLoading: isTrendLoading } = useRatingTrend();

  if (isStatsLoading || isTrendLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading performance stats...</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Performance & Ratings</h2>
        <p className="text-muted-foreground">View your statistics, ratings, and achievements.</p>
      </div>

      {/* Aggregate Score & Components */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Overall Score</CardTitle>
            <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.overallScore}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on {stats.totalReviews} reviews</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality (40%)</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scoreQuality}</div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= Math.round(stats.scoreQuality) ? 'text-blue-500 fill-blue-500' : 'text-slate-300'}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deadline (40%)</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scoreDeadline}</div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= Math.round(stats.scoreDeadline) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Communication (20%)</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scoreCommunication}</div>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-3 w-3 ${star <= Math.round(stats.scoreCommunication) ? 'text-purple-500 fill-purple-500' : 'text-slate-300'}`} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Achievements */}
        <Card className="col-span-3 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Badges you've earned from great performance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.badges?.length === 0 && (
              <div className="text-sm text-muted-foreground italic">No badges earned yet. Keep up the good work!</div>
            )}
            {stats.badges?.map((badge: any, index: number) => (
              <div key={index} className={`flex items-center gap-4 p-3 rounded-lg border ${
                index % 2 === 0 
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10' 
                  : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10'
              }`}>
                <div className={`p-2 rounded-full ${
                  index % 2 === 0 ? 'bg-amber-100 dark:bg-amber-900' : 'bg-emerald-100 dark:bg-emerald-900'
                }`}>
                  {index % 2 === 0 ? <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" /> : <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div>
                  <div className={`font-semibold ${
                    index % 2 === 0 ? 'text-amber-900 dark:text-amber-400' : 'text-emerald-900 dark:text-emerald-400'
                  }`}>{badge.name}</div>
                  <div className={`text-sm ${
                    index % 2 === 0 ? 'text-amber-700 dark:text-amber-500' : 'text-emerald-700 dark:text-emerald-500'
                  }`}>{badge.description}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card className="col-span-4 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Feedback from project admins.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.recentReviews?.length === 0 && (
              <div className="text-sm text-muted-foreground italic">No reviews received yet.</div>
            )}
            {stats.recentReviews?.map((review: any, index: number) => (
              <div key={index}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{review.projectTitle}</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${star <= Math.round(review.overallScore) ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{review.reviewText}"</p>
                  <div className="text-xs text-slate-500">— Reviewed by {review.adminName}, {new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
                {index < stats.recentReviews.length - 1 && (
                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mt-6" />
                )}
              </div>
            ))}
          </CardContent>
        {/* Rating Trend Chart */}
        <Card className="col-span-7 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Rating Trend (6 Months)</CardTitle>
            <CardDescription>Your performance rating history over time.</CardDescription>
          </CardHeader>
          <CardContent>
            {(!trendData || trendData.length === 0) ? (
              <div className="text-sm text-muted-foreground text-center py-8">No trend data available yet.</div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="averageScore" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
