import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Code2, Github, GraduationCap, Users, Building } from "lucide-react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: (role: "student" | "instructor" | "business") => void;
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<"student" | "instructor" | "business">("student");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
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
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Login as</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === "student"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <GraduationCap className={`w-8 h-8 mx-auto mb-2 ${
                    selectedRole === "student" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <div className={`text-sm font-medium ${
                    selectedRole === "student" ? "text-blue-600" : "text-gray-600"
                  }`}>
                    Learner
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("instructor")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === "instructor"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 ${
                    selectedRole === "instructor" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <div className={`text-sm font-medium ${
                    selectedRole === "instructor" ? "text-blue-600" : "text-gray-600"
                  }`}>
                    Instructor
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("business")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRole === "business"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Building className={`w-8 h-8 mx-auto mb-2 ${
                    selectedRole === "business" ? "text-blue-600" : "text-gray-400"
                  }`} />
                  <div className={`text-sm font-medium ${
                    selectedRole === "business" ? "text-blue-600" : "text-gray-600"
                  }`}>
                    Business
                  </div>
                </button>
              </div>
            </div>

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
          </form>
        </div>
      </div>
    </div>
  );
}