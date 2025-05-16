import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Brain, Code, MessageSquare } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const Index = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <MessageSquare className="w-64 h-64 text-primary" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
          <Brain className="w-64 h-64 text-primary" />
        </div>
        <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <Code className="w-56 h-56 text-primary" />
        </div>
      </div>
      
      <SignedIn>
        <Navigate to="/chat" replace />
      </SignedIn>
      <SignedOut>
        <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 p-4 sm:p-6 relative z-10">
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-xl">
            <div className="inline-flex items-center justify-center lg:justify-start gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-8 h-8 text-primary"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" 
                  />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                AI Chat Assistant
              </h1>
            </div>
            
            <div className="space-y-4 px-4 sm:px-0">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Your Personal AI Assistant
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Experience the power of AI, delivering intelligent conversations 
                and helpful responses tailored to your needs.
              </p>
              <div className="flex flex-col gap-3 text-muted-foreground max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-3 bg-card/50 p-3 rounded-lg border border-border/50 backdrop-blur-sm">
                  <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <span>Advanced reasoning & problem-solving</span>
                </div>
                <div className="flex items-center gap-3 bg-card/50 p-3 rounded-lg border border-border/50 backdrop-blur-sm">
                  <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <span>Real-time conversation</span>
                </div>
                <div className="flex items-center gap-3 bg-card/50 p-3 rounded-lg border border-border/50 backdrop-blur-sm">
                  <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                    <Code className="w-5 h-5 text-primary" />
                  </div>
                    <span>Code generation & technical assistance</span>
                    </div>
             </div>
           </div>
         </div>
         <div className="w-full max-w-md mt-8 lg:mt-0">
           <div className={`bg-card rounded-xl overflow-hidden shadow-xl border border-border ${theme === 'dark' ? 'shadow-primary/10' : 'shadow-primary/5'}`}>
             <div className="p-4 sm:p-0">
               <SignIn routing="path" path="/" />
             </div>
           </div>
           <p className="text-center text-xs text-muted-foreground mt-4">
             Secure authentication powered by Clerk
           </p>
         </div>
       </div>
     </SignedOut>
     
     {/* Bottom pattern */}
     <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
   </div>
 );
};

export default Index;