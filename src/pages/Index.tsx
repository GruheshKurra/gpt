
import { SignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <SignedIn>
        <Navigate to="/chat" replace />
      </SignedIn>
      <SignedOut>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chat Assistant</h1>
          <p className="text-gray-600">Powered by Llama 3.3</p>
        </div>
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
          <SignIn routing="path" path="/" />
        </div>
      </SignedOut>
    </div>
  );
};

export default Index;
