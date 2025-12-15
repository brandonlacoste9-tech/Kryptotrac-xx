'use client';

import { Sparkles, Shield, Rocket, Scale, Brain, TrendingUp, Bell, BarChart3 } from 'lucide-react';

export default function AIAgentIntro() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02]"></div>
      
      <div className="relative container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <Brain className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-500">AI-Powered Crypto Intelligence</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Meet Cipher: Your AI Crypto Advisor
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Cipher is your personal crypto intelligence agent that proactively monitors 
            your portfolio and answers questions in <span className="text-red-500 font-semibold">100+ languages</span>.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column: Example Queries */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-red-500" />
              Ask Cipher Anything
            </h3>
            
            <div className="space-y-3">
              {
                [
                  { icon: TrendingUp, query: "Should I buy Bitcoin now or wait?" },
                  { icon: BarChart3, query: "What's driving Ethereum's price today?" },
                  { icon: Shield, query: "Analyze my portfolio risk level" },
                  { icon: Bell, query: "Alert me if Solana drops 10%" }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-4 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                        <item.icon className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-gray-300 font-medium group-hover:text-white transition-colors">
                        "{item.query}"
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))
              }
            </div>
            
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold mb-2">Proactive Intelligence</h4>
                  <p className="text-gray-400 text-sm">
                    Cipher doesn't just wait for questions—it actively monitors your portfolio 
                    and sends you insights about market movements, risk levels, and opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Council Mode */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-2xl font-bold text-white">Council Mode</h3>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold">
                PRO+
              </span>
            </div>
            
            <p className="text-gray-400 mb-6">
              Get 3 AI advisors to debate your question and provide different perspectives:
            </p>
            
            <div className="space-y-4">
              {
                [
                  {
                    icon: Shield,
                    name: "Conservative Advisor",
                    description: "Risk-averse strategy focused on capital preservation",
                    color: "blue"
                  },
                  {
                    icon: Rocket,
                    name: "Growth Advisor",
                    description: "Aggressive opportunities for maximum gains",
                    color: "green"
                  },
                  {
                    icon: Scale,
                    name: "Balanced Advisor",
                    description: "Moderate approach balancing risk and reward",
                    color: "purple"
                  }
                ].map((advisor, index) => (
                  <div
                    key={index}
                    className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-${advisor.color}-500/10 border border-${advisor.color}-500/20 flex items-center justify-center`}>
                        <advisor.icon className={`w-6 h-6 text-${advisor.color}-500`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{advisor.name}</h4>
                        <p className="text-gray-400 text-sm">{advisor.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6 mt-6">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                How Council Mode Works
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Ask one question, get three expert perspectives. Cipher's council debates 
                your query and provides consensus recommendations with dissenting opinions clearly marked.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full text-xs text-gray-400">
                  Multiple Perspectives
                </span>
                <span className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full text-xs text-gray-400">
                  Consensus Voting
                </span>
                <span className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-full text-xs text-gray-400">
                  Risk Analysis
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-600/30"
          >
            <Brain className="w-5 h-5" />
            Try Cipher Free Today
          </a>
          <p className="text-gray-500 text-sm mt-3">
            5 free queries/day • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
