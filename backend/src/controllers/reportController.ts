import { Request, Response } from 'express';
import { ReportService, BusinessReportData, InstructorReportData } from '../services/reportService';
import { AuthRequest } from '../middleware/auth';

export class ReportController {
  // Generate Business Analytics PDF Report
  async generateBusinessPDF(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // In a real application, you would fetch this data from your database
      // For now, we'll use mock data that matches the frontend structure
      const reportData: BusinessReportData = {
        title: 'Business Analytics Report',
        subtitle: 'Comprehensive Learning & Training Analytics',
        period: req.query.period as string || 'Q2 2024',
        generatedAt: new Date().toLocaleString(),
        generatedBy: req.user.email || 'Unknown User',
        sections: [],
        overviewStats: [
          {
            label: "Total Investment",
            value: "$2.4M",
            change: "+$240K this quarter",
            trend: "up"
          },
          {
            label: "ROI on Training",
            value: "285%",
            change: "+18% from last quarter",
            trend: "up"
          },
          {
            label: "Avg. Training Hours",
            value: "42h",
            change: "+6h from last quarter",
            trend: "up"
          },
          {
            label: "Certification Rate",
            value: "68%",
            change: "+5% from last quarter",
            trend: "up"
          }
        ],
        enrollmentTrend: [
          { month: "Jan", enrollments: 180, cost: 45000, roi: 220 },
          { month: "Feb", enrollments: 220, cost: 55000, roi: 240 },
          { month: "Mar", enrollments: 195, cost: 48750, roi: 235 },
          { month: "Apr", enrollments: 280, cost: 70000, roi: 265 },
          { month: "May", enrollments: 310, cost: 77500, roi: 275 },
          { month: "Jun", enrollments: 284, cost: 71000, roi: 285 }
        ],
        departmentROI: [
          { department: "Engineering", investment: 850000, revenue: 2550000, roi: 300 },
          { department: "Data Science", investment: 580000, revenue: 1624000, roi: 280 },
          { department: "Design", investment: 320000, revenue: 864000, roi: 270 },
          { department: "Marketing", investment: 240000, revenue: 624000, roi: 260 },
          { department: "Product", investment: 180000, revenue: 450000, roi: 250 }
        ],
        trainingCostBreakdown: [
          { name: "Course Licenses", value: 45, color: "#2563EB" },
          { name: "Instructor Fees", value: 28, color: "#10B981" },
          { name: "Platform Fees", value: 15, color: "#F59E0B" },
          { name: "Learning Materials", value: 8, color: "#8B5CF6" },
          { name: "Other", value: 4, color: "#EC4899" }
        ],
        skillsDevelopment: [
          { skill: "Technical", current: 78, target: 90 },
          { skill: "Leadership", current: 65, target: 85 },
          { skill: "Communication", current: 72, target: 88 },
          { skill: "Problem Solving", current: 82, target: 92 },
          { skill: "Collaboration", current: 75, target: 87 },
          { skill: "Innovation", current: 68, target: 86 }
        ],
        productivityMetrics: [
          { month: "Jan", before: 72, after: 78 },
          { month: "Feb", before: 73, after: 80 },
          { month: "Mar", before: 74, after: 82 },
          { month: "Apr", before: 75, after: 85 },
          { month: "May", before: 76, after: 88 },
          { month: "Jun", before: 77, after: 91 }
        ],
        cohortComparison: [
          { metric: "Completion Rate", "Q1 2024": 68, "Q2 2024": 72, "Q3 2024": 78 },
          { metric: "Avg. Score", "Q1 2024": 75, "Q2 2024": 78, "Q3 2024": 82 },
          { metric: "Engagement", "Q1 2024": 70, "Q2 2024": 75, "Q3 2024": 80 },
          { metric: "Satisfaction", "Q1 2024": 72, "Q2 2024": 76, "Q3 2024": 81 }
        ],
        keyInsights: [
          {
            title: "High ROI in Engineering",
            description: "Engineering department shows 300% ROI, highest across all departments",
            impact: "positive",
            recommendation: "Consider increasing investment in engineering training programs"
          },
          {
            title: "Improving Completion Rates",
            description: "Overall completion rate increased by 10% over the last quarter",
            impact: "positive",
            recommendation: "Continue current engagement strategies and expand to other cohorts"
          },
          {
            title: "Skills Gap in Leadership",
            description: "Leadership skills are 20 points below target across organization",
            impact: "neutral",
            recommendation: "Implement targeted leadership development programs"
          },
          {
            title: "Strong Productivity Gains",
            description: "Post-training productivity shows 18% average improvement",
            impact: "positive",
            recommendation: "Measure and track long-term productivity impact"
          }
        ]
      };

      const pdfBuffer = await ReportService.generateBusinessReport(reportData);
      
      // Save report record (optional)
      await ReportService.saveReportRecord(
        req.user.id,
        'business_analytics_pdf',
        `business-report-${Date.now()}.pdf`,
        pdfBuffer.length
      );

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=business-analytics-report-${Date.now()}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Error generating business PDF report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF report'
      });
    }
  }

  // Generate Business Analytics CSV Report
  async generateBusinessCSV(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Mock data matching the frontend structure
      const reportData: BusinessReportData = {
        title: 'Business Analytics Report',
        period: req.query.period as string || 'Q2 2024',
        generatedAt: new Date().toLocaleString(),
        generatedBy: req.user.email || 'Unknown User',
        sections: [],
        overviewStats: [
          {
            label: "Total Investment",
            value: "$2.4M",
            change: "+$240K this quarter",
            trend: "up"
          },
          {
            label: "ROI on Training",
            value: "285%",
            change: "+18% from last quarter",
            trend: "up"
          },
          {
            label: "Avg. Training Hours",
            value: "42h",
            change: "+6h from last quarter",
            trend: "up"
          },
          {
            label: "Certification Rate",
            value: "68%",
            change: "+5% from last quarter",
            trend: "up"
          }
        ],
        enrollmentTrend: [],
        departmentROI: [],
        trainingCostBreakdown: [],
        skillsDevelopment: [],
        productivityMetrics: [],
        cohortComparison: [],
        keyInsights: []
      };

      const csvContent = ReportService.generateBusinessCSV(reportData);
      
      // Save report record (optional)
      await ReportService.saveReportRecord(
        req.user.id,
        'business_analytics_csv',
        `business-report-${Date.now()}.csv`,
        csvContent.length
      );

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=business-analytics-report-${Date.now()}.csv`);
      res.setHeader('Content-Length', csvContent.length);

      res.send(csvContent);
    } catch (error: any) {
      console.error('Error generating business CSV report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate CSV report'
      });
    }
  }

  // Generate Instructor Analytics PDF Report
  async generateInstructorPDF(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Mock data matching the frontend structure
      const reportData: InstructorReportData = {
        title: 'Instructor Analytics Report',
        subtitle: 'Course Performance & Student Engagement',
        period: req.query.period as string || 'Last 30 days',
        generatedAt: new Date().toLocaleString(),
        generatedBy: req.user.email || 'Unknown User',
        sections: [],
        overviewStats: [
          {
            label: "Total Views",
            value: "45,234",
            change: "+12.5%",
            trend: "up"
          },
          {
            label: "New Enrollments",
            value: "284",
            change: "+8.2%",
            trend: "up"
          },
          {
            label: "Revenue (30d)",
            value: "$12,450",
            change: "+18.3%",
            trend: "up"
          },
          {
            label: "Avg. Completion",
            value: "78%",
            change: "-2.1%",
            trend: "down"
          }
        ],
        revenueData: [
          { date: "Jan 1", revenue: 850, enrollments: 12 },
          { date: "Jan 8", revenue: 920, enrollments: 18 },
          { date: "Jan 15", revenue: 880, enrollments: 15 },
          { date: "Jan 22", revenue: 1050, enrollments: 22 },
          { date: "Jan 29", revenue: 1120, enrollments: 28 },
          { date: "Feb 5", revenue: 1380, enrollments: 32 },
          { date: "Feb 12", revenue: 1450, enrollments: 35 },
          { date: "Feb 19", revenue: 1520, enrollments: 38 },
          { date: "Feb 26", revenue: 1680, enrollments: 42 },
          { date: "Mar 5", revenue: 1850, enrollments: 48 },
          { date: "Mar 12", revenue: 2100, enrollments: 55 },
          { date: "Mar 19", revenue: 2350, enrollments: 62 }
        ],
        coursePerformance: [
          { 
            name: "Python Masterclass",
            students: 1245,
            revenue: 4890,
            rating: 4.9,
            completion: 85,
            engagement: 92
          },
          { 
            name: "Java DSA",
            students: 856,
            revenue: 3120,
            rating: 4.7,
            completion: 78,
            engagement: 88
          },
          { 
            name: "React Web Dev",
            students: 546,
            revenue: 2840,
            rating: 4.8,
            completion: 72,
            engagement: 85
          },
          { 
            name: "SQL Design",
            students: 200,
            revenue: 1600,
            rating: 4.6,
            completion: 65,
            engagement: 78
          }
        ],
        trafficSources: [
          { name: "Direct", value: 35, color: "#2563EB" },
          { name: "Search", value: 28, color: "#10B981" },
          { name: "Social Media", value: 20, color: "#F59E0B" },
          { name: "Referral", value: 12, color: "#8B5CF6" },
          { name: "Email", value: 5, color: "#EC4899" }
        ],
        studentLocations: [
          { country: "United States", students: 432, percentage: 35 },
          { country: "India", students: 298, percentage: 24 },
          { country: "United Kingdom", students: 186, percentage: 15 },
          { country: "Canada", students: 124, percentage: 10 },
          { country: "Germany", students: 93, percentage: 8 },
          { country: "Others", students: 98, percentage: 8 }
        ],
        engagementData: [
          { day: "Mon", avgTime: 45, completion: 78 },
          { day: "Tue", avgTime: 52, completion: 82 },
          { day: "Wed", avgTime: 38, completion: 75 },
          { day: "Thu", avgTime: 48, completion: 80 },
          { day: "Fri", avgTime: 55, completion: 85 },
          { day: "Sat", avgTime: 62, completion: 88 },
          { day: "Sun", avgTime: 58, completion: 86 }
        ],
        topLessons: [
          { title: "Introduction to Python", views: 2456, avgTime: "12:30", completion: 95 },
          { title: "Variables and Data Types", views: 2234, avgTime: "14:15", completion: 92 },
          { title: "Control Flow", views: 2145, avgTime: "16:20", completion: 88 },
          { title: "Functions in Python", views: 1998, avgTime: "18:45", completion: 85 },
          { title: "Object-Oriented Programming", views: 1876, avgTime: "22:10", completion: 82 }
        ]
      };

      const pdfBuffer = await ReportService.generateInstructorReport(reportData);
      
      // Save report record (optional)
      await ReportService.saveReportRecord(
        req.user.id,
        'instructor_analytics_pdf',
        `instructor-report-${Date.now()}.pdf`,
        pdfBuffer.length
      );

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=instructor-analytics-report-${Date.now()}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Error generating instructor PDF report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF report'
      });
    }
  }

  // Generate Instructor Analytics CSV Report
  async generateInstructorCSV(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Mock data matching the frontend structure
      const reportData: InstructorReportData = {
        title: 'Instructor Analytics Report',
        period: req.query.period as string || 'Last 30 days',
        generatedAt: new Date().toLocaleString(),
        generatedBy: req.user.email || 'Unknown User',
        sections: [],
        overviewStats: [
          {
            label: "Total Views",
            value: "45,234",
            change: "+12.5%",
            trend: "up"
          },
          {
            label: "New Enrollments",
            value: "284",
            change: "+8.2%",
            trend: "up"
          },
          {
            label: "Revenue (30d)",
            value: "$12,450",
            change: "+18.3%",
            trend: "up"
          },
          {
            label: "Avg. Completion",
            value: "78%",
            change: "-2.1%",
            trend: "down"
          }
        ],
        revenueData: [],
        coursePerformance: [],
        trafficSources: [],
        studentLocations: [],
        engagementData: [],
        topLessons: []
      };

      const csvContent = ReportService.generateInstructorCSV(reportData);
      
      // Save report record (optional)
      await ReportService.saveReportRecord(
        req.user.id,
        'instructor_analytics_csv',
        `instructor-report-${Date.now()}.csv`,
        csvContent.length
      );

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=instructor-analytics-report-${Date.now()}.csv`);
      res.setHeader('Content-Length', csvContent.length);

      res.send(csvContent);
    } catch (error: any) {
      console.error('Error generating instructor CSV report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate CSV report'
      });
    }
  }
}
