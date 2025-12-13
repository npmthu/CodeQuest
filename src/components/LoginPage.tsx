import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Code2, Github, Shield } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
  onSwitchToAdmin?: () => void;
}

export default function LoginPage({ onLogin, onSwitchToRegister, onSwitchToAdmin }: LoginPageProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Illustration/Branding */}
        <div className="hidden md:flex flex-col justify-center space-y-6 p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl text-blue-600">CodeQuest</span>
          </div>
          <h2>Master Your Coding Skills</h2>
          <p className="text-muted-foreground">
            Practice programming, prepare for interviews, and level up your skills with AI-powered learning.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">✓</span>
              </div>
              <div>
                <h4>Interactive Lessons</h4>
                <p className="text-sm text-muted-foreground">Learn with hands-on coding exercises</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">✓</span>
              </div>
              <div>
                <h4>AI Assistant</h4>
                <p className="text-sm text-muted-foreground">Get instant feedback on your code</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">✓</span>
              </div>
              <div>
                <h4>Community Support</h4>
                <p className="text-sm text-muted-foreground">Connect with fellow learners</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="mb-8">
            <h2 className="mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full">
              <Github className="w-5 h-5 mr-2" />
              Sign in with GitHub
            </Button>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Sign up
              </button>
            </div>

            {onSwitchToAdmin && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onSwitchToAdmin}
                  className="w-full text-gray-600 hover:text-blue-600"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}