"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Search,
  Shield,
  AlertTriangle,
  Calendar,
  Building,
  Eye,
  EyeOff,
  TrendingUp,
  Database,
  Clock,
  Users,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"

interface BreachDetail {
  breach: string
  details: string
  domain: string
  industry: string
  logo: string
  password_risk: string
  references: string
  searchable: string
  verified: string
  xposed_data: string
  xposed_date: string
  xposed_records: number
}

interface BreachResponse {
  BreachMetrics: {
    risk: Array<{
      risk_label: string
      risk_score: number
    }>
    passwords_strength: Array<{
      EasyToCrack: number
      PlainText: number
      StrongHash: number
      Unknown: number
    }>
    yearwise_details: Array<Record<string, number>>
    // industry can be anything the API gives us
    industry?: unknown
  }
  BreachesSummary: {
    site: string
  }
  ExposedBreaches: {
    breaches_details: BreachDetail[]
  }
  ExposedPastes: any
  PastesSummary: {
    cnt: number
    domain: string
    tmpstmp: string
  }
}

export default function EmailBreachChecker() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BreachResponse | null>(null)
  const [error, setError] = useState("")
  const [showEmail, setShowEmail] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    const history = localStorage.getItem("searchHistory")
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(email)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch breach data")
      }

      const data = await response.json()
      setResults(data)

      // Update search history
      const newHistory = [email, ...searchHistory.filter((h) => h !== email)].slice(0, 5)
      setSearchHistory(newHistory)
      localStorage.setItem("searchHistory", JSON.stringify(newHistory))
    } catch (err) {
      setError("Failed to check email. Please try again.")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLabel: string) => {
    switch (riskLabel.toLowerCase()) {
      case "low":
        return "from-green-500 to-emerald-600"
      case "medium":
        return "from-yellow-500 to-orange-500"
      case "high":
        return "from-red-500 to-rose-600"
      default:
        return "from-gray-500 to-slate-600"
    }
  }

  const getRiskIcon = (riskLabel: string) => {
    switch (riskLabel.toLowerCase()) {
      case "low":
        return <CheckCircle className="h-5 w-5" />
      case "medium":
        return <AlertCircle className="h-5 w-5" />
      case "high":
        return <XCircle className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getPasswordRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "plaintext":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white"
      case "easytocrack":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white"
      case "hardtocrack":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "unknown":
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@")
    if (local.length <= 2) return email
    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────
  /**
   * Normalise BreachMetrics.industry (which can be an object or several levels
   * of nested arrays) into a flat `[industry, count][]` array.
   */
  const getIndustryData = (): [string, number][] => {
    const raw = results?.BreachMetrics?.industry
    if (!raw) return []

    try {
      let entries: [string, number][] = []

      // Handle different data types the API might return
      if (typeof raw === "number" || typeof raw === "string") {
        // If it's just a number or string, we can't create industry breakdown
        return []
      }

      // Handle object literal → turn into entries
      if (!Array.isArray(raw) && typeof raw === "object" && raw !== null) {
        entries = Object.entries(raw).map(([key, value]) => [key, Number(value) || 0])
      }

      // Handle array formats from the API
      if (Array.isArray(raw)) {
        const first = raw[0]

        if (!first) return []

        if (Array.isArray(first)) {
          // raw = [ [ [ "Tech", 5 ], [ "Health", 2 ] ] ]
          const nested = first[0]
          if (Array.isArray(nested) && nested.length >= 2) {
            entries = nested
              .filter((item) => Array.isArray(item) && item.length >= 2)
              .map(([industry, count]) => [String(industry), Number(count) || 0])
          }
        } else if (typeof first === "object" && first !== null) {
          // raw = [ { Tech: 5, Health: 2 } ]
          entries = Object.entries(first).map(([key, value]) => [key, Number(value) || 0])
        }
      }

      return entries
        .filter(([, cnt]) => cnt > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
    } catch (error) {
      console.warn("Error parsing industry data:", error)
      return []
    }
  }

  const getTotalRecordsExposed = () => {
    if (!results?.ExposedBreaches?.breaches_details) return 0
    return results.ExposedBreaches.breaches_details.reduce((total, breach) => total + breach.xposed_records, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-colors duration-300">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10" />

      <div className="relative max-w-7xl mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Email Breach Checker
                </h1>
                <p className="text-muted-foreground mt-1">
                  Discover if your email has been compromised in data breaches
                </p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Search Card */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="h-5 w-5 text-blue-500" />
              Search for Breaches
            </CardTitle>
            <CardDescription className="text-base">
              Enter an email address to check if it has been involved in any known data breaches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Check Email
                  </>
                )}
              </Button>
            </form>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((historyEmail, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setEmail(historyEmail)}
                      className="text-xs hover:bg-muted/50"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {maskEmail(historyEmail)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {results && (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-200/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Breaches</p>
                      <p className="text-3xl font-bold text-red-600">
                        {results.ExposedBreaches?.breaches_details?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/50">
                      <Database className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Records Exposed</p>
                      <p className="text-3xl font-bold text-blue-600">{formatNumber(getTotalRecordsExposed())}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-950/50">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {results.BreachMetrics?.risk?.[0] && (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-2xl font-bold">{results.BreachMetrics.risk[0].risk_label}</p>
                          {getRiskIcon(results.BreachMetrics.risk[0].risk_label)}
                        </div>
                        <Progress value={results.BreachMetrics.risk[0].risk_score} className="mt-2 h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Paste Exposures</p>
                      <p className="text-3xl font-bold text-green-600">{results.PastesSummary?.cnt || 0}</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-950/50">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Email Header */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <span className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <Shield className="h-5 w-5" />
                    </div>
                    Analysis for {showEmail ? email : maskEmail(email)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setShowEmail(!showEmail)}>
                    {showEmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Password Security Analysis */}
            {results.BreachMetrics?.passwords_strength?.[0] && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-500" />
                    Password Security Analysis
                  </CardTitle>
                  <CardDescription>Analysis of how your passwords were stored in breached databases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border border-red-200/50">
                      <Unlock className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-600">
                        {results.BreachMetrics.passwords_strength[0].PlainText}
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-400">Plain Text</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border border-orange-200/50">
                      <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">
                        {results.BreachMetrics.passwords_strength[0].EasyToCrack}
                      </div>
                      <div className="text-sm text-orange-700 dark:text-orange-400">Easy to Crack</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200/50">
                      <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {results.BreachMetrics.passwords_strength[0].StrongHash}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-400">Strong Hash</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 border border-gray-200/50">
                      <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-600">
                        {results.BreachMetrics.passwords_strength[0].Unknown}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-400">Unknown</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Industry Breakdown */}
            {(() => {
              const industryData = getIndustryData()
              const maxCount = industryData.length ? industryData[0][1] : 1

              return (
                industryData.length > 0 && (
                  <Card className="border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-500" />
                        Industry Breakdown
                      </CardTitle>
                      <CardDescription>Industries where your data was compromised</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {industryData.map(([industry, count]) => (
                          <div key={industry} className="flex items-center gap-4">
                            <div className="w-20 text-sm font-medium capitalize">{industry}</div>
                            <div className="flex-1">
                              <Progress value={(count / maxCount) * 100} className="h-3" />
                            </div>
                            <div className="text-sm text-muted-foreground w-12 text-right">{count}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              )
            })()}

            {/* Detailed Breach Information */}
            {results.ExposedBreaches?.breaches_details && results.ExposedBreaches.breaches_details.length > 0 && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    Detailed Breach Information
                  </CardTitle>
                  <CardDescription>Complete list of data breaches involving this email address</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="list" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="list" className="text-sm">
                        List View
                      </TabsTrigger>
                      <TabsTrigger value="timeline" className="text-sm">
                        Timeline View
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="space-y-4">
                      <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
                        {results.ExposedBreaches.breaches_details.map((breach, index) => (
                          <Card
                            key={index}
                            className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow duration-200"
                          >
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">{breach.breach}</h3>
                                    {breach.verified === "Yes" && (
                                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{breach.domain}</p>
                                </div>
                                <div className="text-right space-y-2">
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {breach.xposed_date}
                                  </Badge>
                                  <div className="text-sm text-muted-foreground">
                                    {formatNumber(breach.xposed_records)} records
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {breach.industry}
                                </Badge>
                                <Badge className={getPasswordRiskColor(breach.password_risk)}>
                                  {breach.password_risk.replace(/([A-Z])/g, " $1").trim()}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{breach.details}</p>

                              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                <strong>Exposed Data:</strong> {breach.xposed_data}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-4">
                      <div className="max-h-[600px] overflow-y-auto pr-2">
                        {results.BreachMetrics?.yearwise_details?.[0] && (
                          <div className="space-y-3">
                            {Object.entries(results.BreachMetrics.yearwise_details[0])
                              .filter(([_, count]) => count > 0)
                              .sort(([a], [b]) => b.localeCompare(a))
                              .map(([year, count]) => (
                                <div
                                  key={year}
                                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border"
                                >
                                  <div className="font-semibold text-lg w-16 text-center">{year.replace("y", "")}</div>
                                  <div className="flex-1">
                                    <Progress
                                      value={
                                        (count /
                                          Math.max(...Object.values(results.BreachMetrics.yearwise_details[0]))) *
                                        100
                                      }
                                      className="h-3"
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground w-24 text-right">
                                    {count} breach{count !== 1 ? "es" : ""}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {results.ExposedBreaches?.breaches_details?.length === 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50">
                <CardContent className="text-center py-12">
                  <div className="p-4 rounded-full bg-green-100 dark:bg-green-950/50 w-fit mx-auto mb-6">
                    <Shield className="h-16 w-16 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-green-700 dark:text-green-400 mb-3">Excellent News!</h3>
                  <p className="text-green-600 dark:text-green-500 text-lg">
                    This email address was not found in any known data breaches.
                  </p>
                  <p className="text-green-600/80 dark:text-green-500/80 text-sm mt-2">
                    Your email appears to be secure from known compromises.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
