import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Activity, Eye, BarChart3, Lock } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Shield className="w-6 h-6" />
            SafetyMonitor AI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors text-sm">
              Dashboard
            </Link>
            <Link href="/monitor" className="text-foreground hover:text-primary transition-colors text-sm">
              Live Monitor
            </Link>
            <Link href="/logs" className="text-foreground hover:text-primary transition-colors text-sm">
              Logs
            </Link>
            <Link href="/analytics" className="text-foreground hover:text-primary transition-colors text-sm">
              Analytics
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-foreground leading-tight">
              Real-time Safety <span className="text-primary">Compliance</span> Monitoring
            </h1>
            <p className="text-lg text-muted-foreground">
              AI-powered video monitoring and violation detection. Protect your facility with advanced computer vision
              and instant alerts.
            </p>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">Get Started</Button>
              </Link>
              <Button variant="outline" className="border-border text-foreground hover:bg-card bg-transparent">
                Learn More
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <Eye className="w-8 h-8 text-accent" />
              <h3 className="font-semibold">Live Video Feed</h3>
              <p className="text-sm text-muted-foreground">Real-time monitoring of multiple camera feeds</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <Activity className="w-8 h-8 text-accent" />
              <h3 className="font-semibold">Instant Alerts</h3>
              <p className="text-sm text-muted-foreground">Immediate notification of safety violations</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <BarChart3 className="w-8 h-8 text-accent" />
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-muted-foreground">Detailed compliance reports and trends</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <Lock className="w-8 h-8 text-accent" />
              <h3 className="font-semibold">Enterprise Grade</h3>
              <p className="text-sm text-muted-foreground">Secure and reliable monitoring system</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Safety Detection</h3>
              <p className="text-muted-foreground">
                AI-powered computer vision detects PPE violations, unsafe practices, and hazardous situations in
                real-time.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Multi-Camera Support</h3>
              <p className="text-muted-foreground">
                Monitor multiple camera feeds simultaneously and manage them from a unified dashboard.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Compliance Reports</h3>
              <p className="text-muted-foreground">
                Generate detailed compliance reports with violation history, trends, and actionable insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to enhance your facility's safety?</h2>
          <p className="text-lg text-muted-foreground">Start monitoring with our AI-powered compliance system today.</p>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
              Start Monitoring Now
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
